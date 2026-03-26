<?php

namespace App\Services;

use App\Models\Report;
use Illuminate\Support\Facades\Storage;

class ReportService
{
    public function createReport(int $reporterId, array $data): Report
    {
        $path = $data['evidence']->store('report-evidence', 'public');

        return Report::create([
            'reporter_id'     => $reporterId,
            'offender_id'     => $data['offender_id'],
            'reason_category' => $data['reason_category'],
            'description'     => $data['description'] ?? null,
            'evidence_url'    => Storage::url($path),
        ]);
    }

    public function resolveReport(int $reportId, string $status, ?string $adminNote): Report
    {
        $report = Report::findOrFail($reportId);

        $report->update([
            'status'     => $status,
            'admin_note' => $adminNote,
        ]);

        return $report->fresh(['reporter', 'offender']);
    }

    public function getAllReports(?string $status = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = Report::with(['reporter', 'offender'])->latest();

        if ($status) {
            $query->where('status', $status);
        }

        return $query->get();
    }
}
