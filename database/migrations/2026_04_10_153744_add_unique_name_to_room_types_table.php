<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Re-point any rooms referencing duplicate room_type IDs to the original (lowest) ID
        $duplicates = DB::table('room_types')
            ->select('name', DB::raw('MIN(id) as keep_id'))
            ->groupBy('name')
            ->having(DB::raw('COUNT(*)'), '>', 1)
            ->get();

        foreach ($duplicates as $dup) {
            $dupeIds = DB::table('room_types')
                ->where('name', $dup->name)
                ->where('id', '!=', $dup->keep_id)
                ->pluck('id');

            DB::table('rooms')
                ->whereIn('room_type_id', $dupeIds)
                ->update(['room_type_id' => $dup->keep_id]);

            DB::table('room_types')
                ->whereIn('id', $dupeIds)
                ->delete();
        }

        Schema::table('room_types', function (Blueprint $table) {
            $table->unique('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('room_types', function (Blueprint $table) {
            $table->dropUnique(['name']);
        });
    }
};
