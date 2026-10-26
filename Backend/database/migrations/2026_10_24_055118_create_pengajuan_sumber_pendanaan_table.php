<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengajuan_sumber_pendanaan', function (Blueprint $table) {
            $table->unsignedBigInteger('id_pengajuan');
            $table->unsignedBigInteger('id_sumber');

            // Composite primary key
            $table->primary(['id_pengajuan', 'id_sumber']);

            $table->foreign('id_pengajuan')
                ->references('id_pengajuan')
                ->on('pengajuan_turnamen')
                ->cascadeOnDelete();

            $table->foreign('id_sumber')
                ->references('id_sumber')
                ->on('sumber_pendanaan')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengajuan_sumber_pendanaan');
    }
};
?>