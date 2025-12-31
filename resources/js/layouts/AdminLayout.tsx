import { useState, useEffect } from 'react';

import AdminHeader from '@/components/Layout/Admin/AdminHeader';
import AdminLeftSidebar from '@/components/Layout/Admin/AdminLeftSidebar';
import AdminRightSidebar from '@/components/Layout/Admin/AdminRightSidebar';
import { useLogoutDialog } from '@/contexts/LogoutDialogContext';

interface AdminLayoutProps {
    children: React.ReactNode;
    hideLeftSidebar?: boolean;
    hideRightSidebar?: boolean;
}

export default function AdminLayout({ children, hideLeftSidebar = false, hideRightSidebar = false }: AdminLayoutProps) {
    const [showLeftSidebar, setShowLeftSidebar] = useState(!hideLeftSidebar);
    const [showRightSidebar, setShowRightSidebar] = useState(!hideRightSidebar);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { confirmLogout } = useLogoutDialog();

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

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [hideLeftSidebar, hideRightSidebar]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLogoutClick = async () => {
        setIsMobileMenuOpen(false);
        await confirmLogout();
    };

    return (
        <div className="h-screen flex flex-col font-['Nunito'] overflow-hidden">
            {/* Scroll Progress Bar - Fixed at Top */}
            <div
                id="scroll-progress"
                className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-[#3d7872] via-[#F2A100] to-[#3d7872] z-[100] transition-all duration-150 shadow-lg"
                style={{ width: '0%' }}
            />

            {/* Header */}
            <AdminHeader onMenuToggle={toggleMobileMenu} showMenuButton={!showLeftSidebar} />

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                {showLeftSidebar && (
                    <aside className="hidden lg:block shrink-0 z-10 ml-[clamp(8rem,2vw,12rem)] overflow-hidden h-full">
                        <AdminLeftSidebar onLogoutClick={handleLogoutClick} />
                    </aside>
                )}

                {/* Main Content - ONLY THIS SCROLLS */}
                <main
                    className="flex-1 overflow-y-auto relative h-full custom-scrollbar"
                    style={{ padding: 'clamp(1rem, 2vw, 2rem)' }}
                    onScroll={(e) => {
                        const target = e.target as HTMLElement;
                        const scrollPercent = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
                        const progressBar = document.getElementById('scroll-progress');
                        if (progressBar) {
                            progressBar.style.width = `${scrollPercent}%`;
                        }
                    }}>
                    {children}
                </main>

                {/* Right Sidebar */}
                {/* {showRightSidebar && (
                    <aside className="hidden xl:block shrink-0 bg-white/50 backdrop-blur-sm border-l border-gray-100 overflow-hidden mr-[clamp(8rem,2vw,12rem)] h-full">
                        <AdminRightSidebar />
                    </aside>
                )} */}
            </div>

            {/* Hide Scrollbar Completely */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar {
                    scrollbar-width: none;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}} />

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <>
                    <div
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    />
                    <div className="fixed left-0 top-[70px] bottom-0 w-[280px] z-50 lg:hidden overflow-y-auto">
                        <AdminLeftSidebar onLogoutClick={handleLogoutClick} />
                    </div>
                </>
            )}
        </div>
    );
}
