<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->string('avatar', 255)->nullable()->change();

            $table->enum('jenis_kelamin', [
                'laki-laki',
                'perempuan',
                'rahasia'
            ])->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('players', function (Blueprint $table) {
            $table->string('avatar', 255)->nullable(false)->change();

            $table->enum('jenis_kelamin', [
                'laki-laki',
                'perempuan',
                'rahasia'
            ])->nullable(false)->change();
        });
    }
};
?>