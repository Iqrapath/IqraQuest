<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Pusher\Pusher;

class TestDirectBroadcast extends Command
{
    protected $signature = 'test:direct-broadcast';
    protected $description = 'Test broadcasting directly via Pusher SDK';

    public function handle()
    {
        $this->info('🚀 Testing direct Pusher broadcast to Reverb...');
        $this->newLine();
        
        try {
            // Create Pusher instance with Reverb config
            $pusher = new Pusher(
                config('broadcasting.connections.reverb.key'),
                config('broadcasting.connections.reverb.secret'),
                config('broadcasting.connections.reverb.app_id'),
                [
                    'scheme' => config('broadcasting.connections.reverb.options.scheme'),
                    'host' => config('broadcasting.connections.reverb.options.host'),
                    'port' => config('broadcasting.connections.reverb.options.port'),
                    'useTLS' => config('broadcasting.connections.reverb.options.useTLS'),
                ]
            );
            
            $this->info('✅ Pusher instance created');
            $this->info('   Host: ' . config('broadcasting.connections.reverb.options.host'));
            $this->info('   Port: ' . config('broadcasting.connections.reverb.options.port'));
            $this->info('   Scheme: ' . config('broadcasting.connections.reverb.options.scheme'));
            
            $this->newLine();
            $this->info('📤 Sending test broadcast...');
            
            $result = $pusher->trigger(
                'test-channel',
                'test.broadcast',
                [
                    'title' => 'Direct Pusher Test! 🎉',
                    'message' => 'This is a direct Pusher SDK test',
                    'type' => 'test',
                ]
            );
            
            $this->info('✅ Broadcast sent!');
            $this->info('   Result: ' . json_encode($result));
            
            $this->newLine();
            $this->info('📋 Check:');
            $this->info('1. Reverb logs for incoming HTTP request');
            $this->info('2. Browser console for received event');
            
        } catch (\Exception $e) {
            $this->error('❌ Broadcast failed: ' . $e->getMessage());
            $this->error($e->getTraceAsString());
            return 1;
        }
        
        return 0;
    }
}
