<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UserAccountController extends Controller
{
    public function created(): Response
    {
        return Inertia::render('UserAccounts/Created', [
            'credentials' => session('credentials'),
        ]);
    }

    public function createForTeacher(Teacher $teacher): RedirectResponse
    {
        if ($teacher->user()->exists()) {
            return back()->with('error', "{$teacher->full_name} already has a login account.");
        }

        if (empty($teacher->email)) {
            return back()->with('error', 'Teacher must have an email address. Please update the teacher record first.');
        }

        if (User::where('email', $teacher->email)->exists()) {
            return back()->with('error', "The email {$teacher->email} is already used by another account.");
        }

        $password = $this->generatePassword();

        User::create([
            'name'              => $teacher->full_name,
            'email'             => $teacher->email,
            'password'          => $password,
            'role'              => 'teacher',
            'institution_id'    => $teacher->institution_id,
            'teacher_id'        => $teacher->id,
            'is_active'         => true,
            'email_verified_at' => now(),
        ]);

        return redirect()->route('accounts.created')->with('credentials', [
            'name'     => $teacher->full_name,
            'email'    => $teacher->email,
            'password' => $password,
            'role'     => 'Teacher',
        ]);
    }

    public function destroyForTeacher(Teacher $teacher): RedirectResponse
    {
        $teacher->user()->delete();

        return redirect()->route('teachers.index')
            ->with('success', "Login account for {$teacher->full_name} has been removed.");
    }

    public function createForStudent(Student $student): RedirectResponse
    {
        if ($student->user()->exists()) {
            return back()->with('error', "{$student->full_name} already has a login account.");
        }

        if (empty($student->email)) {
            return back()->with('error', 'Student must have an email address. Please update the student record first.');
        }

        if (User::where('email', $student->email)->exists()) {
            return back()->with('error', "The email {$student->email} is already used by another account.");
        }

        $password = $this->generatePassword();

        User::create([
            'name'              => $student->full_name,
            'email'             => $student->email,
            'password'          => $password,
            'role'              => 'student',
            'institution_id'    => $student->institution_id,
            'student_id'        => $student->id,
            'is_active'         => true,
            'email_verified_at' => now(),
        ]);

        return redirect()->route('accounts.created')->with('credentials', [
            'name'     => $student->full_name,
            'email'    => $student->email,
            'password' => $password,
            'role'     => 'Student',
        ]);
    }

    public function destroyForStudent(Student $student): RedirectResponse
    {
        $student->user()->delete();

        return redirect()->route('students.index')
            ->with('success', "Login account for {$student->full_name} has been removed.");
    }

    private function generatePassword(): string
    {
        return ucfirst(Str::lower(Str::random(5))) . rand(100, 999) . '@';
    }
}
