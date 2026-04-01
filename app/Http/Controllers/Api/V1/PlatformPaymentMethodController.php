<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PlatformPaymentMethod;
use Illuminate\Http\Request;

class PlatformPaymentMethodController extends Controller
{
    public function index()
    {
        return response()->json(PlatformPaymentMethod::orderBy('id')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'method_name'    => ['required', 'string', 'max:100'],
            'account_number' => ['required', 'string', 'max:100'],
            'account_name'   => ['required', 'string', 'max:255'],
        ]);

        $method = PlatformPaymentMethod::create([...$data, 'is_active' => true]);

        return response()->json(['message' => 'Wallet added successfully.', 'method' => $method], 201);
    }

    public function update(Request $request, int $id)
    {
        $method = PlatformPaymentMethod::findOrFail($id);

        $data = $request->validate([
            'method_name'    => ['sometimes', 'string', 'max:100'],
            'account_number' => ['sometimes', 'string', 'max:100'],
            'account_name'   => ['sometimes', 'string', 'max:255'],
            'is_active'      => ['sometimes', 'boolean'],
        ]);

        $method->update($data);

        return response()->json(['message' => 'Wallet updated successfully.', 'method' => $method]);
    }

    public function destroy(int $id)
    {
        PlatformPaymentMethod::findOrFail($id)->delete();

        return response()->json(['message' => 'Wallet removed successfully.']);
    }
}
