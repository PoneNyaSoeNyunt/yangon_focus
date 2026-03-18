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
        Schema::create('hostels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('address');
            $table->text('house_rules')->nullable();
            $table->enum('type', ['Male Only', 'Female Only', 'Mixed']);
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('township_id')->constrained('townships')->onDelete('cascade');
            $table->foreignId('listing_status_id')->constrained('status_codes')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hostels');
    }
};
