<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class LoginController extends Controller
{
    /**
     * Login user menggunakan Laravel Sanctum Bearer Token.
     */
    public function login(Request $request)
    {
        // Validasi input login
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'password.required' => 'Password wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Data login tidak valid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $credentials = $validator->validated();

        // Cek email dan password
        if (!Auth::guard('web')->validate($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah.',
            ], 401);
        }

        // Ambil user berdasarkan email
        $user = \App\Models\User::where(
            'email',
            $credentials['email']
        )->first();

        // Cek status akun
        if ($user->status !== 'aktif') {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda tidak aktif.',
            ], 403);
        }

        // Simpan waktu login terakhir
        $user->terakhir_login = now();
        $user->save();

        // Hapus token lama jika ingin membatasi satu token per login
        // (Tidak digunakan agar perangkat lain tetap bisa login)

        // Buat Bearer Token Sanctum
        $token = $user->createToken('esportify-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'id_user' => $user->id_user,
                'username' => $user->username,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ], 200);
    }

    /**
     * Logout dengan menghapus token yang sedang digunakan.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ], 200);
    }
}
?>