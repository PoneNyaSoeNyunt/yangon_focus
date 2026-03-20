<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class OwnerMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->user()?->role !== 'Owner') {
            return response()->json(['message' => 'Forbidden. Owner access only.'], 403);
        }

        return $next($request);
    }
}
