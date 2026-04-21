<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('institutions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo_path')->nullable();
            $table->string('primary_color', 7)->default('#4f46e5');
            $table->enum('status', ['pending', 'active', 'suspended'])->default('pending');
            $table->string('tagline')->nullable();
            $table->string('principal_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('website')->nullable();
            $table->string('city', 60)->nullable();
            $table->text('address')->nullable();
            $table->string('registration_number', 60)->nullable();
            $table->unsignedSmallInteger('established_year')->nullable();
            $table->string('currency', 6)->default('PKR');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('institutions');
    }
};
