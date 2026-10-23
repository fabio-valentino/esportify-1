<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kategoris', function (Blueprint $table) {
            $table->id('id_kategori');

            $table->unsignedBigInteger('id_admin');

            $table->string('nama_kategori', 100)->unique();

            $table->timestamps();

            $table->foreign('id_admin')
                  ->references('id_admin')
                  ->on('admins')
                  ->onUpdate('cascade')
                  ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kategoris');
    }
};
?>