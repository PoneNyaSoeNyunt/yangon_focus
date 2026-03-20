<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class AddRoomsRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'rooms'                   => ['required', 'array', 'min:1'],
            'rooms.*.label'           => ['required', 'string', 'max:100'],
            'rooms.*.type_id'         => ['required', 'integer', 'exists:room_types,id'],
            'rooms.*.price_per_month' => ['required', 'numeric', 'min:0'],
            'rooms.*.max_occupancy'   => ['required', 'integer', 'min:1', 'max:20'],
        ];
    }
}
