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
        Schema::create('nrc_townships', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('region_code');
            $table->string('township_code', 16);
            $table->string('township_en', 100);
            $table->string('township_mm', 100);
            $table->timestamps();

            $table->unique(['region_code', 'township_code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nrc_townships');
    }
};
