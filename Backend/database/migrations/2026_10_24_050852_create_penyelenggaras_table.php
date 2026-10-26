<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('penyelenggara', function (Blueprint $table) {
            $table->bigIncrements('id_penyelenggara');

            $table->unsignedBigInteger('id_player');

            $table->foreign('id_player')
                ->references('id_player')
                ->on('players')
                ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('penyelenggara');
    }
};
?>