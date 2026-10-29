<?php

namespace App\Http\Controllers\Api\Player;

use App\Http\Controllers\Controller;
use App\Models\Game;
use Illuminate\Support\Facades\Storage;

class GameController extends Controller
{
    /**
     * GET: Menampilkan semua game untuk Player.
     */
    public function index()
    {
        $games = Game::with([
            'kategoris:id_kategori,nama_kategori',
        ])
            ->latest()
            ->get();

        $games->each(function ($game) {
            $game->avatar_url = $game->avatar
                ? Storage::disk('public')->url($game->avatar)
                : null;
        });

        return response()->json([
            'success' => true,
            'message' => 'Daftar game berhasil diambil.',
            'data' => $games,
        ]);
    }

    /**
     * GET: Menampilkan detail game untuk Player.
     */
    public function show($id)
    {
        $game = Game::with([
            'kategoris:id_kategori,nama_kategori',
        ])->find($id);

        if (!$game) {
            return response()->json([
                'success' => false,
                'message' => 'Game tidak ditemukan.',
            ], 404);
        }

        $game->avatar_url = $game->avatar
            ? Storage::disk('public')->url($game->avatar)
            : null;

        return response()->json([
            'success' => true,
            'message' => 'Detail game berhasil diambil.',
            'data' => $game,
        ]);
    }
}
?>