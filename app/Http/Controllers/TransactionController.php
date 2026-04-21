<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\ExpenseCategory;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->string('search')->trim()->toString();
        $typeFilter = $request->input('type');
        $accountFilter = $request->input('account_id');
        $from = $request->input('from');
        $to = $request->input('to');

        $transactions = Transaction::query()
            ->with(['account:id,name', 'expenseCategory:id,name'])
            ->when($search !== '', fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('reference', 'like', "%{$search}%");
            }))
            ->when($typeFilter, fn ($q) => $q->where('type', $typeFilter))
            ->when($accountFilter, fn ($q) => $q->where('account_id', $accountFilter))
            ->when($from, fn ($q) => $q->where('date', '>=', $from))
            ->when($to, fn ($q) => $q->where('date', '<=', $to))
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        $summary = [
            'income' => (float) Transaction::where('type', 'income')->sum('amount'),
            'expense' => (float) Transaction::where('type', 'expense')->sum('amount'),
        ];
        $summary['balance'] = $summary['income'] - $summary['expense']
            + (float) Account::sum('opening_balance');

        return Inertia::render('Accounts/Transactions/Index', [
            'transactions' => $transactions,
            'filters' => [
                'search' => $search,
                'type' => $typeFilter,
                'account_id' => $accountFilter,
                'from' => $from,
                'to' => $to,
            ],
            'accounts' => Account::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'categories' => ExpenseCategory::orderBy('name')->get(['id', 'name']),
            'summary' => $summary,
        ]);
    }

    public function create()
    {
        return Inertia::render('Accounts/Transactions/Form', [
            'transaction' => null,
            'accounts' => Account::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'categories' => ExpenseCategory::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        Transaction::create($this->validated($request));

        return redirect()->route('transactions.index')->with('success', 'Transaction recorded.');
    }

    public function edit(Transaction $transaction)
    {
        return Inertia::render('Accounts/Transactions/Form', [
            'transaction' => $transaction,
            'accounts' => Account::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'categories' => ExpenseCategory::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Transaction $transaction)
    {
        $transaction->update($this->validated($request));

        return redirect()->route('transactions.index')->with('success', 'Transaction updated.');
    }

    public function destroy(Transaction $transaction)
    {
        if ($transaction->source_type) {
            return back()->with('error', 'Cannot delete a linked transaction (e.g. fee payment).');
        }

        $transaction->delete();

        return back()->with('success', 'Transaction deleted.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'account_id' => ['required', 'integer', 'exists:accounts,id'],
            'expense_category_id' => ['nullable', 'integer', 'exists:expense_categories,id'],
            'type' => ['required', 'in:income,expense'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'date' => ['required', 'date'],
            'description' => ['required', 'string', 'max:160'],
            'reference' => ['nullable', 'string', 'max:80'],
        ]);
    }
}
