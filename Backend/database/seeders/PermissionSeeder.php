<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cache permission Spatie
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Daftar permission Esportify
        $permissions = [
            'lihat_dashboard',
            'lihat_data_user',
            'ubah_data_user',
            'hapus_data_user',
            'kelola_role',
            'kelola_permission',
            'atur_permission_role',
            'atur_role_user',
            'atur_permission_user',
            'kelola_turnamen',
        ];

        // Membuat permission jika belum tersedia
        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        // Berikan permission pengaturan user permission kepada admin
        $adminRole = Role::where('name', 'admin')
            ->where('guard_name', 'web')
            ->first();

        if ($adminRole) {
            $adminRole->givePermissionTo('atur_permission_user');
        }

        // Reset cache setelah perubahan
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
?>