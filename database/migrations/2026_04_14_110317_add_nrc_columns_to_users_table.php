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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedTinyInteger('nrc_region')->nullable()->after('phone_number');
            $table->foreignId('nrc_township_id')->nullable()->constrained('nrc_townships')->after('nrc_region');
            $table->enum('nrc_type', ['N', 'P', 'E', 'T'])->nullable()->after('nrc_township_id');
            $table->string('nrc_number', 6)->nullable()->after('nrc_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['nrc_township_id']);
            $table->dropColumn(['nrc_region', 'nrc_township_id', 'nrc_type', 'nrc_number']);
        });
    }
};
