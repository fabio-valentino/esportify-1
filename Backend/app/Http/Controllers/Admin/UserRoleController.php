<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UserRoleController extends Controller
{
    // READ - Melihat role yang dimiliki user
    public function index($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Daftar role user berhasil diambil.',
            'data' => [
                'id_user' => $user->id_user,
                'username' => $user->username,
                'roles' => $user->getRoleNames(),
            ],
        ]);
    }

    // ASSIGN - Memberikan atau mengganti role user
    public function store(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'role' => [
                'required',
                'string',
                Rule::exists('roles', 'name')
                    ->where('guard_name', 'web'),
            ],
        ]);

        $role = Role::where('guard_name', 'web')
            ->where('name', $validated['role'])
            ->first();

        $user->syncRoles([$role]);

        return response()->json([
            'success' => true,
            'message' => 'Role user berhasil diperbarui.',
            'data' => [
                'id_user' => $user->id_user,
                'username' => $user->username,
                'roles' => $user->fresh()->getRoleNames(),
            ],
        ]);
    }
}
?>