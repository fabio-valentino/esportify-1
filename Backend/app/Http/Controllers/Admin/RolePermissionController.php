<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Validation\Rule;

class RolePermissionController extends Controller
{
    // Menampilkan permission yang dimiliki sebuah role
    public function index($id)
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
            'message' => 'Daftar permission role berhasil diambil.',
            'data' => [
                'role' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ],
        ]);
    }

    // Memberikan permission kepada role
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
            'permissions' => ['required', 'array', 'min:1'],
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

        $role->syncPermissions($permissions);

        return response()->json([
            'success' => true,
            'message' => 'Permission berhasil diberikan kepada role.',
            'data' => [
                'role' => $role->name,
                'permissions' => $role->fresh()->permissions->pluck('name'),
            ],
        ]);
    }
}
?>