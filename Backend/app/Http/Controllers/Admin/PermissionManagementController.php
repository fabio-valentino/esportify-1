<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class PermissionManagementController extends Controller
{
    // READ - Menampilkan semua permission
    public function index()
    {
        $permissions = Permission::where('guard_name', 'web')
            ->with('roles:id,name')
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

    // READ - Detail permission
    public function show($id)
    {
        $permission = Permission::where('guard_name', 'web')
            ->with('roles:id,name')
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

    // CREATE - Membuat permission
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
            'name' => trim($validated['name']),
            'guard_name' => 'web',
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

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

        $permission->update([
            'name' => isset($validated['name'])
                ? trim($validated['name'])
                : $permission->name,
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return response()->json([
            'success' => true,
            'message' => 'Permission berhasil diperbarui.',
            'data' => $permission->fresh(),
        ]);
    }

    // DELETE - Menghapus permission
    public function destroy($id)
    {
        $result = DB::transaction(function () use ($id) {

            $permission = Permission::where('guard_name', 'web')
                ->where('id', $id)
                ->lockForUpdate()
                ->first();

            if (!$permission) {
                return [
                    'status' => 'not_found',
                ];
            }

            // Cek apakah permission masih digunakan role
            $isUsedByRole = DB::table('role_has_permissions')
                ->where('permission_id', $permission->id)
                ->exists();

            if ($isUsedByRole) {
                return [
                    'status' => 'used_by_role',
                ];
            }

            // Cek apakah permission diberikan langsung kepada user
            $user = new User();

            $isUsedByUser = DB::table('model_has_permissions')
                ->where('permission_id', $permission->id)
                ->where('model_type', $user->getMorphClass())
                ->exists();

            if ($isUsedByUser) {
                return [
                    'status' => 'used_by_user',
                ];
            }

            // Hapus hanya jika tidak digunakan role maupun user
            $permission->delete();

            return [
                'status' => 'deleted',
            ];
        });

        if ($result['status'] === 'not_found') {
            return response()->json([
                'success' => false,
                'message' => 'Permission tidak ditemukan.',
            ], 404);
        }

        if ($result['status'] === 'used_by_role') {
            return response()->json([
                'success' => false,
                'message' => 'Permission masih digunakan oleh role sehingga tidak dapat dihapus.',
            ], 422);
        }

        if ($result['status'] === 'used_by_user') {
            return response()->json([
                'success' => false,
                'message' => 'Permission masih diberikan langsung kepada user sehingga tidak dapat dihapus.',
            ], 422);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return response()->json([
            'success' => true,
            'message' => 'Permission berhasil dihapus.',
        ]);
    }
}
?>