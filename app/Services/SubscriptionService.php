<?php

namespace App\Services;

use App\Models\HostelPaymentMethod;
use App\Models\Payment;
use App\Models\PlatformConfig;
use App\Models\StatusCode;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SubscriptionService
{
    protected ImageService $images;

    public function __construct(ImageService $images)
    {
        $this->images = $images;
    }
    public function getSubscriptionFee(): string
    {
        return PlatformConfig::get('monthly_subscription_fee', '5000');
    }

    public function updateSubscriptionFee(string $value): void
    {
        PlatformConfig::set('monthly_subscription_fee', $value);
    }

    public function verifyOwnerSubscription(int $ownerId): Subscription
    {
        $pendingId = StatusCode::where('context', 'Subscription')
            ->where('label', 'Pending Verification')->value('id');

        $activeId = StatusCode::where('context', 'Subscription')
            ->where('label', 'Active')->value('id');

        $verifiedPaymentId = StatusCode::where('context', 'Payment')
            ->where('label', 'Verified')->value('id');

        $subscription = Subscription::where('owner_id', $ownerId)
            ->where('status_id', $pendingId)
            ->latest()
            ->firstOrFail();

        $owner = User::findOrFail($ownerId);
        $currentExpiry = $owner->subscription_until ? Carbon::parse($owner->subscription_until) : now();
        $newExpiry = ($currentExpiry->isPast() ? now() : $currentExpiry)->addMonth();

        $subscription->update([
            'status_id'  => $activeId,
            'start_date' => now(),
            'end_date'   => $newExpiry,
        ]);

        $owner->update(['subscription_until' => $newExpiry]);

        Payment::where('subscription_id', $subscription->id)
            ->where('payment_status_id', 8)
            ->update(['payment_status_id' => $verifiedPaymentId]);

        return $subscription->fresh('status');
    }

    public function getAllOwners(): \Illuminate\Support\Collection
    {
        return User::where('role', 'Owner')
            ->with([
                'subscriptions' => fn ($q) => $q->with('status')->latest()->limit(1),
                'statusCode:id,label',
                'hostels:id,owner_id,name',
                'nrcTownship',
            ])
            ->get()
            ->map(function ($u) {
                $formattedNrc = null;
                if ($u->nrc_region && $u->nrcTownship && $u->nrc_type && $u->nrc_number) {
                    $formattedNrc = $u->nrc_region . '/' . $u->nrcTownship->township_code . '(' . $u->nrc_type . ')' . $u->nrc_number;
                }

                return [
                    'id'                  => $u->id,
                    'full_name'           => $u->full_name,
                    'phone_number'        => $u->phone_number,
                    'formatted_nrc'       => $formattedNrc,
                    'account_status'      => $u->statusCode?->label ?? 'Active',
                    'subscription_status' => $u->subscriptions->first()?->status?->label ?? 'No Subscription',
                    'hostels'             => $u->hostels->pluck('name')->toArray(),
                ];
            });
    }

    public function getOwnerHostelDetails(int $ownerId): \Illuminate\Database\Eloquent\Collection
    {
        return \App\Models\Hostel::with(['rooms:id,hostel_id,label,price_per_month,max_occupancy', 'township:id,name', 'listingStatus:id,label'])
            ->where('owner_id', $ownerId)
            ->get();
    }

    public function getOwnerSubscriptionHistory(int $ownerId): \Illuminate\Support\Collection
    {
        $subscriptionIds = Subscription::where('owner_id', $ownerId)->pluck('id');

        return Payment::with(['status:id,label', 'subscription:id,start_date,end_date,status_id'])
            ->whereIn('subscription_id', $subscriptionIds)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getOwnerCurrentSubscription(int $ownerId): array
    {
        $subscription = Subscription::with('status')
            ->where('owner_id', $ownerId)
            ->latest()
            ->first();

        $owner = User::find($ownerId);
        $subscriptionUntil = $owner?->subscription_until;
        $daysRemaining = $subscriptionUntil
            ? (int) max(0, now()->diffInDays(Carbon::parse($subscriptionUntil), false))
            : 0;

        return [
            'subscription'       => $subscription,
            'fee'                => $this->getSubscriptionFee(),
            'subscription_until' => $subscriptionUntil,
            'days_remaining'     => $daysRemaining,
        ];
    }

    public function getOwnerPaymentHistory(int $ownerId): \Illuminate\Support\Collection
    {
        $subscriptionIds = Subscription::where('owner_id', $ownerId)->pluck('id');

        return Payment::with('status:id,label')
            ->whereIn('subscription_id', $subscriptionIds)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function submitSubscriptionPayment(int $ownerId, ?int $hostelPaymentMethodId, ?UploadedFile $screenshot): Payment
    {
        $pendingVerificationId = StatusCode::where('context', 'Subscription')
            ->where('label', 'Pending Verification')
            ->value('id');

        $overdueId = StatusCode::where('context', 'Subscription')
            ->where('label', 'Overdue')
            ->value('id');

        $subscription = Subscription::where('owner_id', $ownerId)
            ->whereIn('status_id', [$pendingVerificationId, $overdueId])
            ->latest()
            ->first();

        if (!$subscription) {
            $subscription = Subscription::create([
                'owner_id'   => $ownerId,
                'start_date' => now(),
                'end_date'   => now()->addDays(30),
                'status_id'  => $pendingVerificationId,
            ]);
        }

        $screenshotUrl = null;
        if ($screenshot) {
            $screenshotUrl = $this->images->upload($screenshot, 'subscription-payments');
        }

        $methodName = null;
        if ($hostelPaymentMethodId) {
            $methodName = HostelPaymentMethod::findOrFail($hostelPaymentMethodId)->method_name;
        }

        return Payment::create([
            'hostel_payment_method_id' => $hostelPaymentMethodId,
            'payment_method'           => $methodName ?? 'KBZPay',
            'total_amount'             => PlatformConfig::get('monthly_subscription_fee', '5000'),
            'screenshot_url'           => $screenshotUrl,
            'payment_status_id'        => 8,
            'subscription_id'          => $subscription->id,
        ]);
    }
}
