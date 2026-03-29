<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function adminIndex(Request $request)
    {
        $query = Comment::with('user')->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json(['comments' => $query->get()]);
    }

    public function adminResolve(int $id)
    {
        $comment = Comment::findOrFail($id);
        $comment->update(['status' => 'Resolved']);

        return response()->json([
            'message' => 'Inquiry marked as resolved.',
            'comment' => $comment->load('user'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $comment = Comment::create([
            'user_id' => $request->user()->id,
            'subject' => $data['subject'],
            'message' => $data['message'],
            'status'  => 'Open',
        ]);

        return response()->json([
            'message' => 'Your inquiry has been submitted.',
            'comment' => $comment,
        ], 201);
    }
}
