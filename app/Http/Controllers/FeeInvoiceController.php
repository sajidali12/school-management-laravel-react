<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\FeeInvoice;
use App\Models\FeePayment;
use App\Models\FeeStructure;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FeeInvoiceController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->string('search')->trim()->toString();
        $statusFilter = $request->input('status');
        $classFilter = $request->input('school_class_id');

        $invoices = FeeInvoice::query()
            ->with(['student:id,first_name,last_name,roll_number,section_id', 'student.section:id,name,school_class_id', 'student.section.schoolClass:id,name'])
            ->when($search !== '', fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                    ->orWhereHas('student', fn ($q) => $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('roll_number', 'like', "%{$search}%"));
            }))
            ->when($statusFilter, fn ($q) => $q->where('status', $statusFilter))
            ->when($classFilter, fn ($q) => $q->whereHas('student.section', fn ($q) => $q->where('school_class_id', $classFilter)))
            ->orderByDesc('issue_date')
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total' => (float) FeeInvoice::sum('total_amount'),
            'collected' => (float) FeeInvoice::sum('paid_amount'),
            'pending' => (float) FeeInvoice::whereIn('status', ['pending', 'partial', 'overdue'])->selectRaw('SUM(total_amount - paid_amount) as due')->value('due') ?? 0,
            'overdue_count' => FeeInvoice::where('status', 'overdue')->count(),
        ];

        return Inertia::render('Fees/Invoices/Index', [
            'invoices' => $invoices,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'school_class_id' => $classFilter,
            ],
            'classes' => SchoolClass::orderBy('level')->orderBy('name')->get(['id', 'name']),
            'stats' => $stats,
        ]);
    }

    public function show(FeeInvoice $feeInvoice)
    {
        $feeInvoice->load([
            'student:id,first_name,last_name,roll_number,guardian_name,phone,section_id',
            'student.section:id,name,school_class_id',
            'student.section.schoolClass:id,name',
            'items.feeCategory:id,name',
            'payments' => fn ($q) => $q->orderByDesc('payment_date'),
            'payments.account:id,name',
        ]);

        $institution = app('currentInstitution');

        return Inertia::render('Fees/Invoices/Show', [
            'invoice' => $feeInvoice,
            'accounts' => Account::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'school' => [
                'name' => $institution->name,
                'logo_url' => $institution->logoUrl(),
                'tagline' => $institution->tagline,
                'address' => $institution->address,
                'city' => $institution->city,
                'phone' => $institution->phone,
                'email' => $institution->email,
                'website' => $institution->website,
                'registration_number' => $institution->registration_number,
                'currency' => $institution->currency,
            ],
        ]);
    }

    public function generate(Request $request)
    {
        $data = $request->validate([
            'school_class_id' => ['required', 'integer', 'exists:school_classes,id'],
            'period' => ['required', 'string', 'max:20'],
            'issue_date' => ['required', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:issue_date'],
        ]);

        $institutionId = app('currentInstitution')->id;
        $class = SchoolClass::findOrFail($data['school_class_id']);

        $structures = FeeStructure::with('feeCategory')
            ->where('school_class_id', $class->id)
            ->get();

        if ($structures->isEmpty()) {
            return back()->with('error', 'No fee structure configured for this class.');
        }

        $students = Student::whereHas('section', fn ($q) => $q->where('school_class_id', $class->id))
            ->where('status', 'active')
            ->get();

        $total = $structures->sum(fn ($s) => (float) $s->amount);
        $created = 0;

        DB::transaction(function () use ($students, $structures, $data, $total, $institutionId, &$created) {
            foreach ($students as $student) {
                $exists = FeeInvoice::where('student_id', $student->id)
                    ->where('period', $data['period'])
                    ->exists();
                if ($exists) {
                    continue;
                }

                $number = date('Ymd') . str_pad((string) ($student->id * 10 + random_int(0, 9)), 6, '0', STR_PAD_LEFT);

                $invoice = FeeInvoice::create([
                    'institution_id' => $institutionId,
                    'student_id' => $student->id,
                    'invoice_number' => $number,
                    'issue_date' => $data['issue_date'],
                    'due_date' => $data['due_date'],
                    'period' => $data['period'],
                    'total_amount' => $total,
                    'paid_amount' => 0,
                    'status' => 'pending',
                ]);

                foreach ($structures as $s) {
                    $invoice->items()->create([
                        'fee_category_id' => $s->fee_category_id,
                        'description' => $s->feeCategory->name,
                        'amount' => $s->amount,
                    ]);
                }
                $created++;
            }
        });

        return back()->with('success', "Generated {$created} invoices.");
    }

    public function recordPayment(Request $request, FeeInvoice $feeInvoice)
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_date' => ['required', 'date'],
            'method' => ['required', 'in:cash,bank_transfer,cheque,card,online'],
            'reference' => ['nullable', 'string', 'max:80'],
            'account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'notes' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($feeInvoice, $data) {
            $payment = $feeInvoice->payments()->create([
                'institution_id' => $feeInvoice->institution_id,
                'amount' => $data['amount'],
                'payment_date' => $data['payment_date'],
                'method' => $data['method'],
                'reference' => $data['reference'] ?? null,
                'account_id' => $data['account_id'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            if ($payment->account_id) {
                Transaction::create([
                    'institution_id' => $feeInvoice->institution_id,
                    'account_id' => $payment->account_id,
                    'type' => 'income',
                    'amount' => $payment->amount,
                    'date' => $payment->payment_date,
                    'description' => "Fee payment #{$feeInvoice->invoice_number}",
                    'reference' => $payment->reference,
                    'source_type' => FeePayment::class,
                    'source_id' => $payment->id,
                ]);
            }

            $feeInvoice->refreshPaidStatus();
        });

        return redirect()->route('fee-invoices.show', $feeInvoice)->with('success', 'Payment recorded.');
    }

    public function destroy(FeeInvoice $feeInvoice)
    {
        $feeInvoice->delete();

        return redirect()->route('fee-invoices.index')->with('success', 'Invoice deleted.');
    }
}
