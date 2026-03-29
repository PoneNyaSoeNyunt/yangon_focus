<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReportRequest;
use App\Models\ReportCategory;
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
        $reports = $this->reportService->getAllReports($request->query('status'));

        return response()->json(['reports' => $reports]);
    }

    public function resolve(Request $request, int $id)
    {
        $request->validate([
            'status'     => ['required', 'in:Resolved,Action Taken'],
            'admin_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $report = $this->reportService->resolveReport(
            $id,
            $request->status,
            $request->admin_note
        );

        return response()->json([
            'message' => 'Report updated.',
            'report'  => $report,
        ]);
    }
}
