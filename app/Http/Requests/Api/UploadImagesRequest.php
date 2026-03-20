<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UploadImagesRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'images'   => ['required', 'array', 'min:1', 'max:100'],
            'images.*' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ];
    }
}
