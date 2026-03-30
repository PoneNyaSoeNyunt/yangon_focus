<?php

namespace App\Services;

use App\Models\HostelPaymentMethod;
use App\Models\Payment;
use App\Models\PlatformConfig;
use App\Models\StatusCode;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SubscriptionService
{
    public function getSubscriptionFee(): string
    {
        return PlatformConfig::get('monthly_subscription_fee', '5000');
    }

    public function updateSubscriptionFee(string $value): void
    {
        PlatformConfig::set('monthly_subscription_fee', $value);
    }

    public function getAllOwners(): \Illuminate\Support\Collection
    {
        return User::where('role', 'Owner')
            ->with(['subscriptions' => fn ($q) => $q->with('status')->latest()->limit(1)])
            ->get()
            ->map(fn ($u) => [
                'id'                  => $u->id,
                'full_name'           => $u->full_name,
                'phone_number'        => $u->phone_number,
                'nrc_number'          => $u->nrc_number,
                'subscription_status' => $u->subscriptions->first()?->status?->label ?? 'No Subscription',
            ]);
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

        return [
            'subscription' => $subscription,
            'fee'          => $this->getSubscriptionFee(),
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
            $path          = $screenshot->store('subscription-payments', 'public');
            $screenshotUrl = Storage::url($path);
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
