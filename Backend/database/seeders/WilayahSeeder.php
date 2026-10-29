<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
class WilayahSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $now = now();

            $data = [
                'Jawa Timur' => [
                    'Bangkalan',
                    'Banyuwangi',
                    'Kabupaten Blitar',
                    'Bojonegoro',
                    'Bondowoso',
                    'Kabupaten Kediri',
                    'Kota Madiun',
                    'Kabupaten Madiun',
                    'Magetan',
                    'Kabupaten Malang',
                    'Kabupaten Mojokerto',
                    'Nganjuk',
                    'Ngawi',
                    'Pacitan',
                    'Pamekasan',
                    'Kabupaten Pasuruan',
                    'Ponorogo',
                    'Kabupaten Probolinggo',
                    'Sampang',
                    'Sidoarjo',
                    'Situbondo',
                    'Sumenep',
                    'Trenggalek',
                    'Tuban',
                    'Tulungagung',
                    'Gresik',
                    'Jember',
                    'Jombang',
                    'Lamongan',
                    'Lumajang',
                    'Kota Batu',
                    'Kota Blitar',
                    'Kota Kediri',
                    'Kota Malang',
                    'Kota Mojokerto',
                    'Kota Pasuruan',
                    'Kota Probolinggo',
                    'Surabaya',
                ],

                'Jawa Tengah' => [
                    'Banjarnegara',
                    'Banyumas',
                    'Batang',
                    'Blora',
                    'Boyolali',
                    'Brebes',
                    'Cilacap',
                    'Demak',
                    'Grobogan',
                    'Jepara',
                    'Karanganyar',
                    'Kebumen',
                    'Kendal',
                    'Klaten',
                    'Kudus',
                    'Kabupaten Magelang',
                    'Pati',
                    'Kabupaten Pekalongan',
                    'Pemalang',
                    'Purbalingga',
                    'Purworejo',
                    'Rembang',
                    'Kabupaten Semarang',
                    'Sragen',
                    'Sukoharjo',
                    'Kabupaten Tegal',
                    'Temanggung',
                    'Wonogiri',
                    'Wonosobo',
                    'Kota Magelang',
                    'Kota Pekalongan',
                    'Kota Salatiga',
                    'Kota Semarang',
                    'Surakarta',
                    'Kota Tegal',
                ],
            ];

            foreach ($data as $namaProvinsi => $daftarWilayah) {
                DB::table('provinsi')->updateOrInsert(
                    ['nama_provinsi' => $namaProvinsi],
                    [
                        'updated_at' => $now,
                        'created_at' => $now,
                    ]
                );

                $idProvinsi = DB::table('provinsi')
                    ->where('nama_provinsi', $namaProvinsi)
                    ->value('id_provinsi');

                foreach ($daftarWilayah as $namaKota) {
                    DB::table('kota')->updateOrInsert(
                        [
                            'id_provinsi' => $idProvinsi,
                            'nama_kota' => $namaKota,
                        ],
                        [
                            'updated_at' => $now,
                            'created_at' => $now,
                        ]
                    );
                }
            }
        });
    }
}

