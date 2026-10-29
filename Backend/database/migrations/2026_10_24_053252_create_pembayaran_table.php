<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pembayaran', function (Blueprint $table) {
            $table->bigIncrements('id_pembayaran');

            $table->unsignedBigInteger('id_pengajuan')->unique();

            $table->enum('metode_pembayaran', [
                'qris',
                'transfer',
                'qris_transfer'
            ])->nullable();

            $table->string('qris', 255)->nullable();
            $table->string('no_rekening', 50)->nullable();

            $table->foreign('id_pengajuan')
                ->references('id_pengajuan')
                ->on('pengajuan_turnamen')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pembayaran');
    }
};
?>