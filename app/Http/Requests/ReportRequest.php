<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'offender_id'  => ['required', 'integer', 'exists:users,id'],
            'category_id'  => ['required', 'integer', 'exists:report_categories,id'],
            'description'  => ['nullable', 'string', 'max:1000'],
            'evidence'     => ['required', 'file', 'image', 'max:5120'],
        ];
    }
}
