<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Session\Middleware\StartSession;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;

Route::post('/register', [RegisterController::class, 'register']);

Route::middleware(['web'])->group(function () {
    Route::post('/login', [LoginController::class, 'login'])
        ->middleware('guest');

    Route::post('/logout', [LoginController::class, 'logout'])
        ->middleware('auth');

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
    })->middleware('auth');
});
?>