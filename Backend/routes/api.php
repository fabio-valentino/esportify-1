<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// AUTH CONTROLLERS
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;

// PLAYER CONTROLLERS
use App\Http\Controllers\Player\ProfileController;
use App\Http\Controllers\Player\PengajuanTurnamenController;
use App\Http\Controllers\Api\Player\GameController as PlayerGameController;

// ADMIN CONTROLLERS
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AdminProfileController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\RoleManagementController;
use App\Http\Controllers\Admin\PermissionManagementController;
use App\Http\Controllers\Admin\RolePermissionController;
use App\Http\Controllers\Admin\UserRoleController;
use App\Http\Controllers\Admin\UserPermissionController;
use App\Http\Controllers\Admin\PengajuanTurnamenController as AdminPengajuanTurnamenController;

use App\Http\Controllers\Api\Admin\GameController;
use App\Http\Controllers\Api\Admin\KategoriController;


// ==========================================
// AUTHENTICATION
// ==========================================

Route::post('/register', [RegisterController::class, 'register']);

Route::post('/login', [LoginController::class, 'login']);

Route::post('/logout', [LoginController::class, 'logout'])
    ->middleware('auth:sanctum');


// ==========================================
// AUTHENTICATED USER & PLAYER
// ==========================================

Route::middleware('auth:sanctum')->group(function () {

    // AUTHENTICATED USER
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

    // PLAYER PROFILE
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    // GAME PLAYER
    Route::get('/games', [PlayerGameController::class, 'index']);
    Route::get('/games/{id}', [PlayerGameController::class, 'show']);

    // PENGAJUAN TURNAMEN PLAYER
    Route::get('/pengajuan-turnamen', [
        PengajuanTurnamenController::class,
        'index'
    ]);

    Route::post('/pengajuan-turnamen', [
        PengajuanTurnamenController::class,
        'store'
    ]);

    Route::get('/pengajuan-turnamen/{id}', [
        PengajuanTurnamenController::class,
        'show'
    ]);

    Route::post('/pengajuan-turnamen/{id}/start-edit', [
        PengajuanTurnamenController::class,
        'startEdit'
    ]);

    Route::put('/pengajuan-turnamen/{id}', [
        PengajuanTurnamenController::class,
        'update'
    ]);
});


// ==========================================
// ADMIN PANEL
// ==========================================

Route::middleware(['auth:sanctum', 'role:admin'])
    ->prefix('admin')
    ->group(function () {

        // ==========================================
        // KELOLA PENGAJUAN TURNAMEN
        // TETAP BISA DIAKSES MESKIPUN TENGGAT HABIS
        // ==========================================

        Route::get('/pengajuan-turnamen', [
            AdminPengajuanTurnamenController::class,
            'index'
        ])->middleware('permission:kelola_turnamen');

        Route::get('/pengajuan-turnamen/{id}', [
            AdminPengajuanTurnamenController::class,
            'show'
        ])->middleware('permission:kelola_turnamen');

        Route::post('/pengajuan-turnamen/{id}/approve', [
            AdminPengajuanTurnamenController::class,
            'approve'
        ])->middleware('permission:kelola_turnamen');

        Route::post('/pengajuan-turnamen/{id}/reject', [
            AdminPengajuanTurnamenController::class,
            'reject'
        ])->middleware('permission:kelola_turnamen');

        Route::post('/pengajuan-turnamen/{id}/revision', [
            AdminPengajuanTurnamenController::class,
            'requestRevision'
        ])->middleware('permission:kelola_turnamen');


        // ==========================================
        // ADMIN PANEL LAINNYA
        // AKAN TERKUNCI JIKA ADA PENGAJUAN TERLAMBAT
        // ==========================================

        Route::middleware('admin.pengajuan.deadline')->group(function () {

            // ADMIN PROFILE
            Route::get('/profile', [
                AdminProfileController::class,
                'show'
            ]);

            Route::put('/profile', [
                AdminProfileController::class,
                'update'
            ]);


            // DASHBOARD
            Route::get('/dashboard', [
                AdminController::class,
                'dashboard'
            ])->middleware('permission:lihat_dashboard');


            // KELOLA USER
            Route::get('/users', [
                UserManagementController::class,
                'index'
            ])->middleware('permission:lihat_data_user');

            Route::post('/users', [
                UserManagementController::class,
                'store'
            ])->middleware('permission:tambah_data_user');

            Route::get('/users/permissions', [
                UserPermissionController::class,
                'indexAll'
            ])->middleware('permission:atur_permission_user');

            Route::get('/users/{id}', [
                UserManagementController::class,
                'show'
            ])->middleware('permission:lihat_data_user');

            Route::patch('/users/{id}', [
                UserManagementController::class,
                'update'
            ])->middleware('permission:ubah_data_user');

            Route::delete('/users/{id}', [
                UserManagementController::class,
                'destroy'
            ])->middleware('permission:hapus_data_user');


            // KELOLA ROLE
            Route::get('/roles', [
                RoleManagementController::class,
                'index'
            ])->middleware('permission:kelola_role');

            Route::get('/roles/{id}', [
                RoleManagementController::class,
                'show'
            ])->middleware('permission:kelola_role');

            Route::post('/roles', [
                RoleManagementController::class,
                'store'
            ])->middleware('permission:kelola_role');

            Route::patch('/roles/{id}', [
                RoleManagementController::class,
                'update'
            ])->middleware('permission:kelola_role');

            Route::delete('/roles/{id}', [
                RoleManagementController::class,
                'destroy'
            ])->middleware('permission:kelola_role');


            // KELOLA PERMISSION
            Route::get('/permissions', [
                PermissionManagementController::class,
                'index'
            ])->middleware('permission:kelola_permission');

            Route::get('/permissions/{id}', [
                PermissionManagementController::class,
                'show'
            ])->middleware('permission:kelola_permission');

            Route::post('/permissions', [
                PermissionManagementController::class,
                'store'
            ])->middleware('permission:kelola_permission');

            Route::patch('/permissions/{id}', [
                PermissionManagementController::class,
                'update'
            ])->middleware('permission:kelola_permission');

            Route::delete('/permissions/{id}', [
                PermissionManagementController::class,
                'destroy'
            ])->middleware('permission:kelola_permission');


            // PENGATURAN ROLE & PERMISSION
            Route::get('/roles/{id}/permissions', [
                RolePermissionController::class,
                'index'
            ])->middleware('permission:atur_permission_role');

            Route::post('/roles/{id}/permissions', [
                RolePermissionController::class,
                'store'
            ])->middleware('permission:atur_permission_role');


            // PENGATURAN USER & ROLE
            Route::get('/users/{id}/roles', [
                UserRoleController::class,
                'index'
            ])->middleware('permission:atur_role_user');

            Route::post('/users/{id}/roles', [
                UserRoleController::class,
                'store'
            ])->middleware('permission:atur_role_user');


            // PENGATURAN USER & PERMISSION
            Route::get('/users/{id}/permissions', [
                UserPermissionController::class,
                'index'
            ])->middleware('permission:atur_permission_user');

            Route::post('/users/{id}/permissions', [
                UserPermissionController::class,
                'update'
            ])->middleware('permission:atur_permission_user');


            // KELOLA GAME ADMIN
            Route::get('/games', [
                GameController::class,
                'index'
            ])->middleware('permission:lihat_data_game');

            Route::get('/games/{id}', [
                GameController::class,
                'show'
            ])->middleware('permission:lihat_data_game');

            Route::post('/games', [
                GameController::class,
                'store'
            ])->middleware('permission:tambah_data_game');

            Route::patch('/games/{id}', [
                GameController::class,
                'update'
            ])->middleware('permission:ubah_data_game');

            Route::delete('/games/{id}', [
                GameController::class,
                'destroy'
            ])->middleware('permission:hapus_data_game');


            // KELOLA KATEGORI
            Route::get('/categories', [
                KategoriController::class,
                'index'
            ])->middleware('permission:lihat_data_kategori');

            Route::get('/categories/{id}', [
                KategoriController::class,
                'show'
            ])->middleware('permission:lihat_data_kategori');

            Route::post('/categories', [
                KategoriController::class,
                'store'
            ])->middleware('permission:tambah_data_kategori');

            Route::patch('/categories/{id}', [
                KategoriController::class,
                'update'
            ])->middleware('permission:ubah_data_kategori');

            Route::delete('/categories/{id}', [
                KategoriController::class,
                'destroy'
            ])->middleware('permission:hapus_data_kategori');

        });
    });
?>