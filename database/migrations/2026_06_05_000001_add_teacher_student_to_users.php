<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Extend the role enum to include teacher and student
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin','institution_admin','staff','teacher','student') DEFAULT 'staff'");

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('teacher_id')->nullable()->unique()->after('institution_id')
                ->constrained('teachers')->nullOnDelete();
            $table->foreignId('student_id')->nullable()->unique()->after('teacher_id')
                ->constrained('students')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['teacher_id']);
            $table->dropForeign(['student_id']);
            $table->dropColumn(['teacher_id', 'student_id']);
        });

        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin','institution_admin','staff') DEFAULT 'staff'");
    }
};
