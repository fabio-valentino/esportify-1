<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pendanaan', function (Blueprint $table) {
            $table->bigIncrements('id_pendanaan');

            $table->unsignedBigInteger('id_pengajuan')->unique();

            $table->enum('jenis_biaya', [
                'gratis',
                'berbayar'
            ]);

            $table->decimal('biaya_pendaftaran', 12, 2)->nullable();

            $table->foreign('id_pengajuan')
                ->references('id_pengajuan')
                ->on('pengajuan_turnamen')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pendanaan');
    }
};
?>