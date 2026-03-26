<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('misconduct_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('offender_id')->constrained('users')->onDelete('cascade');
            $table->enum('reason_category', ['Unpaid Rent', 'Property Damage', 'House Rule Violation', 'Other']);
            $table->text('description')->nullable();
            $table->string('evidence_url');
            $table->enum('status', ['Open', 'Resolved', 'Action Taken'])->default('Open');
            $table->text('admin_note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('misconduct_reports');
    }
};
