<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->string('name', 80);
            $table->enum('type', ['cash', 'bank', 'wallet'])->default('cash');
            $table->string('account_number', 40)->nullable();
            $table->string('bank_name', 80)->nullable();
            $table->decimal('opening_balance', 14, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['institution_id', 'name']);
        });

        Schema::create('expense_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->string('name', 80);
            $table->string('description')->nullable();
            $table->timestamps();
            $table->unique(['institution_id', 'name']);
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('expense_category_id')->nullable()->constrained('expense_categories')->nullOnDelete();
            $table->enum('type', ['income', 'expense', 'transfer'])->default('expense');
            $table->decimal('amount', 12, 2);
            $table->date('date');
            $table->string('description', 160);
            $table->string('reference', 80)->nullable();
            $table->nullableMorphs('source');
            $table->timestamps();
            $table->index(['institution_id', 'type', 'date']);
        });

        Schema::table('fee_payments', function (Blueprint $table) {
            $table->foreign('account_id')->references('id')->on('accounts')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('fee_payments', function (Blueprint $table) {
            $table->dropForeign(['account_id']);
        });
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('expense_categories');
        Schema::dropIfExists('accounts');
    }
};
