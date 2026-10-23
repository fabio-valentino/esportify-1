<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kategori_game', function (Blueprint $table) {
            $table->unsignedBigInteger('id_game');
            $table->unsignedBigInteger('id_kategori');

            $table->primary(['id_game', 'id_kategori']);

            $table->foreign('id_game')
                  ->references('id_game')
                  ->on('games')
                  ->onUpdate('cascade')
                  ->onDelete('cascade');

            $table->foreign('id_kategori')
                  ->references('id_kategori')
                  ->on('kategoris')
                  ->onUpdate('cascade')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kategori_game');
    }
};
?>