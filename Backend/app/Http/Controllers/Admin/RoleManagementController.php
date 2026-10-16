<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class RoleManagementController extends Controller
{
    // Role bawaan yang dilindungi
    private $protectedRoles = ['admin', 'user'];

    // READ - Menampilkan semua role
    public function index()
    {
        $roles = Role::where('guard_name', 'web')
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
            'message' => 'Daftar role berhasil diambil.',
            'data' => $roles,
        ]);
    }

    // READ - Menampilkan detail role berdasarkan ID
    public function show($id)
    {
        $role = Role::where('guard_name', 'web')->find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail role berhasil diambil.',
            'data' => $role,
        ]);
    }

    // CREATE - Membuat role baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')
                    ->where('guard_name', 'web'),
            ],
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Role berhasil dibuat.',
            'data' => $role,
        ], 201);
    }

    // UPDATE - Mengubah nama role
    public function update(Request $request, $id)
    {
        $role = Role::where('guard_name', 'web')->find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role tidak ditemukan.',
            ], 404);
        }

        // Melindungi role bawaan
        if (in_array($role->name, $this->protectedRoles)) {
            return response()->json([
                'success' => false,
                'message' => 'Role bawaan tidak dapat diubah.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')
                    ->where('guard_name', 'web')
                    ->ignore($role->id),
            ],
        ]);

        if (empty($validated)) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada data yang dikirim untuk diperbarui.',
            ], 422);
        }

        $role->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Role berhasil diperbarui.',
            'data' => $role->fresh(),
        ]);
    }

    // DELETE - Menghapus role
    public function destroy($id)
    {
        $role = Role::where('guard_name', 'web')->find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role tidak ditemukan.',
            ], 404);
        }

        // Melindungi role bawaan
        if (in_array($role->name, $this->protectedRoles)) {
            return response()->json([
                'success' => false,
                'message' => 'Role bawaan tidak dapat dihapus.',
            ], 403);
        }

        // Role yang masih digunakan user tidak boleh dihapus
        if ($role->users()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Role masih digunakan oleh user sehingga tidak dapat dihapus.',
            ], 409);
        }

        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Role berhasil dihapus.',
        ]);
    }
}
?>