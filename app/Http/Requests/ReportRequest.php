<?php

namespace App\Http\Requests;

use App\Models\ReportCategory;
use Illuminate\Foundation\Http\FormRequest;

class ReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isOther = ReportCategory::where('id', $this->input('category_id'))
            ->where('name', 'Other')
            ->exists();

        return [
            'offender_id'  => ['required', 'integer', 'exists:users,id'],
            'category_id'  => ['required', 'integer', 'exists:report_categories,id'],
            'description'  => $isOther
                ? ['required', 'string', 'min:20', 'max:1000']
                : ['nullable', 'string', 'max:1000'],
            'evidence'     => ['required', 'file', 'image', 'max:5120'],
        ];
    }
}
