import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import StudentHeader from '@/components/Layout/Student/StudentHeader';
import StudentLeftSidebar from '@/components/Layout/Student/StudentLeftSidebar';
import StudentRightSidebar from '@/components/Layout/Student/StudentRightSidebar';
import { useLogoutDialog } from '@/contexts/LogoutDialogContext';
import StudentOnboardingModal from '@/components/StudentOnboardingModal';
import { SharedData } from '@/types';

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
    const { auth } = usePage<SharedData>().props;

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

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLogoutClick = async () => {
        setIsMobileMenuOpen(false); // Close mobile menu if open
        await confirmLogout();
    };

    return (
        <div className="min-h-screen bg-[#fafbff] flex flex-col font-['Nunito'] overflow-hidden">
            {/* Header - Fixed at top */}
            <StudentHeader onMenuToggle={toggleMobileMenu} showMenuButton={!showLeftSidebar} />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Left Sidebar - Fixed, scrollable internally */}
                {showLeftSidebar && (
                    <aside className="hidden lg:block shrink-0 z-10 ml-[clamp(8rem,2vw,12rem)] overflow-hidden">
                        <StudentLeftSidebar onLogoutClick={handleLogoutClick} />
                    </aside>
                )}

                {/* Main Content Area - Scrollable */}
                <main className="flex-1 overflow-y-auto relative"
                    style={{
                        padding: 'clamp(1rem, 2vw, 2rem)',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#ccc #4d9b91',
                    }}>
                    {children}
                </main>

                {/* Right Sidebar - Fixed, scrollable internally */}
                {showRightSidebar && (
                    <aside className="hidden xl:block shrink-0 bg-white/50 backdrop-blur-sm border-l border-gray-100 overflow-hidden mr-[clamp(8rem,2vw,12rem)]">
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

            {/* Onboarding Modal */}
            <StudentOnboardingModal
                isOpen={showOnboarding}
                onComplete={() => setShowOnboarding(false)}
                onSkip={() => setShowOnboarding(false)}
            />
        </div>
    );
}
