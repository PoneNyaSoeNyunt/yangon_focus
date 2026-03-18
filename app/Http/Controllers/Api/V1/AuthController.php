<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\UserService;
use App\Services\AuthRateLimitService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    protected $userService;
    protected $authRateLimitService;

    public function __construct(UserService $userService, AuthRateLimitService $authRateLimitService)
    {
        $this->userService = $userService;
        $this->authRateLimitService = $authRateLimitService;
    }

    public function register(RegisterRequest $request)
    {
        $user = $this->userService->createUser($request->validated());

        $userModel = \App\Models\User::find($user->id);
        $token = $userModel->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'user' => new UserResource($userModel),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $phoneNumber = $request->input('phone_number');
        $password = $request->input('password');

        $user = DB::table('users')
            ->where('phone_number', $phoneNumber)
            ->first();

        if (!$user || !Hash::check($password, $user->password_hash)) {
            $this->authRateLimitService->recordFailedAttempt($phoneNumber);

            return response()->json([
                'message' => 'The provided credentials are incorrect.',
            ], 401);
        }

        $this->authRateLimitService->resetAttempts($phoneNumber);

        $userModel = \App\Models\User::find($user->id);
        $token = $userModel->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => new UserResource($userModel),
            'token' => $token,
        ], 200);
    }
}
