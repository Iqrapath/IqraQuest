<?php

namespace App\Console\Commands;

use App\Services\ZoomService;
use Illuminate\Console\Command;

class ZoomTest extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'zoom:test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test Zoom API connection and meeting creation';

    /**
     * Execute the console command.
     */
    public function handle(ZoomService $zoom)
    {
        $this->info('Testing Zoom Connection...');

        $token = $zoom->getAccessToken();

        if (!$token) {
            $this->error('Failed to get Access Token. Check your ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET in .env');
            return 1;
        }

        $this->info('Access Token: ' . substr($token, 0, 10) . '...');

        $this->info('Attempting to create a test meeting...');

        $meeting = $zoom->createMeeting([
            'topic' => 'IqraQuest Zoom Test',
            'start_time' => now()->addHour()->toIso8601String(),
            'duration' => 30,
            'agenda' => 'Testing the new Zoom integration logic.',
        ]);

        if (!$meeting) {
            $this->error('Failed to create meeting.');
            return 1;
        }

        $this->table(
            ['Field', 'Value'],
            [
                ['Meeting ID', $meeting['id']],
                ['Join URL', $meeting['join_url']],
            ]
        );

        if ($this->confirm('Do you want to delete this test meeting?')) {
            if ($zoom->deleteMeeting($meeting['id'])) {
                $this->info('Meeting deleted successfully.');
            } else {
                $this->error('Failed to delete meeting.');
            }
        }

        return 0;
    }
}
