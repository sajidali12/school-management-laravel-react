<?php

namespace App\Http\Controllers;

use App\Models\FeeCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class FeeCategoryController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->string('search')->trim()->toString();

        $categories = FeeCategory::query()
            ->withCount('structures')
            ->when($search !== '', fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Fees/Categories/Index', [
            'categories' => $categories,
            'filters' => ['search' => $search],
        ]);
    }

    public function create()
    {
        return Inertia::render('Fees/Categories/Form', ['category' => null]);
    }

    public function store(Request $request)
    {
        FeeCategory::create($this->validated($request));

        return redirect()->route('fee-categories.index')->with('success', 'Fee category created.');
    }

    public function edit(FeeCategory $feeCategory)
    {
        return Inertia::render('Fees/Categories/Form', ['category' => $feeCategory]);
    }

    public function update(Request $request, FeeCategory $feeCategory)
    {
        $feeCategory->update($this->validated($request, $feeCategory->id));

        return redirect()->route('fee-categories.index')->with('success', 'Fee category updated.');
    }

    public function destroy(FeeCategory $feeCategory)
    {
        $feeCategory->delete();

        return redirect()->route('fee-categories.index')->with('success', 'Fee category deleted.');
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $institutionId = app('currentInstitution')->id ?? null;

        return $request->validate([
            'name' => ['required', 'string', 'max:80', Rule::unique('fee_categories', 'name')->where('institution_id', $institutionId)->ignore($ignoreId)],
            'description' => ['nullable', 'string', 'max:255'],
            'frequency' => ['required', 'in:monthly,quarterly,annual,one_time'],
            'is_active' => ['required', 'boolean'],
        ]);
    }
}
