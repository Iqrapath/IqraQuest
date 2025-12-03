<?php

namespace App\Listeners;

use App\Models\MailLog;
use Illuminate\Mail\Events\MessageSent;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

class LogSentMessage
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(MessageSent $event): void
    {
        $message = $event->message;
        
        // Get recipients
        $to = [];
        foreach ($message->getTo() as $address) {
            $to[] = $address->getAddress();
        }
        
        MailLog::create([
            'recipient' => implode(', ', $to),
            'subject' => $message->getSubject(),
            'body' => $message->getHtmlBody() ?? $message->getTextBody() ?? '',
            'status' => 'sent',
        ]);
    }
}
