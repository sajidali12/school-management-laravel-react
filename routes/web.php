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
use App\Http\Controllers\StaffAttendanceController;
use App\Http\Controllers\Student\AssignmentController as StudentAssignmentController;
use App\Http\Controllers\Student\AttendanceController as StudentAttendancePortalController;
use App\Http\Controllers\Student\LessonPlanController as StudentLessonPlanController;
use App\Http\Controllers\StudentAttendanceController;
use App\Http\Controllers\Teacher\AssignmentController as TeacherAssignmentController;
use App\Http\Controllers\Teacher\LessonPlanController as TeacherLessonPlanController;
use App\Http\Controllers\StudentPortalController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\Teacher\AttendanceController as TeacherAttendanceController;
use App\Http\Controllers\Teacher\StudentAttendanceController as TeacherStudentAttendanceController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\TeacherPortalController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserAccountController;
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

    // Staff attendance (admin)
    Route::get('/staff-attendance', [StaffAttendanceController::class, 'index'])->name('staff-attendance.index');
    Route::post('/staff-attendance', [StaffAttendanceController::class, 'store'])->name('staff-attendance.store');
    Route::put('/staff-attendance/{staffAttendance}', [StaffAttendanceController::class, 'update'])->name('staff-attendance.update');
    Route::post('/staff-attendance/mark-all-present', [StaffAttendanceController::class, 'markAllPresent'])->name('staff-attendance.mark-all');

    // Student attendance (admin view)
    Route::get('/student-attendance', [StudentAttendanceController::class, 'index'])->name('student-attendance.index');
    Route::patch('/student-attendance/records/{record}', [StudentAttendanceController::class, 'updateRecord'])->name('student-attendance.record.update');

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

// Account creation (institution admin only)
Route::middleware(['auth', 'verified', 'institution_active', 'institution_admin'])->group(function () {
    Route::post('/teachers/{teacher}/account', [UserAccountController::class, 'createForTeacher'])->name('teachers.account.create');
    Route::delete('/teachers/{teacher}/account', [UserAccountController::class, 'destroyForTeacher'])->name('teachers.account.destroy');
    Route::post('/students/{student}/account', [UserAccountController::class, 'createForStudent'])->name('students.account.create');
    Route::delete('/students/{student}/account', [UserAccountController::class, 'destroyForStudent'])->name('students.account.destroy');
});

// Credentials display (one-time, after account creation)
Route::middleware(['auth', 'verified'])->get('/accounts/created', [UserAccountController::class, 'created'])->name('accounts.created');

// Teacher portal
Route::middleware(['auth', 'verified', 'institution_active', 'teacher'])->prefix('teacher')->name('teacher.')->group(function () {
    Route::get('/dashboard', TeacherPortalController::class)->name('dashboard');
    Route::get('/attendance', [TeacherAttendanceController::class, 'index'])->name('attendance.index');
    Route::post('/attendance/check-in', [TeacherAttendanceController::class, 'checkIn'])->name('attendance.check-in');
    Route::post('/attendance/check-out', [TeacherAttendanceController::class, 'checkOut'])->name('attendance.check-out');

    Route::get('/student-attendance', [TeacherStudentAttendanceController::class, 'index'])->name('student-attendance.index');
    Route::get('/student-attendance/take', [TeacherStudentAttendanceController::class, 'take'])->name('student-attendance.take');
    Route::post('/student-attendance', [TeacherStudentAttendanceController::class, 'store'])->name('student-attendance.store');

    Route::resource('lesson-plans', TeacherLessonPlanController::class)->except('show')
        ->names([
            'index'   => 'lesson-plans.index',
            'create'  => 'lesson-plans.create',
            'store'   => 'lesson-plans.store',
            'edit'    => 'lesson-plans.edit',
            'update'  => 'lesson-plans.update',
            'destroy' => 'lesson-plans.destroy',
        ]);

    Route::resource('assignments', TeacherAssignmentController::class)->except('show')
        ->names([
            'index'   => 'assignments.index',
            'create'  => 'assignments.create',
            'store'   => 'assignments.store',
            'edit'    => 'assignments.edit',
            'update'  => 'assignments.update',
            'destroy' => 'assignments.destroy',
        ]);
    Route::get('/assignments/{assignment}/submissions', [TeacherAssignmentController::class, 'submissions'])->name('assignments.submissions');
    Route::patch('/assignment-submissions/{submission}/grade', [TeacherAssignmentController::class, 'gradeSubmission'])->name('assignments.grade');
});

// Student portal


// Student portal
Route::middleware(['auth', 'verified', 'institution_active', 'student'])->prefix('student')->name('student.')->group(function () {
    Route::get('/dashboard', StudentPortalController::class)->name('dashboard');
    Route::get('/attendance', [StudentAttendancePortalController::class, 'index'])->name('attendance.index');
    Route::get('/lesson-plans', [StudentLessonPlanController::class, 'index'])->name('lesson-plans.index');
    Route::get('/assignments', [StudentAssignmentController::class, 'index'])->name('assignments.index');
    Route::post('/assignments/{assignment}/submit', [StudentAssignmentController::class, 'submit'])->name('assignments.submit');
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
