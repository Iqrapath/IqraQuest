<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class DebugBroadcaster extends Command
{
    protected $signature = 'debug:broadcaster';
    protected $description = 'Debug the broadcaster configuration';

    public function handle()
    {
        $this->info('🔍 Debugging Broadcaster Configuration');
        $this->newLine();
        
        try {
            $broadcaster = app(\Illuminate\Contracts\Broadcasting\Broadcaster::class);
            $this->info('Broadcaster Class: ' . get_class($broadcaster));
            
            // Use reflection to inspect the broadcaster
            $reflection = new \ReflectionClass($broadcaster);
            
            // Try to get the Pusher instance
            $pusherProperty = $reflection->getProperty('pusher');
            $pusherProperty->setAccessible(true);
            $pusher = $pusherProperty->getValue($broadcaster);
            
            $this->info('Pusher Class: ' . get_class($pusher));
            
            // Get Pusher settings
            $pusherReflection = new \ReflectionClass($pusher);
            $settingsProperty = $pusherReflection->getProperty('settings');
            $settingsProperty->setAccessible(true);
            $settings = $settingsProperty->getValue($pusher);
            
            $this->info('Pusher Settings:');
            $this->info(json_encode($settings, JSON_PRETTY_PRINT));
            
            $this->newLine();
            $this->info('✅ Broadcaster is properly configured');
            
        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
            $this->error($e->getTraceAsString());
            return 1;
        }
        
        return 0;
    }
}
