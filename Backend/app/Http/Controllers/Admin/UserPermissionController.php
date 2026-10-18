<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;

class UserPermissionController extends Controller
{
    /**
     * Get user's permissions.
     *
     * GET /api/admin/users/{id}/permissions
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

        // Permission yang diberikan langsung kepada user
        $direct = $user->getDirectPermissions();

        // Permission yang didapat dari role user
        $viaRoles = $user->getPermissionsViaRoles();

        // Semua permission yang efektif dimiliki user
        // (direct permission + permission dari role)
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
     * Sync direct permissions for a user.
     *
     * POST /api/admin/users/{id}/permissions
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
            // Hanya mengatur direct permission user.
            // Permission yang berasal dari role tidak akan dihapus.
            $user->syncPermissions($validated['permissions']);
        });

        // Ambil ulang data permission setelah sinkronisasi
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
     * Format permission collection for API response.
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