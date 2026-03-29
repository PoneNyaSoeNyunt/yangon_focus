<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReportRequest;
use App\Models\ReportCategory;
use App\Models\StatusCode;
use App\Models\User;
use App\Services\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(private ReportService $reportService) {}

    public function categories(Request $request)
    {
        $target = $request->query('target'); // 'Guest' or 'Owner'

        $query = ReportCategory::query();

        if ($target) {
            $query->whereIn('target_role', [$target, 'Both']);
        }

        return response()->json($query->orderBy('id')->get(['id', 'name', 'target_role']));
    }

    public function store(ReportRequest $request)
    {
        $report = $this->reportService->createReport(
            $request->user()->id,
            $request->validated() + ['evidence' => $request->file('evidence')]
        );

        return response()->json([
            'message' => 'Report submitted successfully.',
            'report'  => $report,
        ], 201);
    }

    public function adminIndex(Request $request)
    {
        $statusId = null;
        if ($request->query('status')) {
            $statusId = StatusCode::where('context', 'Report')
                ->where('label', $request->query('status'))
                ->value('id');
        }

        $reports = $this->reportService->getAllReports($statusId);

        return response()->json(['reports' => $reports]);
    }

    public function resolve(Request $request, int $id)
    {
        $request->validate([
            'action'     => ['required', 'in:Dismiss,Issue Warning,Suspend User'],
            'admin_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $actionStatusMap = [
            'Dismiss'       => 17,
            'Issue Warning' => 15,
            'Suspend User'  => 16,
        ];

        $statusId = $actionStatusMap[$request->action];

        $report = $this->reportService->resolveReport($id, $statusId, $request->admin_note);

        if ($request->action === 'Suspend User') {
            $suspendedStatus = StatusCode::where('context', 'User')
                ->where('label', 'Suspended')
                ->firstOrFail();

            User::findOrFail($report->offender_id)
                ->update(['user_status_id' => $suspendedStatus->id]);
        }

        return response()->json([
            'message' => 'Report updated.',
            'report'  => $report->load(['reporter', 'offender', 'category']),
        ]);
    }
}
