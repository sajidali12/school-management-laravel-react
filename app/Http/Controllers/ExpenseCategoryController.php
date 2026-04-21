<?php

namespace App\Http\Controllers;

use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ExpenseCategoryController extends Controller
{
    public function index()
    {
        $categories = ExpenseCategory::orderBy('name')->get();

        return Inertia::render('Accounts/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        ExpenseCategory::create($this->validated($request));

        return back()->with('success', 'Category created.');
    }

    public function update(Request $request, ExpenseCategory $expenseCategory)
    {
        $expenseCategory->update($this->validated($request, $expenseCategory->id));

        return back()->with('success', 'Category updated.');
    }

    public function destroy(ExpenseCategory $expenseCategory)
    {
        $expenseCategory->delete();

        return back()->with('success', 'Category deleted.');
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $institutionId = app('currentInstitution')->id ?? null;

        return $request->validate([
            'name' => ['required', 'string', 'max:80', Rule::unique('expense_categories', 'name')->where('institution_id', $institutionId)->ignore($ignoreId)],
            'description' => ['nullable', 'string', 'max:255'],
        ]);
    }
}
