<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\SuperAdminController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('check.lockout');

    Route::prefix('admin')->middleware(['auth:sanctum', 'admin.only'])->group(function () {
        Route::get('/users', [SuperAdminController::class, 'users']);
        Route::patch('/users/{id}/status', [SuperAdminController::class, 'updateStatus']);
    });
});
