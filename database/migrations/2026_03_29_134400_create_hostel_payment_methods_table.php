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
        Schema::create('hostel_payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hostel_id')->constrained('hostels')->onDelete('cascade');
            $table->string('method_name', 100);
            $table->string('account_number', 50);
            $table->string('account_name', 100);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hostel_payment_methods');
    }
};
