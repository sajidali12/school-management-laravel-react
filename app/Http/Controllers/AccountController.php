<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function index()
    {
        $accounts = Account::orderBy('name')->get();

        return Inertia::render('Accounts/Index', [
            'accounts' => $accounts,
        ]);
    }

    public function create()
    {
        return Inertia::render('Accounts/Form', ['account' => null]);
    }

    public function store(Request $request)
    {
        Account::create($this->validated($request));

        return redirect()->route('accounts.index')->with('success', 'Account created.');
    }

    public function edit(Account $account)
    {
        return Inertia::render('Accounts/Form', ['account' => $account]);
    }

    public function update(Request $request, Account $account)
    {
        $account->update($this->validated($request, $account->id));

        return redirect()->route('accounts.index')->with('success', 'Account updated.');
    }

    public function destroy(Account $account)
    {
        $account->delete();

        return redirect()->route('accounts.index')->with('success', 'Account deleted.');
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $institutionId = app('currentInstitution')->id ?? null;

        return $request->validate([
            'name' => ['required', 'string', 'max:80', Rule::unique('accounts', 'name')->where('institution_id', $institutionId)->ignore($ignoreId)],
            'type' => ['required', 'in:cash,bank,wallet'],
            'account_number' => ['nullable', 'string', 'max:40'],
            'bank_name' => ['nullable', 'string', 'max:80'],
            'opening_balance' => ['required', 'numeric', 'min:0'],
            'is_active' => ['required', 'boolean'],
        ]);
    }
}
