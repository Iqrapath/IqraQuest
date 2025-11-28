<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class UnblockIP extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'security:unblock-ip {ip : The IP address to unblock}';

    /**
     * The console command description.
     */
    protected $description = 'Unblock a specific IP address';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $ip = $this->argument('ip');

        if (! filter_var($ip, FILTER_VALIDATE_IP)) {
            $this->error('Invalid IP address format.');

            return Command::FAILURE;
        }

        $key = "blocked_ip:{$ip}";

        if (Cache::has($key)) {
            Cache::forget($key);
            Cache::forget("failed_attempts:{$ip}");
            $this->info("✅ IP address {$ip} has been unblocked.");
        } else {
            $this->warn("IP address {$ip} was not blocked.");
        }

        return Command::SUCCESS;
    }
}
