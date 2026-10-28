<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sponsor_pengajuan', function (Blueprint $table) {
            $table->bigIncrements('id_sponsor');

            $table->unsignedBigInteger('id_pengajuan');

            $table->string('nama_sponsor', 255);
            $table->string('kontak_sponsor', 255);

            $table->foreign('id_pengajuan')
                ->references('id_pengajuan')
                ->on('pengajuan_turnamen')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sponsor_pengajuan');
    }
};
?>