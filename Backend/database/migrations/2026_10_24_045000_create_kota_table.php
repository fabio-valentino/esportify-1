
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kota', function (Blueprint $table) {
            $table->bigIncrements('id_kota');

            $table->unsignedBigInteger('id_provinsi');
            $table->string('nama_kota', 100);

            $table->timestamps();

            $table->foreign('id_provinsi')
                ->references('id_provinsi')
                ->on('provinsi')
                ->restrictOnDelete();

            $table->unique(['id_provinsi', 'nama_kota']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kota');
    }
};
