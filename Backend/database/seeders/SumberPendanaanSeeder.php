<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SumberPendanaan;

class SumberPendanaanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sumberPendanaan = [
            'Sponsor',
            'Dana Pribadi',
            'Biaya Pendaftaran Peserta',
        ];

        foreach ($sumberPendanaan as $namaSumber) {
            SumberPendanaan::updateOrCreate(
                ['nama_sumber' => $namaSumber]
            );
        }
    }
}
?>