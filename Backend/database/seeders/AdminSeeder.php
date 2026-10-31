<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $username = env('ADMIN_USERNAME');
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');

        if (!$username || !$email || !$password) {
            throw new RuntimeException(
                'ADMIN_USERNAME, ADMIN_EMAIL, dan ADMIN_PASSWORD wajib diisi di .env'
            );
        }

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'username' => $username,
                'password' => $password,
                'status' => 'aktif',
            ]
        );

        $user->admin()->firstOrCreate([]);

        $user->assignRole('admin');
    }
}