<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserPermissionController extends Controller
{
    /**
     * GET /api/admin/users/permissions
     * Mengambil permission beberapa user sekaligus.
     */
    public function indexAll(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => [
                'required',
                'integer',
                'distinct',
                'exists:users,id_user',
            ],
        ]);

        $users = User::query()
            ->whereIn('id_user', $validated['ids'])
            ->with([
                'roles.permissions',
                'permissions',
            ])
            ->get();

        $result = [];

        foreach ($users as $user) {
            // Permission yang diberikan langsung kepada user.
            $direct = $user->permissions;

            // Permission yang diperoleh melalui role.
            $viaRoles = $user->roles
                ->flatMap(fn ($role) => $role->permissions);

            // Gabungan seluruh permission tanpa duplikasi.
            $effective = $direct
                ->merge($viaRoles)
                ->unique('id')
                ->sortBy('id')
                ->values();

            $result[$user->id_user] = [
                'direct' => $this->formatPermissions($direct),
                'via_roles' => $this->formatPermissions($viaRoles),
                'effective' => $this->formatPermissions($effective),
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'User permissions retrieved successfully.',
            'data' => $result,
        ]);
    }

    /**
     * GET /api/admin/users/{id}/permissions
     * Mengambil permission satu user.
     */
    public function index(int $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        $direct = $user->getDirectPermissions();
        $viaRoles = $user->getPermissionsViaRoles();
        $effective = $user->getAllPermissions();

        return response()->json([
            'success' => true,
            'message' => 'User permissions retrieved successfully.',
            'data' => [
                'direct' => $this->formatPermissions($direct),
                'via_roles' => $this->formatPermissions($viaRoles),
                'effective' => $this->formatPermissions($effective),
            ],
        ]);
    }

    /**
     * POST /api/admin/users/{id}/permissions
     * Memperbarui permission langsung milik satu user.
     */
    public function update(Request $request, int $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        $validated = $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*' => [
                'string',
                'exists:permissions,name',
            ],
        ]);

        DB::transaction(function () use ($user, $validated) {
            $user->syncPermissions($validated['permissions']);
        });

        $user->load('roles');

        $direct = $user->getDirectPermissions();
        $viaRoles = $user->getPermissionsViaRoles();
        $effective = $user->getAllPermissions();

        return response()->json([
            'success' => true,
            'message' => 'User permissions updated successfully.',
            'data' => [
                'direct' => $this->formatPermissions($direct),
                'via_roles' => $this->formatPermissions($viaRoles),
                'effective' => $this->formatPermissions($effective),
            ],
        ]);
    }

    /**
     * Mengubah collection permission menjadi array sederhana.
     */
    private function formatPermissions($permissions): array
    {
        return $permissions
            ->unique('id')
            ->sortBy('id')
            ->values()
            ->map(function ($permission) {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                ];
            })
            ->toArray();
    }
}
?>