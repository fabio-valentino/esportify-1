<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class GameController extends Controller
{
    // GET: Menampilkan semua game
    public function index()
    {
        $games = Game::with([
            'kategoris:id_kategori,nama_kategori',
            'admin:id_admin,id_user',
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

    // GET: Menampilkan detail game
    public function show($id)
    {
        $game = Game::with([
            'kategoris:id_kategori,nama_kategori',
            'admin:id_admin,id_user',
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

    // POST: Menambahkan game
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_game' => [
                'required',
                'string',
                'max:100',
                'unique:games,nama_game',
            ],
            'avatar' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
            'status' => [
                'sometimes',
                'required',
                Rule::in(['Aktif', 'Nonaktif']),
            ],
            'category_ids' => [
                'required',
                'array',
                'min:1',
            ],
            'category_ids.*' => [
                'required',
                'distinct',
                'exists:kategoris,id_kategori',
            ],
        ], [
            'nama_game.required' => 'Nama game wajib diisi.',
            'nama_game.unique' => 'Nama game sudah digunakan.',
            'avatar.image' => 'Avatar harus berupa gambar.',
            'avatar.mimes' => 'Format avatar harus JPG, JPEG, PNG, atau WEBP.',
            'avatar.max' => 'Ukuran avatar maksimal 2 MB.',
            'category_ids.required' => 'Game wajib memiliki kategori.',
            'category_ids.min' => 'Game wajib memiliki minimal satu kategori.',
            'category_ids.*.exists' => 'Kategori yang dipilih tidak ditemukan.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data game tidak valid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Cari data admin berdasarkan user yang sedang login
        $admin = Admin::where(
            'id_user',
            $request->user()->id_user
        )->first();

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Data admin tidak ditemukan.',
            ], 403);
        }

        $avatarPath = null;

        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')
                ->store('games', 'public');
        }

        try {
            $game = DB::transaction(function () use (
                $request,
                $admin,
                $avatarPath
            ) {
                $game = Game::create([
                    'id_admin' => $admin->id_admin,
                    'nama_game' => $request->nama_game,
                    'avatar' => $avatarPath,
                    'status' => $request->input('status', 'Aktif'),
                ]);

                $game->kategoris()->sync(
                    $request->category_ids
                );

                return $game;
            });
        } catch (\Throwable $e) {
            if ($avatarPath) {
                Storage::disk('public')->delete($avatarPath);
            }

            throw $e;
        }

        $game->load('kategoris:id_kategori,nama_kategori');
        $game->avatar_url = $game->avatar
            ? Storage::disk('public')->url($game->avatar)
            : null;

        return response()->json([
            'success' => true,
            'message' => 'Game berhasil ditambahkan.',
            'data' => $game,
        ], 201);
    }

    // PATCH: Mengubah data game
    public function update(Request $request, $id)
    {
        $game = Game::find($id);

        if (!$game) {
            return response()->json([
                'success' => false,
                'message' => 'Game tidak ditemukan.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nama_game' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('games', 'nama_game')
                    ->ignore($game->id_game, 'id_game'),
            ],
            'avatar' => [
                'sometimes',
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
            'status' => [
                'sometimes',
                'required',
                Rule::in(['Aktif', 'Nonaktif']),
            ],
            'category_ids' => [
                'sometimes',
                'required',
                'array',
                'min:1',
            ],
            'category_ids.*' => [
                'required',
                'distinct',
                'exists:kategoris,id_kategori',
            ],
        ], [
            'nama_game.unique' => 'Nama game sudah digunakan.',
            'avatar.image' => 'Avatar harus berupa gambar.',
            'avatar.mimes' => 'Format avatar harus JPG, JPEG, PNG, atau WEBP.',
            'avatar.max' => 'Ukuran avatar maksimal 2 MB.',
            'category_ids.min' => 'Game wajib memiliki minimal satu kategori.',
            'category_ids.*.exists' => 'Kategori yang dipilih tidak ditemukan.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data game tidak valid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $oldAvatar = $game->avatar;
        $newAvatar = null;

        if ($request->hasFile('avatar')) {
            $newAvatar = $request->file('avatar')
                ->store('games', 'public');
        }

        try {
            DB::transaction(function () use (
                $request,
                $game,
                $newAvatar
            ) {
                $data = $request->only([
                    'nama_game',
                    'status',
                ]);

                if ($newAvatar) {
                    $data['avatar'] = $newAvatar;
                }

                $game->update($data);

                if ($request->has('category_ids')) {
                    $game->kategoris()->sync(
                        $request->category_ids
                    );
                }
            });
        } catch (\Throwable $e) {
            if ($newAvatar) {
                Storage::disk('public')->delete($newAvatar);
            }

            throw $e;
        }

        if ($newAvatar && $oldAvatar) {
            Storage::disk('public')->delete($oldAvatar);
        }

        $game->refresh();
        $game->load('kategoris:id_kategori,nama_kategori');
        $game->avatar_url = $game->avatar
            ? Storage::disk('public')->url($game->avatar)
            : null;

        return response()->json([
            'success' => true,
            'message' => 'Game berhasil diperbarui.',
            'data' => $game,
        ]);
    }

    // PATCH: Mengubah status game
    public function updateStatus(Request $request, $id)
    {
        $game = Game::find($id);

        if (!$game) {
            return response()->json([
                'success' => false,
                'message' => 'Game tidak ditemukan.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => [
                'required',
                Rule::in(['Aktif', 'Nonaktif']),
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Status game tidak valid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $game->update([
            'status' => $request->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status game berhasil diperbarui.',
            'data' => $game,
        ]);
    }

    // DELETE: Menghapus game
    public function destroy($id)
    {
        $game = Game::find($id);

        if (!$game) {
            return response()->json([
                'success' => false,
                'message' => 'Game tidak ditemukan.',
            ], 404);
        }

        $avatar = $game->avatar;

        // Hapus game dan relasi kategori dalam transaksi
        DB::transaction(function () use ($game) {
            $game->kategoris()->detach();
            $game->delete();
        });

        if ($avatar) {
            Storage::disk('public')->delete($avatar);
        }

        return response()->json([
            'success' => true,
            'message' => 'Game berhasil dihapus.',
        ]);
    }
}
?>