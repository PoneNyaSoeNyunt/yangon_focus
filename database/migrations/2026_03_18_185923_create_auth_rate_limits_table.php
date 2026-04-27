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
        Schema::create('auth_rate_limits', function (Blueprint $table) {
            $table->string('phone_number')->primary();
            $table->integer('failed_attempts')->default(0);
            $table->integer('lockout_level')->default(0);
            $table->timestamp('unlock_at')->nullable();
            $table->timestamp('last_attempt_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auth_rate_limits');
    }
};
