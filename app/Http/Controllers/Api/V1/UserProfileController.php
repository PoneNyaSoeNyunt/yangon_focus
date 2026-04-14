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

        $validated = $request->validate([
            'full_name'       => ['required', 'string', 'max:255'],
            'phone_number'    => ['required', 'string', 'unique:users,phone_number,' . $user->id],
            'nrc_region'      => ['required', 'integer', 'between:1,14'],
            'nrc_township_id' => ['required', 'integer', 'exists:nrc_townships,id'],
            'nrc_type'        => ['required', 'string', 'in:N,P,E,T'],
            'nrc_number'      => ['required', 'string', 'size:6', 'regex:/^\d{6}$/'],
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
