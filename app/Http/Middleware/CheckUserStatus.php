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

        if ($user && in_array($user->user_status_id, [2, 3])) {
            $statusWord = $user->user_status_id === 3 ? 'blacklisted' : 'suspended';
            $message = $context === 'owner'
                ? "Your account has been {$statusWord}. Listing management is disabled."
                : "Your account has been {$statusWord}.";

            return response()->json(['message' => $message], 403);
        }

        return $next($request);
    }
}
