<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->user_status_id === 2) {
            return response()->json([
                'message' => 'Your account is currently suspended.',
            ], 403);
        }

        return $next($request);
    }
}
