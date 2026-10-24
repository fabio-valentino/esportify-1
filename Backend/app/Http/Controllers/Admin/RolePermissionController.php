<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionController extends Controller
{
    // READ - Menampilkan permission milik role
    public function index($id)
    {
        $role = Role::where('guard_name', 'web')
            ->with('permissions:id,name')
            ->find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Daftar permission role berhasil diambil.',
            'data' => [
                'role' => [
                    'id' => $role->id,
                    'name' => $role->name,
                ],
                'permissions' => $role->permissions,
            ],
        ]);
    }

    // UPDATE - Mengganti seluruh permission milik role
    public function store(Request $request, $id)
    {
        $role = Role::where('guard_name', 'web')->find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'permissions' => ['present', 'array'],
            'permissions.*' => [
                'required',
                'string',
                'distinct',
                Rule::exists('permissions', 'name')
                    ->where('guard_name', 'web'),
            ],
        ]);

        $permissions = Permission::where('guard_name', 'web')
            ->whereIn('name', $validated['permissions'])
            ->get();

        DB::transaction(function () use ($role, $permissions) {
            $role->syncPermissions($permissions);
        });

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return response()->json([
            'success' => true,
            'message' => 'Permission role berhasil diperbarui.',
            'data' => [
                'role' => $role->name,
                'permissions' => $role->fresh()->permissions,
            ],
        ]);
    }
}
?>