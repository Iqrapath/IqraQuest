import { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import AdminHeader from '@/components/Layout/Admin/AdminHeader';
import AdminLeftSidebar from '@/components/Layout/Admin/AdminLeftSidebar';
import AdminRightSidebar from '@/components/Layout/Admin/AdminRightSidebar';
import { useLogoutDialog } from '@/contexts/LogoutDialogContext';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
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
        <div className="min-h-screen flex flex-col font-['Nunito']">
            {/* Header - Fixed at top */}
            <AdminHeader onMenuToggle={toggleMobileMenu} showMenuButton={!showLeftSidebar} />

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Fixed, scrollable internally */}
                {showLeftSidebar && (
                    <aside className="hidden lg:block shrink-0 z-10 ml-[clamp(8rem,2vw,12rem)] overflow-hidden">
                        <AdminLeftSidebar onLogoutClick={handleLogoutClick} />
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
                        <AdminRightSidebar />
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
                    <div
                        className="fixed left-0 top-[70px] bottom-0 w-[280px] z-50 lg:hidden overflow-y-auto"
                    >
                        <AdminLeftSidebar onLogoutClick={handleLogoutClick} />
                    </div>
                </>
            )}
        </div>
    );
}
