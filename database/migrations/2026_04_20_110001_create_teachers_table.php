<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->string('employee_id', 30);
            $table->string('first_name', 80);
            $table->string('last_name', 80);
            $table->string('email', 180);
            $table->string('phone', 30)->nullable();
            $table->string('designation', 80)->nullable();
            $table->string('qualification', 150)->nullable();
            $table->string('specialization', 150)->nullable();
            $table->date('joining_date')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->text('address')->nullable();
            $table->enum('status', ['active', 'on_leave', 'inactive'])->default('active');
            $table->timestamps();

            $table->unique(['institution_id', 'employee_id']);
            $table->unique(['institution_id', 'email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};
