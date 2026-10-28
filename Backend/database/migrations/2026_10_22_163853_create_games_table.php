<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id('id_game');

            $table->unsignedBigInteger('id_admin');

            $table->string('avatar')->nullable();

            $table->enum('status', ['Aktif', 'Nonaktif'])
                  ->default('Aktif');

            $table->string('nama_game', 100)->unique();

            $table->timestamps();

            $table->foreign('id_admin')
                  ->references('id_admin')
                  ->on('admins')
                  ->onUpdate('cascade')
                  ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
?>