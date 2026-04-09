<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['status' => 'success', 'message' => 'Yangon Focus API is Live']);
});

require __DIR__.'/auth.php';
