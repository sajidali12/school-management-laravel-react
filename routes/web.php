<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\Admin\InstitutionApprovalController;
use App\Http\Controllers\BrandingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseCategoryController;
use App\Http\Controllers\FeeCategoryController;
use App\Http\Controllers\FeeInvoiceController;
use App\Http\Controllers\FeeStructureController;
use App\Http\Controllers\InstitutionRegistrationController;
use App\Http\Controllers\InstitutionSettingsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SchoolClassController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Welcome'))->name('home');

Route::get('/register-institution', [InstitutionRegistrationController::class, 'create'])
    ->name('institutions.register');
Route::post('/register-institution', [InstitutionRegistrationController::class, 'store']);
Route::get('/register-institution/pending/{institution:slug}', [InstitutionRegistrationController::class, 'pending'])
    ->name('institutions.pending');

Route::middleware(['auth', 'verified', 'institution_active'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::resource('classes', SchoolClassController::class)
        ->except('show')
        ->parameters(['classes' => 'schoolClass']);
    Route::resource('sections', SectionController::class)->except('show');
    Route::resource('teachers', TeacherController::class)->except('show');
    Route::resource('subjects', SubjectController::class)->except('show');
    Route::resource('students', StudentController::class)->except('show');

    // Fees
    Route::resource('fee-categories', FeeCategoryController::class)->except('show');
    Route::get('/fee-structures', [FeeStructureController::class, 'index'])->name('fee-structures.index');
    Route::post('/fee-structures', [FeeStructureController::class, 'store'])->name('fee-structures.store');
    Route::delete('/fee-structures/{feeStructure}', [FeeStructureController::class, 'destroy'])->name('fee-structures.destroy');

    Route::get('/fee-invoices', [FeeInvoiceController::class, 'index'])->name('fee-invoices.index');
    Route::get('/fee-invoices/{feeInvoice}', [FeeInvoiceController::class, 'show'])->name('fee-invoices.show');
    Route::post('/fee-invoices/generate', [FeeInvoiceController::class, 'generate'])->name('fee-invoices.generate');
    Route::post('/fee-invoices/{feeInvoice}/payment', [FeeInvoiceController::class, 'recordPayment'])->name('fee-invoices.payment');
    Route::delete('/fee-invoices/{feeInvoice}', [FeeInvoiceController::class, 'destroy'])->name('fee-invoices.destroy');

    // Accounts
    Route::resource('accounts', AccountController::class)->except('show');
    Route::resource('expense-categories', ExpenseCategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('transactions', TransactionController::class)->except('show');

    Route::middleware('institution_admin')->group(function () {
        Route::get('/settings', [InstitutionSettingsController::class, 'edit'])->name('settings.edit');
        Route::post('/settings/general', [InstitutionSettingsController::class, 'updateGeneral'])->name('settings.general');
        Route::patch('/settings/contact', [InstitutionSettingsController::class, 'updateContact'])->name('settings.contact');
        Route::patch('/settings/academic', [InstitutionSettingsController::class, 'updateAcademic'])->name('settings.academic');
        Route::patch('/settings/account', [InstitutionSettingsController::class, 'updateAccount'])->name('settings.account');
        Route::patch('/settings/password', [InstitutionSettingsController::class, 'updatePassword'])->name('settings.password');

        Route::get('/settings/branding', [BrandingController::class, 'edit'])->name('branding.edit');
        Route::patch('/settings/branding', [BrandingController::class, 'update'])->name('branding.update');
    });
});

Route::middleware(['auth', 'super_admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/institutions', [InstitutionApprovalController::class, 'index'])->name('institutions.index');
    Route::patch('/institutions/{institution}/approve', [InstitutionApprovalController::class, 'approve'])->name('institutions.approve');
    Route::patch('/institutions/{institution}/reject', [InstitutionApprovalController::class, 'reject'])->name('institutions.reject');
    Route::patch('/institutions/{institution}/suspend', [InstitutionApprovalController::class, 'suspend'])->name('institutions.suspend');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
