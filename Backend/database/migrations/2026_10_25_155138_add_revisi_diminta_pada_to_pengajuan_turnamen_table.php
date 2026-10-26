<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengajuan_turnamen', function (Blueprint $table) {
            $table->dateTime('revisi_diminta_pada')
                ->nullable()
                ->after('alasan_admin');
        });
    }

    public function down(): void
    {
        Schema::table('pengajuan_turnamen', function (Blueprint $table) {
            $table->dropColumn('revisi_diminta_pada');
        });
    }
};
?>