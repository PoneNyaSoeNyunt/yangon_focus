<?php

namespace App\Http\Middleware;

use App\Services\AuthRateLimitService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckLockout
{
    protected $authRateLimitService;

    public function __construct(AuthRateLimitService $authRateLimitService)
    {
        $this->authRateLimitService = $authRateLimitService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $phoneNumber = $request->input('phone_number');

        if (!$phoneNumber) {
            return $next($request);
        }

        $lockoutStatus = $this->authRateLimitService->isLockedOut($phoneNumber);

        if ($lockoutStatus['locked']) {
            $remainingMinutes = $lockoutStatus['remaining_minutes'];
            
            return response()->json([
                'message' => "Too many failed attempts. Please try again in {$remainingMinutes} minutes."
            ], 423);
        }

        return $next($request);
    }
}
