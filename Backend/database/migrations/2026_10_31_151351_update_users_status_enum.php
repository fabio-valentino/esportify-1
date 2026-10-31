<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->where('status', 'diban')
            ->update(['status' => 'nonaktif']);

        DB::statement("
            ALTER TABLE users
            MODIFY status ENUM('aktif', 'nonaktif')
            NOT NULL DEFAULT 'aktif'
        ");
    }

    public function down(): void
    {
        DB::table('users')
            ->where('status', 'nonaktif')
            ->update(['status' => 'diban']);

        DB::statement("
            ALTER TABLE users
            MODIFY status ENUM('aktif', 'diban')
            NOT NULL DEFAULT 'aktif'
        ");
    }
};