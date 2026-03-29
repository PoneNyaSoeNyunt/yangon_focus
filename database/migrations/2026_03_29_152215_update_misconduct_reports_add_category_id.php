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
            $table->dropColumn('reason_category');
            $table->foreignId('category_id')->nullable()->after('offender_id')->constrained('report_categories')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('misconduct_reports', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
            $table->enum('reason_category', ['Unpaid Rent', 'Property Damage', 'House Rule Violation', 'Other'])->after('offender_id');
        });
    }
};
