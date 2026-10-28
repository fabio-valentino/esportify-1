<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sumber_pendanaan', function (Blueprint $table) {
            $table->bigIncrements('id_sumber');

            $table->string('nama_sumber', 100)->unique();

            $table->text('rincian_pendanaan')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sumber_pendanaan');
    }
};
?>