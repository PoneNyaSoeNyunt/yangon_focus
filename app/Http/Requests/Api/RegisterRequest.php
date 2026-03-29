<?php

namespace App\Http\Requests\Api;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normalize the phone number to 09 format before validation runs.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('phone_number')) {
            $this->merge([
                'phone_number' => User::normalizePhoneNumber($this->input('phone_number')),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'phone_number' => ['required', 'string', 'unique:users,phone_number'],
            'full_name' => ['required', 'string', 'max:255'],
            'nrc_number' => ['required', 'string', 'max:255'],
            'role' => ['required', 'string', 'in:guest,owner'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }
}
