<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengajuan_turnamen', function (Blueprint $table) {
            $table->foreign('id_kota')
                ->references('id_kota')
                ->on('kota')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pengajuan_turnamen', function (Blueprint $table) {
            $table->dropForeign(['id_kota']);
        });
    }
};
?>