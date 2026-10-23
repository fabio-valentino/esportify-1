<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;

use App\Http\Controllers\Player\ProfileController;

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AdminProfileController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\RoleManagementController;
use App\Http\Controllers\Admin\PermissionManagementController;
use App\Http\Controllers\Admin\RolePermissionController;
use App\Http\Controllers\Admin\UserRoleController;
use App\Http\Controllers\Admin\UserPermissionController;

use App\Http\Controllers\Api\Admin\GameController;
use App\Http\Controllers\Api\Admin\KategoriController;


// ==========================================
// AUTHENTICATION
// ==========================================

// Register
Route::post('/register', [RegisterController::class, 'register']);

// Login
Route::post('/login', [LoginController::class, 'login']);

// Logout
Route::post('/logout', [LoginController::class, 'logout'])
    ->middleware('auth:sanctum');


// ==========================================
// AUTHENTICATED USER & PLAYER
// ==========================================

Route::middleware('auth:sanctum')->group(function () {

    // ======================================
    // AUTHENTICATED USER
    // ======================================

    // Menampilkan data user yang sedang login
    Route::get('/user', function (Request $request) {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'id_user' => $user->id_user,
                'username' => $user->username,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
            ],
        ]);
    });


    // ======================================
    // PLAYER PROFILE
    // ======================================

    // Menampilkan profil Player
    Route::get('/profile', [ProfileController::class, 'show']);

    // Memperbarui profil Player
    Route::put('/profile', [ProfileController::class, 'update']);

});


// ==========================================
// ADMIN PANEL
// ==========================================

Route::middleware(['auth:sanctum', 'role:admin'])
    ->prefix('admin')
    ->group(function () {

        // ======================================
        // ADMIN PROFILE
        // ======================================

        // Menampilkan profil Admin
        Route::get('/profile', [AdminProfileController::class, 'show']);

        // Memperbarui username dan password Admin
        Route::put('/profile', [AdminProfileController::class, 'update']);


        // ======================================
        // DASHBOARD
        // ======================================

        Route::get('/dashboard', [AdminController::class, 'dashboard'])
            ->middleware('permission:lihat_dashboard');


        // ======================================
        // KELOLA USER
        // ======================================

        // Menampilkan semua user
        Route::get('/users', [UserManagementController::class, 'index'])
            ->middleware('permission:lihat_data_user');

        // Menambahkan user baru
        Route::post('/users', [UserManagementController::class, 'store'])
            ->middleware('permission:lihat_data_user');

        // Mengambil permission beberapa user sekaligus
        Route::get('/users/permissions', [UserPermissionController::class, 'indexAll'])
            ->middleware('permission:atur_permission_user');

        // Menampilkan detail user
        Route::get('/users/{id}', [UserManagementController::class, 'show'])
            ->middleware('permission:lihat_data_user');

        // Mengubah data user
        Route::patch('/users/{id}', [UserManagementController::class, 'update'])
            ->middleware('permission:ubah_data_user');

        // Menghapus user
        Route::delete('/users/{id}', [UserManagementController::class, 'destroy'])
            ->middleware('permission:hapus_data_user');


        // ======================================
        // KELOLA ROLE
        // ======================================

        Route::get('/roles', [RoleManagementController::class, 'index'])
            ->middleware('permission:kelola_role');

        Route::get('/roles/{id}', [RoleManagementController::class, 'show'])
            ->middleware('permission:kelola_role');

        Route::post('/roles', [RoleManagementController::class, 'store'])
            ->middleware('permission:kelola_role');

        Route::patch('/roles/{id}', [RoleManagementController::class, 'update'])
            ->middleware('permission:kelola_role');

        Route::delete('/roles/{id}', [RoleManagementController::class, 'destroy'])
            ->middleware('permission:kelola_role');


        // ======================================
        // KELOLA PERMISSION
        // ======================================

        Route::get('/permissions', [PermissionManagementController::class, 'index'])
            ->middleware('permission:kelola_permission');

        Route::get('/permissions/{id}', [PermissionManagementController::class, 'show'])
            ->middleware('permission:kelola_permission');

        Route::post('/permissions', [PermissionManagementController::class, 'store'])
            ->middleware('permission:kelola_permission');

        Route::patch('/permissions/{id}', [PermissionManagementController::class, 'update'])
            ->middleware('permission:kelola_permission');

        Route::delete('/permissions/{id}', [PermissionManagementController::class, 'destroy'])
            ->middleware('permission:kelola_permission');


        // ======================================
        // PENGATURAN ROLE & PERMISSION
        // ======================================

        Route::get('/roles/{id}/permissions', [RolePermissionController::class, 'index'])
            ->middleware('permission:atur_permission_role');

        Route::post('/roles/{id}/permissions', [RolePermissionController::class, 'store'])
            ->middleware('permission:atur_permission_role');


        // ======================================
        // PENGATURAN USER & ROLE
        // ======================================

        Route::get('/users/{id}/roles', [UserRoleController::class, 'index'])
            ->middleware('permission:atur_role_user');

        Route::post('/users/{id}/roles', [UserRoleController::class, 'store'])
            ->middleware('permission:atur_role_user');


        // ======================================
        // PENGATURAN USER & PERMISSION
        // ======================================

        // Menampilkan permission satu user
        Route::get('/users/{id}/permissions', [UserPermissionController::class, 'index'])
            ->middleware('permission:atur_permission_user');

        // Mengatur direct permission user
        Route::post('/users/{id}/permissions', [UserPermissionController::class, 'update'])
            ->middleware('permission:atur_permission_user');


        // ======================================
        // KELOLA GAME
        // ======================================

        // Menampilkan semua game
        Route::get('/games', [GameController::class, 'index'])
            ->middleware('permission:lihat_data_game');

        // Menampilkan detail game
        Route::get('/games/{id}', [GameController::class, 'show'])
            ->middleware('permission:lihat_data_game');

        // Menambahkan game
        Route::post('/games', [GameController::class, 'store'])
            ->middleware('permission:tambah_data_game');

        // Mengubah data game
        Route::patch('/games/{id}', [GameController::class, 'update'])
            ->middleware('permission:ubah_data_game');

        // Mengubah status game
        Route::patch('/games/{id}/status', [GameController::class, 'updateStatus'])
            ->middleware('permission:ubah_data_game');

        // Menghapus game
        Route::delete('/games/{id}', [GameController::class, 'destroy'])
            ->middleware('permission:hapus_data_game');


        // ======================================
        // KELOLA KATEGORI
        // ======================================

        // Menampilkan semua kategori
        Route::get('/categories', [KategoriController::class, 'index'])
            ->middleware('permission:lihat_data_kategori');

        // Menampilkan detail kategori
        Route::get('/categories/{id}', [KategoriController::class, 'show'])
            ->middleware('permission:lihat_data_kategori');

        // Menambahkan kategori
        Route::post('/categories', [KategoriController::class, 'store'])
            ->middleware('permission:tambah_data_kategori');

        // Mengubah kategori
        Route::patch('/categories/{id}', [KategoriController::class, 'update'])
            ->middleware('permission:ubah_data_kategori');

        // Menghapus kategori
        Route::delete('/categories/{id}', [KategoriController::class, 'destroy'])
            ->middleware('permission:hapus_data_kategori');

    });

?>