<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\SuperAdminController;
use App\Http\Controllers\Api\V1\AdminAnalyticsController;
use App\Http\Controllers\Api\V1\AdminLicenseController;
use App\Http\Controllers\Api\V1\UserProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('check.lockout');

    Route::middleware('auth:sanctum')->group(function () {
        Route::patch('/user/profile',  [UserProfileController::class, 'updateProfile']);
        Route::patch('/user/password', [UserProfileController::class, 'updatePassword']);
    });

    Route::prefix('admin')->middleware(['auth:sanctum', 'admin.only'])->group(function () {
        Route::get('/analytics',             [AdminAnalyticsController::class, 'index']);
        Route::get('/users',                 [SuperAdminController::class, 'users']);
        Route::patch('/users/{id}/status',   [SuperAdminController::class, 'updateStatus']);
        Route::get('/licenses',              [AdminLicenseController::class, 'index']);
        Route::patch('/licenses/{id}/verify',[AdminLicenseController::class, 'verify']);
    });
});
