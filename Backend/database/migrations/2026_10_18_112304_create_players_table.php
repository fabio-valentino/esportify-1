<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('players', function (Blueprint $table) {
            $table->bigIncrements('id_player');

            $table->unsignedBigInteger('id_user')->unique();

            $table->string('avatar', 255)->nullable();
            $table->text('bio')->nullable();

            $table->enum('jenis_kelamin', [
                'laki-laki',
                'perempuan',
                'rahasia'
            ])->nullable();

            $table->timestamps();

            $table->foreign('id_user')
                ->references('id_user')
                ->on('users')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('players');
    }
};