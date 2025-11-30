import { useEffect } from 'react';
import { toast } from 'sonner';

export function usePublicTest() {
    useEffect(() => {
        // Get the global Echo instance from window
        const echo = (window as any).Echo;
        
        if (!echo) {
            console.log('❌ Echo not available for public test');
            return;
        }

        console.log('🎯 Setting up public test channel listener...');

        // Listen to public test channel (no auth needed)
        const channel = echo.channel('test-channel');
        
        console.log('📻 Channel object:', channel);
        console.log('📻 Channel name:', channel.name);
        console.log('📻 Listening for event: .test.broadcast');
        
        channel.listen('.test.broadcast', (event: any) => {
            console.log('🎉 Public broadcast received (.test.broadcast):', event);
            toast.success(event.title || 'Test Notification', {
                description: event.message || 'Public broadcast test successful!',
                duration: 5000,
            });
        });

        return () => {
            console.log('🧹 Cleaning up public test channel');
            echo.leave('test-channel');
        };
    }, []);
}
