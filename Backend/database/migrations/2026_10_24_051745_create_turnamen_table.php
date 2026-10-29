<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('turnamen', function (Blueprint $table) {
            $table->bigIncrements('id_turnamen');

            $table->unsignedBigInteger('id_pengajuan')->unique();
            $table->unsignedBigInteger('id_penyelenggara');

            $table->enum('status', [
                'pendaftaran',
                'berlangsung',
                'selesai'
            ]);

            $table->timestamps();

            $table->foreign('id_pengajuan')
                ->references('id_pengajuan')
                ->on('pengajuan_turnamen')
                ->cascadeOnDelete();

            $table->foreign('id_penyelenggara')
                ->references('id_penyelenggara')
                ->on('penyelenggara')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('turnamen');
    }
};
?>