import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import TeacherHeader from '@/components/Layout/Teacher/TeacherHeader';
import TeacherLeftSidebar from '@/components/Layout/Teacher/TeacherLeftSidebar';
import TeacherRightSidebar from '@/components/Layout/Teacher/TeacherRightSidebar';
import { useLogoutDialog } from '@/contexts/LogoutDialogContext';

interface TeacherLayoutProps {
    children: React.ReactNode;
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
    const [showLeftSidebar, setShowLeftSidebar] = useState(true);
    const [showRightSidebar, setShowRightSidebar] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { confirmLogout } = useLogoutDialog();

    // Handle responsive sidebars
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setShowLeftSidebar(false);
                setShowRightSidebar(false);
            } else if (window.innerWidth < 1280) {
                setShowLeftSidebar(true);
                setShowRightSidebar(false);
            } else {
                setShowLeftSidebar(true);
                setShowRightSidebar(true);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            <TeacherHeader onMenuToggle={toggleMobileMenu} showMenuButton={!showLeftSidebar} />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Left Sidebar - Fixed, scrollable internally */}
                {showLeftSidebar && (
                    <aside className="hidden lg:block shrink-0 z-10 ml-[clamp(8rem,2vw,12rem)] overflow-hidden">
                        <TeacherLeftSidebar onLogoutClick={handleLogoutClick} />
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
                        <TeacherRightSidebar />
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
                        <TeacherLeftSidebar onLogoutClick={handleLogoutClick} />
                    </div>
                </>
            )}
        </div>
    );
}
