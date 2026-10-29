<?php

namespace App\Http\Controllers\Api\Player;

use App\Http\Controllers\Controller;
use App\Models\Kategori;

class KategoriController extends Controller
{
    /**
     * GET: Menampilkan semua kategori untuk publik.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'message' => 'Daftar kategori berhasil diambil.',
            'data' => Kategori::select('id_kategori', 'nama_kategori')
                ->orderBy('nama_kategori')
                ->get(),
        ]);
    }
}