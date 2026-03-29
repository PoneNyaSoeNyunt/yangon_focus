<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    public function handle(Request $request, Closure $next, string $context = 'guest'): Response
    {
        $user = $request->user();

        if ($user && $user->user_status_id === 2) {
            $message = $context === 'owner'
                ? 'Your account is currently suspended. Listing management is disabled.'
                : 'Your account is currently suspended.';

            return response()->json(['message' => $message], 403);
        }

        return $next($request);
    }
}
