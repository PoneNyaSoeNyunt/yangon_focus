<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\StatusCode;
use App\Traits\HandlesPhoneNormalization;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    use HandlesPhoneNormalization;

    private function statusId(string $label): int
    {
        return StatusCode::where('context', 'Comment')
            ->where('label', $label)
            ->value('id');
    }

    public function adminIndex(Request $request)
    {
        $query = Comment::with(['user', 'statusCode'])->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->whereHas('statusCode', fn ($q) =>
                $q->where('label', $request->status)->where('context', 'Comment')
            );
        }

        return response()->json(['comments' => $query->get()]);
    }

    public function adminResolve(int $id)
    {
        $comment = Comment::findOrFail($id);
        $comment->update(['status_id' => $this->statusId('Resolved')]);

        return response()->json([
            'message' => 'Inquiry marked as resolved.',
            'comment' => $comment->load(['user', 'statusCode']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $comment = Comment::create([
            'user_id'   => $request->user()->id,
            'subject'   => $data['subject'],
            'message'   => $data['message'],
            'status_id' => $this->statusId('Open'),
        ]);

        return response()->json([
            'message' => 'Your inquiry has been submitted.',
            'comment' => $comment,
        ], 201);
    }
}
