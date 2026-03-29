<?php

namespace App\Traits;

trait HandlesPhoneNormalization
{
    /**
     * Normalize a phone number to the 09XXXXXXXX Myanmar format.
     * Handles +959, 959, and 09 prefixes, and strips whitespace/dashes.
     */
    protected function normalizePhoneNumber(string $phone): string
    {
        $phone = preg_replace('/[\s\-]/', '', $phone);

        if (str_starts_with($phone, '+959')) {
            return '09' . substr($phone, 4);
        }

        if (str_starts_with($phone, '959')) {
            return '09' . substr($phone, 3);
        }

        return $phone;
    }
}
