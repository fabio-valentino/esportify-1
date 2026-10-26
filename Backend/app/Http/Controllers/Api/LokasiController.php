<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Provinsi;
use App\Models\Kota;
use Illuminate\Http\JsonResponse;

class LokasiController extends Controller
{
    /**
     * Mengambil semua provinsi.
     */
    public function provinsi(): JsonResponse
    {
        $data = Provinsi::query()
            ->orderBy('nama_provinsi')
            ->get([
                'id_provinsi',
                'nama_provinsi',
            ]);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Mengambil kota berdasarkan ID provinsi.
     */
    public function kota(string $id_provinsi): JsonResponse
    {
        $provinsi = Provinsi::find($id_provinsi);

        if (!$provinsi) {
            return response()->json([
                'success' => false,
                'message' => 'Provinsi tidak ditemukan.',
            ], 404);
        }

        $data = Kota::query()
            ->where('id_provinsi', $provinsi->id_provinsi)
            ->orderBy('nama_kota')
            ->get([
                'id_kota',
                'id_provinsi',
                'nama_kota',
            ]);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}