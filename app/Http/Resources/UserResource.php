<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $formattedNrc = null;
        if ($this->nrc_region && $this->nrcTownship && $this->nrc_type && $this->nrc_number) {
            $formattedNrc = $this->nrc_region . '/' . $this->nrcTownship->township_code . '(' . $this->nrc_type . ')' . $this->nrc_number;
        }

        return [
            'id'             => $this->id,
            'phone_number'   => $this->phone_number,
            'full_name'      => $this->full_name,
            'nrc_region'     => $this->nrc_region,
            'nrc_township_id'=> $this->nrc_township_id,
            'nrc_type'       => $this->nrc_type,
            'nrc_number'     => $this->nrc_number,
            'formatted_nrc'  => $formattedNrc,
            'role'           => $this->role,
            'user_status_id' => $this->user_status_id,
            'status_label'   => $this->statusCode?->label ?? null,
            'created_at'     => $this->created_at,
            'updated_at'     => $this->updated_at,
        ];
    }
}
