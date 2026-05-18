<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| CaseBridge API Routes
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api automatically.
| JWT authentication is required for all routes except auth/register & auth/login.
|
*/

// ─── Public Routes ──────────────────────────────────────────

Route::post('/contact', [ContactController::class, 'submit']);


Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password-otp', [AuthController::class, 'resetPasswordOtp']);
    Route::post('/google', [AuthController::class, 'googleLogin']);
});

// ─── Protected Routes (JWT Required) ─────────────────────────────

Route::middleware('auth:api')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
    });

    // ─── Organizations ───────────────────────────────────────────

    Route::prefix('organizations')->middleware('org.scope')->group(function () {
        Route::get('/', [OrganizationController::class, 'index']);
        Route::get('/{id}', [OrganizationController::class, 'show']);
        Route::get('/{id}/staff', [OrganizationController::class, 'getStaff']);
        Route::get('/{id}/stats', [OrganizationController::class, 'getStats']);

        // Admin-only actions
        Route::middleware('role:super_admin')->group(function () {
            Route::post('/', [OrganizationController::class, 'store']);
            Route::delete('/{id}', [OrganizationController::class, 'destroy']);
        });

        // Admin + Org Admin actions
        Route::middleware('role:super_admin,org_admin')->group(function () {
            Route::put('/{id}', [OrganizationController::class, 'update']);
            Route::post('/{id}/users', [OrganizationController::class, 'assignUser']);
        });
    });

    // ─── Complaints ──────────────────────────────────────────────

    Route::prefix('complaints')->middleware('org.scope')->group(function () {
        Route::get('/', [ComplaintController::class, 'index']);
        Route::post('/', [ComplaintController::class, 'store']);
        Route::get('/{id}', [ComplaintController::class, 'show']);
        Route::put('/{id}', [ComplaintController::class, 'update']);
        Route::delete('/{id}', [ComplaintController::class, 'destroy']);

        // Status & assignment (staff/admin only)
        Route::middleware('role:super_admin,org_admin,staff')->group(function () {
            Route::patch('/{id}/status', [ComplaintController::class, 'updateStatus']);
            Route::patch('/{id}/assign', [ComplaintController::class, 'assign']);
        });

        // Comments (any authenticated user with access)
        Route::post('/{id}/comments', [ComplaintController::class, 'addComment']);

        // Chat
        Route::get('/{id}/chat', [ChatController::class, 'index']);
        Route::post('/{id}/chat', [ChatController::class, 'store']);
    });

    // ─── Notifications ───────────────────────────────────────────

    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::patch('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::patch('/read-all', [NotificationController::class, 'markAllAsRead']);
    });

    // ─── Dashboard ───────────────────────────────────────────────

    Route::prefix('dashboard')->group(function () {
        Route::get('/stats', [DashboardController::class, 'stats']);
        Route::get('/charts', [DashboardController::class, 'charts']);
        Route::get('/recent', [DashboardController::class, 'recent']);
    });

    // ─── Users (Admin Only) ──────────────────────────────────────

    Route::prefix('users')->middleware('role:super_admin,org_admin')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/{id}', [UserController::class, 'show']);
        Route::put('/{id}', [UserController::class, 'update']);
    });
});
