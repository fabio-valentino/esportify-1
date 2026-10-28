<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminProfileController extends Controller
{
    /**
     * GET /api/admin/profile
     * Menampilkan profil admin yang sedang login.
     */
    public function show(Request $request)
    {
        $user = $request->user();

        // Pastikan akun memiliki profil Admin.
        if (!$user->admin) {
            return response()->json([
                'success' => false,
                'message' => 'Admin profile not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Admin profile retrieved successfully.',
            'data' => [
                'id_admin' => $user->admin->id_admin,
                'id_user' => $user->id_user,
                'username' => $user->username,
                'email' => $user->email,
            ],
        ]);
    }

    /**
     * PUT /api/admin/profile
     * Mengubah username dan password admin.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        // Pastikan akun memiliki profil Admin.
        if (!$user->admin) {
            return response()->json([
                'success' => false,
                'message' => 'Admin profile not found.',
            ], 404);
        }

        $validated = $request->validate([
            'username' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('users', 'username')
                    ->ignore($user->id_user, 'id_user'),
            ],

            'current_password' => [
                'required_with:password',
                'string',
            ],

            'password' => [
                'sometimes',
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        // Verifikasi password lama jika ingin mengganti password.
        if (isset($validated['password'])) {
            if (
                !Hash::check(
                    $validated['current_password'],
                    $user->password
                )
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'Password lama tidak sesuai.',
                ], 422);
            }

            $user->password = $validated['password'];
        }

        // Update username jika dikirim.
        if (array_key_exists('username', $validated)) {
            $user->username = $validated['username'];
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Admin profile updated successfully.',
            'data' => [
                'id_admin' => $user->admin->id_admin,
                'id_user' => $user->id_user,
                'username' => $user->username,
                'email' => $user->email,
            ],
        ]);
    }
}
?>