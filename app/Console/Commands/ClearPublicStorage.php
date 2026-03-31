<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ClearPublicStorage extends Command
{
    protected $signature   = 'storage:clear-uploads';
    protected $description = 'Delete all uploaded files from public storage folders (preserves .gitignore)';

    private array $folders = [
        'hostel-images',
        'payment-screenshots',
        'licenses',
        'report-evidence',
        'subscription-payments',
    ];

    public function handle(): void
    {
        $base = storage_path('app/public');

        foreach ($this->folders as $folder) {
            $path = "{$base}/{$folder}";

            if (! File::isDirectory($path)) {
                $this->line("  <comment>Skipped</comment>  {$folder} (not found)");
                continue;
            }

            $files = File::files($path);
            $deleted = 0;

            foreach ($files as $file) {
                if ($file->getFilename() === '.gitignore') {
                    continue;
                }
                File::delete($file->getPathname());
                $deleted++;
            }

            $this->line("  <info>Cleared</info>   {$folder}/ — {$deleted} file(s) deleted");
        }

        $this->info('Storage cleanup complete.');
    }
}
