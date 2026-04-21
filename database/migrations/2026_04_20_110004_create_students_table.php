<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->string('roll_number', 40);
            $table->string('first_name', 80);
            $table->string('last_name', 80);
            $table->string('email', 180)->nullable();
            $table->string('phone', 30)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->string('guardian_name', 120)->nullable();
            $table->string('guardian_phone', 30)->nullable();
            $table->text('address')->nullable();
            $table->unsignedSmallInteger('admission_year')->nullable();
            $table->enum('status', ['active', 'graduated', 'transferred', 'dropped'])->default('active');
            $table->timestamps();

            $table->unique(['section_id', 'roll_number']);
            $table->unique(['institution_id', 'email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
