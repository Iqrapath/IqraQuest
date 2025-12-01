import { createContext, useContext, useState, ReactNode } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface LogoutDialogContextType {
    confirmLogout: () => Promise<boolean>;
}

const LogoutDialogContext = createContext<LogoutDialogContextType | undefined>(undefined);

export function LogoutDialogProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

    const confirmLogout = (): Promise<boolean> => {
        setIsOpen(true);
        return new Promise((resolve) => {
            setResolvePromise(() => resolve);
        });
    };

    const handleConfirm = () => {
        setIsOpen(false);
        if (resolvePromise) {
            resolvePromise(true);
            setResolvePromise(null);
        }
        router.post('/logout');
    };

    const handleCancel = () => {
        setIsOpen(false);
        if (resolvePromise) {
            resolvePromise(false);
            setResolvePromise(null);
        }
    };

    return (
        <LogoutDialogContext.Provider value={{ confirmLogout }}>
            {children}
            <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <LogOut className="w-8 h-8 text-red-600" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-xl font-bold">
                            Confirm Logout
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Are you sure you want to log out of your account?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center gap-3">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="flex-1 sm:flex-none"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirm}
                            className="flex-1 sm:flex-none"
                        >
                            Log Out
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </LogoutDialogContext.Provider>
    );
}

export function useLogoutDialog() {
    const context = useContext(LogoutDialogContext);
    if (context === undefined) {
        throw new Error('useLogoutDialog must be used within a LogoutDialogProvider');
    }
    return context;
}
