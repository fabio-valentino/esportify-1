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
        // Tambahkan rincian pendanaan ke setiap pengajuan.
        Schema::table('pengajuan_turnamen', function (Blueprint $table) {
            $table->text('rincian_pendanaan')->nullable();
        });

        // Hapus rincian pendanaan dari daftar sumber pendanaan.
        Schema::table('sumber_pendanaan', function (Blueprint $table) {
            $table->dropColumn('rincian_pendanaan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Kembalikan kolom ke tabel sumber pendanaan.
        Schema::table('sumber_pendanaan', function (Blueprint $table) {
            $table->text('rincian_pendanaan')->nullable();
        });

        // Hapus kolom dari tabel pengajuan.
        Schema::table('pengajuan_turnamen', function (Blueprint $table) {
            $table->dropColumn('rincian_pendanaan');
        });
    }
};
?>