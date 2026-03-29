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
            'reporter_id'  => $reporterId,
            'offender_id'  => $data['offender_id'],
            'category_id'  => $data['category_id'],
            'description'  => $data['description'] ?? null,
            'evidence_url' => Storage::url($path),
        ]);
    }

    public function resolveReport(int $reportId, array $data): Report
    {
        $report = Report::findOrFail($reportId);

        $report->update($data);

        return $report->fresh(['reporter', 'offender', 'category', 'statusCode']);
    }

    public function getAllReports(?int $statusId = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = Report::with(['reporter', 'offender', 'category', 'statusCode'])->latest();

        if ($statusId) {
            $query->where('status_id', $statusId);
        }

        return $query->get();
    }
}
