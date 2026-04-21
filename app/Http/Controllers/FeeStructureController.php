<?php

namespace App\Http\Controllers;

use App\Models\FeeCategory;
use App\Models\FeeStructure;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeeStructureController extends Controller
{
    public function index(Request $request)
    {
        $classId = $request->input('school_class_id');

        $classes = SchoolClass::orderBy('level')->orderBy('name')->get(['id', 'name']);
        $selected = $classId
            ? $classes->firstWhere('id', (int) $classId)
            : $classes->first();

        $rows = $selected
            ? FeeStructure::with('feeCategory')->where('school_class_id', $selected->id)->get()
            : collect();

        return Inertia::render('Fees/Structures/Index', [
            'classes' => $classes,
            'selectedClassId' => $selected?->id,
            'structures' => $rows,
            'categories' => FeeCategory::where('is_active', true)->orderBy('name')->get(['id', 'name', 'frequency']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'school_class_id' => ['required', 'integer', 'exists:school_classes,id'],
            'fee_category_id' => ['required', 'integer', 'exists:fee_categories,id'],
            'amount' => ['required', 'numeric', 'min:0', 'max:9999999.99'],
        ]);

        FeeStructure::updateOrCreate(
            [
                'school_class_id' => $data['school_class_id'],
                'fee_category_id' => $data['fee_category_id'],
            ],
            ['amount' => $data['amount']],
        );

        return back()->with('success', 'Fee structure saved.');
    }

    public function destroy(FeeStructure $feeStructure)
    {
        $classId = $feeStructure->school_class_id;
        $feeStructure->delete();

        return redirect()->route('fee-structures.index', ['school_class_id' => $classId])
            ->with('success', 'Removed from structure.');
    }
}
