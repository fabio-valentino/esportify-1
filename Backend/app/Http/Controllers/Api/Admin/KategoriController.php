<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Kategori;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class KategoriController extends Controller
{
    // GET: Menampilkan semua kategori
    public function index()
    {
        $kategoris = Kategori::with([
            'admin:id_admin,id_user',
        ])
        ->withCount('games')
        ->latest()
        ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar kategori berhasil diambil.',
            'data' => $kategoris,
        ]);
    }

    // GET: Menampilkan detail kategori
    public function show($id)
    {
        $kategori = Kategori::with([
            'admin:id_admin,id_user',
            'games:id_game,nama_game,status',
        ])
        ->withCount('games')
        ->find($id);

        if (!$kategori) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail kategori berhasil diambil.',
            'data' => $kategori,
        ]);
    }

    // POST: Menambahkan kategori
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_kategori' => [
                'required',
                'string',
                'max:100',
                'unique:kategoris,nama_kategori',
            ],
        ], [
            'nama_kategori.required' => 'Nama kategori wajib diisi.',
            'nama_kategori.unique' => 'Nama kategori sudah digunakan.',
            'nama_kategori.max' => 'Nama kategori maksimal 100 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data kategori tidak valid.',
                'errors' => $validator->errors(),
            ], 422);
        }

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

        $kategori = Kategori::create([
            'id_admin' => $admin->id_admin,
            'nama_kategori' => $request->nama_kategori,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil ditambahkan.',
            'data' => $kategori,
        ], 201);
    }

    // PATCH: Mengubah kategori
    public function update(Request $request, $id)
    {
        $kategori = Kategori::find($id);

        if (!$kategori) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak ditemukan.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nama_kategori' => [
                'required',
                'string',
                'max:100',
                Rule::unique('kategoris', 'nama_kategori')
                    ->ignore($kategori->id_kategori, 'id_kategori'),
            ],
        ], [
            'nama_kategori.required' => 'Nama kategori wajib diisi.',
            'nama_kategori.unique' => 'Nama kategori sudah digunakan.',
            'nama_kategori.max' => 'Nama kategori maksimal 100 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data kategori tidak valid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $kategori->update([
            'nama_kategori' => $request->nama_kategori,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil diperbarui.',
            'data' => $kategori,
        ]);
    }

    // DELETE: Menghapus kategori
    public function destroy($id)
    {
        $kategori = Kategori::find($id);

        if (!$kategori) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak ditemukan.',
            ], 404);
        }

        if ($kategori->games()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak dapat dihapus karena masih digunakan oleh game.',
            ], 409);
        }

        $kategori->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dihapus.',
        ]);
    }
}
?>