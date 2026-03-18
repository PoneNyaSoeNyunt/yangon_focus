<?php

namespace App\Http\Requests\Auth;

use App\Services\AuthRateLimitService;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    protected $authRateLimitService;

    public function __construct(AuthRateLimitService $authRateLimitService)
    {
        parent::__construct();
        $this->authRateLimitService = $authRateLimitService;
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'phone_number' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $phoneNumber = $this->input('phone_number');
        $password = $this->input('password');

        $user = DB::table('users')
            ->where('phone_number', $phoneNumber)
            ->first();

        if (!$user || !Hash::check($password, $user->password_hash)) {
            $this->authRateLimitService->recordFailedAttempt($phoneNumber);

            throw ValidationException::withMessages([
                'phone_number' => 'The provided credentials are incorrect.',
            ]);
        }

        Auth::loginUsingId($user->id, $this->boolean('remember'));
        
        $this->authRateLimitService->resetAttempts($phoneNumber);
    }
}
