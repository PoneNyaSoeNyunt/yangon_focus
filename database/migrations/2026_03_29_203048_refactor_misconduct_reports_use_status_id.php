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
        Schema::table('misconduct_reports', function (Blueprint $table) {
            $table->dropColumn('status');
            $table->unsignedBigInteger('status_id')->default(14)->after('evidence_url');
            $table->foreign('status_id')->references('id')->on('status_codes')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('misconduct_reports', function (Blueprint $table) {
            $table->dropForeign(['status_id']);
            $table->dropColumn('status_id');
            $table->enum('status', ['Open', 'Resolved', 'Action Taken'])->default('Open')->after('evidence_url');
        });
    }
};
