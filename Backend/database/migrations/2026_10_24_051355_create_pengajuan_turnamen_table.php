<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengajuan_turnamen', function (Blueprint $table) {
            $table->bigIncrements('id_pengajuan');

            // Relasi utama
            $table->unsignedBigInteger('id_player');
            $table->unsignedBigInteger('id_game');
            $table->unsignedBigInteger('id_admin')->nullable();

            // Informasi turnamen
            $table->string('poster', 255);
            $table->string('nama_turnamen', 150);
            $table->string('nama_penyelenggara', 150);

            $table->enum('tipe_turnamen', [
                'online',
                'offline'
            ]);

            // Lokasi
            $table->string('provinsi', 100)->nullable();
            $table->string('kota', 100)->nullable();
            $table->text('deskripsi_lokasi')->nullable();

            // Jadwal dan kapasitas
            $table->unsignedInteger('slot');
            $table->dateTime('jadwal_pendaftaran_tutup');
            $table->dateTime('jadwal_main');

            // Detail turnamen
            $table->text('deskripsi_turnamen');
            $table->decimal('total_hadiah', 12, 2);
            $table->string('ktp', 255);

            $table->boolean('setuju_pertanggungjawaban');

            // Status pengajuan sesuai PDM
            $table->enum('status', [
                'Menunggu Verifikasi',
                'Sedang diedit',
                'Sedang ditinjau',
                'Disetujui',
                'Ditolak',
                'Revisi'
            ]);

            $table->text('alasan_admin')->nullable();

            $table->timestamps();

            // Foreign keys
            $table->foreign('id_player')
                ->references('id_player')
                ->on('players')
                ->cascadeOnDelete();

            $table->foreign('id_game')
                ->references('id_game')
                ->on('games')
                ->restrictOnDelete();

            $table->foreign('id_admin')
                ->references('id_admin')
                ->on('admins')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengajuan_turnamen');
    }
};
?>