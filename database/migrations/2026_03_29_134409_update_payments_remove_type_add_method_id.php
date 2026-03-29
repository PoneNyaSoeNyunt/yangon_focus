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
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['type', 'transaction_id']);
            $table->foreignId('hostel_payment_method_id')->nullable()->after('payment_method')
                ->constrained('hostel_payment_methods')->onDelete('set null');
            $table->boolean('is_advance')->default(false)->after('hostel_payment_method_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['hostel_payment_method_id']);
            $table->dropColumn(['hostel_payment_method_id', 'is_advance']);
            $table->enum('type', ['KBZPay', 'WaveMoney', 'Bank Transfer', 'Cash', 'Advance'])->after('id');
            $table->string('transaction_id')->nullable()->after('screenshot_url');
        });
    }
};
