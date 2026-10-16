<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;

class PermissionManagementController extends Controller
{
    // READ - Menampilkan semua permission
    public function index()
    {
        $permissions = Permission::where('guard_name', 'web')
            ->orderBy('id')
            ->get([
                'id',
                'name',
                'guard_name',
                'created_at',
                'updated_at'
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Daftar permission berhasil diambil.',
            'data' => $permissions,
        ]);
    }

    // READ - Menampilkan detail permission berdasarkan ID
    public function show($id)
    {
        $permission = Permission::where('guard_name', 'web')
            ->find($id);

        if (!$permission) {
            return response()->json([
                'success' => false,
                'message' => 'Permission tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail permission berhasil diambil.',
            'data' => $permission,
        ]);
    }

    // CREATE - Membuat permission baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('permissions', 'name')
                    ->where('guard_name', 'web'),
            ],
        ]);

        $permission = Permission::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permission berhasil dibuat.',
            'data' => $permission,
        ], 201);
    }

    // UPDATE - Mengubah nama permission
    public function update(Request $request, $id)
    {
        $permission = Permission::where('guard_name', 'web')
            ->find($id);

        if (!$permission) {
            return response()->json([
                'success' => false,
                'message' => 'Permission tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('permissions', 'name')
                    ->where('guard_name', 'web')
                    ->ignore($permission->id),
            ],
        ]);

        if (empty($validated)) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada data yang dikirim untuk diperbarui.',
            ], 422);
        }

        $permission->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Permission berhasil diperbarui.',
            'data' => $permission->fresh(),
        ]);
    }

    // DELETE - Menghapus permission
    public function destroy($id)
    {
        $permission = Permission::where('guard_name', 'web')
            ->find($id);

        if (!$permission) {
            return response()->json([
                'success' => false,
                'message' => 'Permission tidak ditemukan.',
            ], 404);
        }

        $permission->delete();

        return response()->json([
            'success' => true,
            'message' => 'Permission berhasil dihapus.',
        ]);
    }
}
?>