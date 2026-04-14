<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserProfileController extends Controller
{
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        if ($request->has('phone_number')) {
            $request->merge([
                'phone_number' => \App\Models\User::normalizePhoneNumber($request->input('phone_number')),
            ]);
        }

        $validated = $request->validate([
            'full_name'    => ['required', 'string', 'max:255'],
            'phone_number' => ['required', 'string', 'unique:users,phone_number,' . $user->id, 'regex:/^09\d{7,9}$/'],
        ], [
            'phone_number.regex' => 'Please enter a valid format: 09 followed by 7 to 9 digits (e.g., 09123456789).',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user'    => new UserResource($user->fresh()->load(['statusCode', 'nrcTownship'])),
        ]);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'confirmed', Password::min(6)],
        ]);

        if (!Hash::check($request->current_password, $user->password_hash)) {
            return response()->json([
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        if (Hash::check($request->password, $user->password_hash)) {
            return response()->json([
                'errors' => ['password' => ['New password must be different from the current password.']],
            ], 422);
        }

        $user->update(['password_hash' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password updated successfully.']);
    }
}
