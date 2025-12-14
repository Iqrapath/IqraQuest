import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import StudentHeader from '@/components/Layout/Student/StudentHeader';
import StudentLeftSidebar from '@/components/Layout/Student/StudentLeftSidebar';
import StudentRightSidebar from '@/components/Layout/Student/StudentRightSidebar';
import { useLogoutDialog } from '@/contexts/LogoutDialogContext';
import StudentOnboardingModal from '@/components/StudentOnboardingModal';
import { SharedData } from '@/types';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { Toaster, toast } from 'sonner';

interface StudentLayoutProps {
    children: React.ReactNode;
    hideLeftSidebar?: boolean;
    hideRightSidebar?: boolean;
}

export default function StudentLayout({ children, hideLeftSidebar = false, hideRightSidebar = false }: StudentLayoutProps) {
    const [showLeftSidebar, setShowLeftSidebar] = useState(!hideLeftSidebar);
    const [showRightSidebar, setShowRightSidebar] = useState(!hideRightSidebar);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { confirmLogout } = useLogoutDialog();
    const { auth, flash } = usePage<SharedData>().props;

    // Check if user needs onboarding
    const needsOnboarding = !auth.user.onboarding_completed_at && !auth.user.onboarding_skipped;
    const [showOnboarding, setShowOnboarding] = useState(needsOnboarding);

    // Handle responsive sidebars
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setShowLeftSidebar(false);
                setShowRightSidebar(false);
            } else if (window.innerWidth < 1280) {
                setShowLeftSidebar(!hideLeftSidebar);
                setShowRightSidebar(false);
            } else {
                setShowLeftSidebar(!hideLeftSidebar);
                setShowRightSidebar(!hideRightSidebar);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [hideLeftSidebar, hideRightSidebar]);

    // Handle Flash Messages
    // useEffect(() => {
    //     if (flash?.success) toast.success(flash.success);
    //     if (flash?.error) toast.error(flash.error);
    //     if (flash?.warning) toast.warning(flash.warning);
    //     if (flash?.info) toast.info(flash.info);
    // }, [flash]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLogoutClick = async () => {
        setIsMobileMenuOpen(false); // Close mobile menu if open
        await confirmLogout();
    };

    return (
        <CurrencyProvider initialCurrency={auth.wallet_currency as any || 'NGN'}>
            <div className="h-screen bg-[#fafbff] flex flex-col font-['Nunito'] overflow-hidden">
                {/* Header - Sticky at top */}
                <div className="sticky top-0 z-30 shrink-0">
                    <StudentHeader onMenuToggle={toggleMobileMenu} showMenuButton={!showLeftSidebar} />
                </div>

                <div className="flex flex-1 overflow-hidden relative">
                    {/* Left Sidebar - Fixed, scrollable internally */}
                    {showLeftSidebar && (
                        <aside className="hidden lg:block shrink-0 z-10 ml-[clamp(8rem,2vw,12rem)] h-full overflow-y-auto">
                            <StudentLeftSidebar onLogoutClick={handleLogoutClick} />
                        </aside>
                    )}

                    {/* Main Content Area - Scrollable */}
                    <main className="flex-1 overflow-y-auto relative h-full"
                        style={{
                            padding: 'clamp(1rem, 2vw, 2rem)',
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#ccc #4d9b91',
                        }}>
                        {children}
                    </main>

                    {/* Right Sidebar - Fixed, scrollable internally */}
                    {showRightSidebar && (
                        <aside className="hidden xl:block shrink-0 bg-white/50 backdrop-blur-sm border-l border-gray-100 h-full overflow-y-auto mr-[clamp(8rem,2vw,12rem)]">
                            <StudentRightSidebar />
                        </aside>
                    )}
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                        />

                        {/* Sidebar Drawer */}
                        <div className="fixed left-0 top-[70px] bottom-0 w-[280px] z-50 lg:hidden overflow-y-auto">
                            <StudentLeftSidebar onLogoutClick={handleLogoutClick} />
                        </div>
                    </>
                )}

                <StudentOnboardingModal
                    isOpen={showOnboarding}
                    onComplete={() => setShowOnboarding(false)}
                    onSkip={() => setShowOnboarding(false)}
                />
                {/* <Toaster position="top-right" richColors /> */}
            </div>
        </CurrencyProvider>
    );
}
