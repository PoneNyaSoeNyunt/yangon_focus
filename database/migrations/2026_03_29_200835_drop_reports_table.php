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
        Schema::dropIfExists('reports');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id('report_id');
            $table->foreignId('reporter_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('offender_id')->constrained('users')->onDelete('cascade');
            $table->enum('reason_category', ['Unpaid Rent', 'Property Damage', 'House Rule Violation', 'Other']);
            $table->text('description');
            $table->string('evidence_url')->nullable();
            $table->foreignId('report_status_id')->constrained('status_codes')->onDelete('cascade');
            $table->timestamps();
        });
    }
};
