<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Throwable;

class RoleManagementController extends Controller
{
    private array $protectedRoles = [
        'admin',
        'player',
        'owner',
    ];

    /**
     * Subquery untuk menghitung jumlah user pada setiap role.
     * Tidak menggunakan relasi Role::users().
     */
    private function userCountQuery()
    {
        $user = new User();

        return DB::table('model_has_roles')
            ->selectRaw('COUNT(*)')
            ->whereColumn('model_has_roles.role_id', 'roles.id')
            ->where('model_has_roles.model_type', $user->getMorphClass());
    }

    /**
     * Menampilkan seluruh role.
     */
    public function index()
    {
        try {
            $roles = Role::query()
                ->where('roles.guard_name', 'web')
                ->with('permissions:id,name')
                ->addSelect([
                    'users_count' => $this->userCountQuery(),
                ])
                ->orderBy('roles.id')
                ->get([
                    'roles.id',
                    'roles.name',
                    'roles.guard_name',
                    'roles.created_at',
                    'roles.updated_at',
                ]);

            return response()->json([
                'success' => true,
                'message' => 'Daftar role berhasil diambil.',
                'data' => $roles,
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil daftar role.',
                'error' => get_class($e),
                'detail' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }

    /**
     * Menampilkan detail role.
     */
    public function show($id)
    {
        $role = Role::query()
            ->where('roles.guard_name', 'web')
            ->with('permissions:id,name')
            ->addSelect([
                'users_count' => $this->userCountQuery(),
            ])
            ->find($id, [
                'roles.id',
                'roles.name',
                'roles.guard_name',
                'roles.created_at',
                'roles.updated_at',
            ]);

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

    /**
     * Membuat role baru.
     */
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
            'name' => trim($validated['name']),
            'guard_name' => 'web',
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return response()->json([
            'success' => true,
            'message' => 'Role berhasil dibuat.',
            'data' => $role,
        ], 201);
    }

    /**
     * Memperbarui role.
     */
    public function update(Request $request, $id)
    {
        $role = Role::query()
            ->where('guard_name', 'web')
            ->find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role tidak ditemukan.',
            ], 404);
        }

        if (in_array($role->name, $this->protectedRoles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Role sistem tidak dapat diubah.',
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

        if (!isset($validated['name'])) {
            return response()->json([
                'success' => false,
                'message' => 'Nama role wajib dikirim.',
            ], 422);
        }

        $role->update([
            'name' => trim($validated['name']),
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return response()->json([
            'success' => true,
            'message' => 'Role berhasil diperbarui.',
            'data' => $role->fresh()->load('permissions:id,name'),
        ]);
    }

    /**
     * Menghapus role.
     */
    public function destroy($id)
    {
        $role = Role::query()
            ->where('guard_name', 'web')
            ->find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role tidak ditemukan.',
            ], 404);
        }

        if (in_array($role->name, $this->protectedRoles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Role sistem tidak dapat dihapus.',
            ], 403);
        }

        $hasUsers = DB::table('model_has_roles')
            ->where('role_id', $role->id)
            ->where('model_type', (new User())->getMorphClass())
            ->exists();

        if ($hasUsers) {
            return response()->json([
                'success' => false,
                'message' => 'Role masih digunakan oleh user sehingga tidak dapat dihapus.',
            ], 409);
        }

        $role->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return response()->json([
            'success' => true,
            'message' => 'Role berhasil dihapus.',
        ]);
    }
}
?>