<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReportRequest;
use App\Models\Report;
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
        $report = Report::findOrFail($id);

        if ($report->status_id === 17) {
            return response()->json(['message' => 'Cannot modify a dismissed report.'], 403);
        }

        $validated = $request->validate([
            'status_id'   => ['sometimes', 'integer', 'in:14,15,16,17'],
            'description' => ['sometimes', 'nullable', 'string', 'min:10'],
            'admin_note'  => ['sometimes', 'nullable', 'string', 'max:1000'],
        ]);

        $data = array_filter($validated, fn($v) => !is_null($v));

        if (empty($data)) {
            return response()->json(['message' => 'Nothing to update.'], 422);
        }

        $updatedReport = $this->reportService->resolveReport($id, $data);

        return response()->json([
            'message' => 'Report updated.',
            'report'  => $updatedReport,
        ]);
    }
}
