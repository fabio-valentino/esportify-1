<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Turnamen;
use App\Models\Player;
use App\Models\Penyelenggara;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TurnamenController extends Controller
{
    /**
     * Menampilkan daftar turnamen yang sudah dipublikasikan.
     * Endpoint ini dapat diakses oleh Guest maupun Player.
     */
    public function index()
    {
        $turnamen = Turnamen::query()
            ->whereHas('pengajuan')
            ->with([
                'pengajuan:id_pengajuan,id_game,nama_turnamen,nama_penyelenggara,poster,tipe_turnamen,slot,jadwal_pendaftaran_tutup,jadwal_main,deskripsi_lokasi',
                'pengajuan.game:id_game,nama_game',
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($item) {
                $pengajuan = $item->pengajuan;

                return [
                    'id_turnamen' => $item->id_turnamen,
                    'status' => $item->status,
                    'created_at' => $item->created_at,

                    'pengajuan' => [
                        'id_pengajuan' => $pengajuan->id_pengajuan,
                        'nama_turnamen' => $pengajuan->nama_turnamen,
                        'nama_penyelenggara' => $pengajuan->nama_penyelenggara,
                        'poster' => $pengajuan->poster,
                        'tipe_turnamen' => $pengajuan->tipe_turnamen,
                        'slot' => $pengajuan->slot,
                        'jadwal_pendaftaran_tutup' => $pengajuan->jadwal_pendaftaran_tutup,
                        'jadwal_main' => $pengajuan->jadwal_main,
                        'deskripsi_lokasi' => $pengajuan->deskripsi_lokasi,

                        'game' => $pengajuan->game
                            ? [
                                'id_game' => $pengajuan->game->id_game,
                                'nama_game' => $pengajuan->game->nama_game,
                            ]
                            : null,
                    ],
                ];
            });

        return response()->json([
            'success' => true,
            'message' => 'Daftar turnamen berhasil diambil.',
            'data' => $turnamen,
        ]);
    }


    /**
     * Menampilkan daftar seluruh turnamen yang dikelola
     * oleh Player yang sedang login.
     */
    public function kelolaan(Request $request)
    {
        // 1. Ambil data Player berdasarkan akun yang sedang login.
        $player = Player::where(
            'id_user',
            $request->user()->id_user
        )->first();

        // Jika akun belum memiliki data Player.
        if (!$player) {
            return response()->json([
                'success' => true,
                'message' => 'Anda belum memiliki data Player.',
                'data' => [],
            ]);
        }

        // 2. Ambil seluruh ID Penyelenggara milik Player.
        $idPenyelenggara = Penyelenggara::where(
            'id_player',
            $player->id_player
        )->pluck('id_penyelenggara');

        // Jika Player belum pernah menjadi penyelenggara.
        if ($idPenyelenggara->isEmpty()) {
            return response()->json([
                'success' => true,
                'message' => 'Anda belum memiliki turnamen kelolaan.',
                'data' => [],
            ]);
        }

        // 3. Ambil seluruh turnamen dari semua ID Penyelenggara.
        $turnamen = Turnamen::query()
            ->whereIn('id_penyelenggara', $idPenyelenggara)
            ->whereHas('pengajuan')
            ->with([
                'pengajuan:id_pengajuan,id_game,nama_turnamen,nama_penyelenggara,poster,tipe_turnamen,slot,jadwal_pendaftaran_tutup,jadwal_main,deskripsi_lokasi',
                'pengajuan.game:id_game,nama_game',
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($item) {
                $pengajuan = $item->pengajuan;

                return [
                    'id_turnamen' => $item->id_turnamen,
                    'status' => $item->status,
                    'created_at' => $item->created_at,

                    'pengajuan' => [
                        'id_pengajuan' => $pengajuan->id_pengajuan,
                        'nama_turnamen' => $pengajuan->nama_turnamen,
                        'nama_penyelenggara' => $pengajuan->nama_penyelenggara,
                        'poster' => $pengajuan->poster,
                        'tipe_turnamen' => $pengajuan->tipe_turnamen,
                        'slot' => $pengajuan->slot,
                        'jadwal_pendaftaran_tutup' => $pengajuan->jadwal_pendaftaran_tutup,
                        'jadwal_main' => $pengajuan->jadwal_main,
                        'deskripsi_lokasi' => $pengajuan->deskripsi_lokasi,

                        'game' => $pengajuan->game
                            ? [
                                'id_game' => $pengajuan->game->id_game,
                                'nama_game' => $pengajuan->game->nama_game,
                            ]
                            : null,
                    ],
                ];
            });

        return response()->json([
            'success' => true,
            'message' => 'Daftar turnamen kelolaan berhasil diambil.',
            'data' => $turnamen,
        ]);
    }


    /**
     * Menampilkan detail turnamen berdasarkan ID.
     * Digunakan oleh Player maupun Penyelenggara.
     */
    public function show($id)
    {
        $turnamen = Turnamen::with([
            'pengajuan.game',
            'pengajuan.kota.provinsi',
            'penyelenggara',
        ])->find($id);

        if (!$turnamen) {
            return response()->json([
                'success' => false,
                'message' => 'Turnamen tidak ditemukan.',
            ], 404);
        }

        $pengajuan = $turnamen->pengajuan;

        if (!$pengajuan) {
            return response()->json([
                'success' => false,
                'message' => 'Data pengajuan turnamen tidak ditemukan.',
            ], 404);
        }

        // Hitung status berdasarkan jadwal_main tanpa mengubah database.
        $waktuSekarang = now();
        $jadwalMain = Carbon::parse($pengajuan->jadwal_main);

        if ($waktuSekarang->lt($jadwalMain)) {
            $status = 'pendaftaran';
        } elseif ($waktuSekarang->isSameDay($jadwalMain)) {
            $status = 'berlangsung';
        } else {
            $status = 'selesai';
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail turnamen berhasil diambil.',
            'data' => [
                'id_turnamen' => $turnamen->id_turnamen,
                'status' => $status,
                'created_at' => $turnamen->created_at,

                'pengajuan' => [
                    'id_pengajuan' => $pengajuan->id_pengajuan,
                    'nama_turnamen' => $pengajuan->nama_turnamen,
                    'nama_penyelenggara' => $pengajuan->nama_penyelenggara,
                    'poster' => $pengajuan->poster,
                    'tipe_turnamen' => $pengajuan->tipe_turnamen,
                    'slot' => $pengajuan->slot,
                    'jadwal_pendaftaran_tutup' => $pengajuan->jadwal_pendaftaran_tutup,
                    'jadwal_main' => $pengajuan->jadwal_main,
                    'deskripsi_turnamen' => $pengajuan->deskripsi_turnamen,
                    'deskripsi_lokasi' => $pengajuan->deskripsi_lokasi,

                    'game' => $pengajuan->game
                        ? [
                            'id_game' => $pengajuan->game->id_game,
                            'nama_game' => $pengajuan->game->nama_game,
                        ]
                        : null,

                    'kota' => $pengajuan->kota,
                ],
            ],
        ]);
    }
}
?>