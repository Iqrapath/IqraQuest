<?php

namespace App\Console\Commands;

use App\Services\EscrowService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessEscrowReleases extends Command
{
    protected $signature = 'escrow:process-releases';

    protected $description = 'Process eligible escrow releases after dispute window expires';

    public function handle(EscrowService $escrowService): int
    {
        $this->info('Processing eligible escrow releases...');

        $results = $escrowService->processEligibleReleases();

        $this->info("Released: {$results['released']}");
        $this->info("Failed: {$results['failed']}");

        if (!empty($results['errors'])) {
            $this->warn('Errors:');
            foreach ($results['errors'] as $error) {
                $this->error("  - {$error}");
            }
        }

        Log::info('Escrow release job completed', $results);

        return Command::SUCCESS;
    }
}
