<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('auth_rate_limits', function (Blueprint $table) {
            $table->dropForeign('auth_rate_limits_phone_number_foreign');
        });
    }

    public function down(): void
    {
        Schema::table('auth_rate_limits', function (Blueprint $table) {
            $table->foreign('phone_number')
                  ->references('phone_number')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }
};
