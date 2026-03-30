<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\SuperAdminController;
use App\Http\Controllers\Api\V1\AdminAnalyticsController;
use App\Http\Controllers\Api\V1\AdminLicenseController;
use App\Http\Controllers\Api\V1\UserProfileController;
use App\Http\Controllers\Api\V1\OwnerHostelController;
use App\Http\Controllers\Api\V1\LookupController;
use App\Http\Controllers\Api\V1\PublicHostelController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\CurrentStayController;
use App\Http\Controllers\Api\V1\CommentController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\RenterController;
use App\Http\Controllers\Api\V1\SubscriptionConfigController;
use App\Http\Controllers\Api\V1\OwnerManagementController;
use App\Http\Controllers\Api\V1\OwnerSubscriptionController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('check.lockout');

    Route::get('/townships',           [LookupController::class, 'townships']);
    Route::get('/room-types',          [LookupController::class, 'roomTypes']);
    Route::get('/contact-info',        [LookupController::class, 'contactInfo']);
    Route::get('/report-categories',   [ReportController::class, 'categories']);
    Route::get('/public/hostels',                          [PublicHostelController::class, 'index']);
    Route::get('/public/hostels/{id}',                    [PublicHostelController::class, 'show']);
    Route::get('/public/hostels/{id}/payment-methods',    [PublicHostelController::class, 'paymentMethods']);
    Route::get('/public/hostels/{id}/reviews',            [ReviewController::class, 'index']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::patch('/user/profile',                    [UserProfileController::class, 'updateProfile'])->middleware('check.status');
        Route::patch('/user/password',                   [UserProfileController::class, 'updatePassword'])->middleware('check.status');
        Route::post('/bookings',                         [BookingController::class, 'store'])->middleware('check.status');
        Route::get('/my-bookings',                       [BookingController::class, 'guestIndex']);
        Route::get('/guest/bookings',                    [BookingController::class, 'guestIndex']);
        Route::delete('/guest/bookings/{id}',            [BookingController::class, 'guestCancel']);
        Route::patch('/guest/bookings/{id}/pay-cash',    [BookingController::class, 'guestPayCash']);
        Route::post('/bookings/{id}/payment',            [PaymentController::class, 'guestUpload']);
        Route::post('/guest/bookings/{id}/review',       [ReviewController::class, 'store']);
        Route::patch('/guest/bookings/{id}/finish',          [BookingController::class, 'guestFinish']);
        Route::post('/guest/bookings/{id}/advance-payment',  [PaymentController::class, 'guestUploadAdvance']);
        Route::get('/guest/current-stays',               [CurrentStayController::class, 'index']);
        Route::get('/guest/current-stays/{booking_id}',  [CurrentStayController::class, 'show']);
        Route::post('/reports',                          [ReportController::class, 'store']);
        Route::post('/comments',                         [CommentController::class, 'store']);
    });

    Route::prefix('owner')->middleware(['auth:sanctum', 'owner.only'])->group(function () {
        Route::get('/bookings',                          [BookingController::class, 'ownerIndex']);
        Route::patch('/bookings/{id}/cancel',            [BookingController::class, 'ownerCancel']);
        Route::post('/bookings/{id}/cash',               [PaymentController::class, 'recordCash']);
        Route::patch('/rooms/{id}',                      [OwnerHostelController::class, 'updateRoom']);
        Route::get('/payments/pending',                  [PaymentController::class, 'ownerPendingDigital']);
        Route::patch('/payments/{id}/verify',            [PaymentController::class, 'verifyDigital']);

        Route::get('/renters',                           [RenterController::class, 'index']);
        Route::get('/renters/{userId}/payments',         [RenterController::class, 'payments']);

        Route::get('/reviews',                          [ReviewController::class, 'ownerIndex']);
        Route::get('/subscription',                     [OwnerSubscriptionController::class, 'show']);
        Route::get('/subscription/history',            [OwnerSubscriptionController::class, 'history']);
        Route::post('/subscription/pay',               [OwnerSubscriptionController::class, 'store']);
        Route::get('/hostels',                          [OwnerHostelController::class, 'index']);
        Route::post('/hostels',                         [OwnerHostelController::class, 'store'])->middleware('check.status:owner');
        Route::get('/hostels/{id}',                     [OwnerHostelController::class, 'show']);
        Route::patch('/hostels/{id}',                   [OwnerHostelController::class, 'update'])->middleware('check.status:owner');
        Route::post('/hostels/{id}/rooms',              [OwnerHostelController::class, 'addRooms'])->middleware('check.status:owner');
        Route::post('/hostels/{id}/license',            [OwnerHostelController::class, 'uploadLicense']);
        Route::post('/hostels/{id}/images',              [OwnerHostelController::class, 'uploadImages']);
        Route::patch('/hostels/{id}/images/{imageId}/primary', [OwnerHostelController::class, 'makeImagePrimary']);
        Route::delete('/hostels/{id}/images/{imageId}',         [OwnerHostelController::class, 'deleteImage']);
    });

    Route::prefix('admin')->middleware(['auth:sanctum', 'admin.only'])->group(function () {
        Route::get('/analytics',             [AdminAnalyticsController::class, 'index']);
        Route::get('/users',                 [SuperAdminController::class, 'users']);
        Route::patch('/users/{id}/status',   [SuperAdminController::class, 'updateStatus']);
        Route::get('/licenses',              [AdminLicenseController::class, 'index']);
        Route::patch('/licenses/{id}/verify',[AdminLicenseController::class, 'verify']);
        Route::get('/reports',               [ReportController::class, 'adminIndex']);
        Route::patch('/reports/{id}/resolve',[ReportController::class, 'resolve']);
        Route::get('/comments',                          [CommentController::class, 'adminIndex']);
        Route::patch('/comments/{id}/resolve',           [CommentController::class, 'adminResolve']);

        Route::get('/subscription-config',               [SubscriptionConfigController::class, 'index']);
        Route::patch('/subscription-config',             [SubscriptionConfigController::class, 'update']);

        Route::get('/owners',                            [OwnerManagementController::class, 'index']);
        Route::get('/owners/{id}/hostels',               [OwnerManagementController::class, 'hostelDetails']);
        Route::get('/owners/{id}/subscription-history',  [OwnerManagementController::class, 'subscriptionHistory']);
    });
});
