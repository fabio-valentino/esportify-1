<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengajuan_turnamen', function (Blueprint $table) {
            // Hapus kolom lokasi lama
            $table->dropColumn(['provinsi', 'kota']);

            // Tambahkan relasi ke tabel kota
            $table->unsignedBigInteger('id_kota')
                ->nullable()
                ->after('tipe_turnamen');

            $table->foreign('id_kota')
                ->references('id_kota')
                ->on('kota')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pengajuan_turnamen', function (Blueprint $table) {
            $table->dropForeign(['id_kota']);
            $table->dropColumn('id_kota');

            $table->string('provinsi', 100)->nullable();
            $table->string('kota', 100)->nullable();
        });
    }
};
?>