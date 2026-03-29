<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class CreateHostelRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'address'     => ['required', 'string', 'max:500'],
            'house_rules' => ['nullable', 'string'],
            'type'        => ['required', 'in:Male Only,Female Only,Mixed'],
            'township_id' => ['required', 'integer', 'exists:townships,id'],
            'facilities'                    => ['nullable', 'array'],
            'facilities.*'                  => ['string', 'max:100'],
            'payment_methods'               => ['nullable', 'array'],
            'payment_methods.*.method_name'    => ['required_with:payment_methods', 'string', 'max:100'],
            'payment_methods.*.account_number' => ['required_with:payment_methods', 'string', 'max:50'],
            'payment_methods.*.account_name'   => ['required_with:payment_methods', 'string', 'max:100'],
        ];
    }
}
