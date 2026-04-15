<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'status_label'  => $this->status?->label,
            'expires_at'    => $this->expires_at,
            'check_in_date' => $this->check_in_date?->toDateString(),
            'stay_duration' => $this->stay_duration,
            'locked_price'  => $this->locked_price,
            'created_at'    => $this->created_at,
            'bed'           => [
                'id'         => $this->bed?->id,
                'bed_number' => $this->bed?->bed_number,
                'room'       => [
                    'label'  => $this->bed?->room?->label,
                    'hostel' => [
                        'id'       => $this->bed?->room?->hostel?->id,
                        'name'     => $this->bed?->room?->hostel?->name,
                        'address'  => $this->bed?->room?->hostel?->address,
                        'township' => $this->bed?->room?->hostel?->township?->name,
                    ],
                ],
            ],
            'payments' => $this->whenLoaded('payments', fn() =>
                $this->payments->map(fn($p) => [
                    'id'               => $p->id,
                    'payment_method'   => $p->payment_method,
                    'total_amount'     => $p->total_amount,
                    'is_advance'       => (bool) $p->is_advance,
                    'status'           => $p->status?->label,
                    'screenshot_url'   => $p->screenshot_url,
                    'rejection_reason' => $p->rejection_reason,
                    'paid_at'          => $p->created_at?->toIso8601String(),
                    'updated_at'       => $p->updated_at?->toIso8601String(),
                ])
            ),
            'cancel_reason'  => $this->cancel_reason,
            'cancelled_by'   => $this->cancelled_by,
            'cancelled_at'   => $this->cancelled_by ? $this->updated_at?->toIso8601String() : null,
            'has_review' => $this->whenLoaded('review', fn() => $this->review !== null, false),
        ];
    }
}
