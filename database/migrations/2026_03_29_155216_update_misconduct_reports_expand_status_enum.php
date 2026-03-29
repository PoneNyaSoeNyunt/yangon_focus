<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        \DB::statement("ALTER TABLE misconduct_reports MODIFY COLUMN status ENUM('Open','Resolved','Action Taken','Dismissed','Warning Issued') NOT NULL DEFAULT 'Open'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \DB::statement("ALTER TABLE misconduct_reports MODIFY COLUMN status ENUM('Open','Resolved','Action Taken') NOT NULL DEFAULT 'Open'");
    }
};
