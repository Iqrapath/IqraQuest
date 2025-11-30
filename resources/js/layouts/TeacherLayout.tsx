import { PropsWithChildren } from 'react';
import TeacherHeader from '@/components/Layout/Teacher/TeacherHeader';
import TeacherLeftSidebar from '@/components/Layout/Teacher/TeacherLeftSidebar';
import TeacherRightSidebar from '@/components/Layout/Teacher/TeacherRightSidebar';

interface TeacherLayoutProps extends PropsWithChildren {
    showLeftSidebar?: boolean;
    showRightSidebar?: boolean;
}

export default function TeacherLayout({
    children,
    showLeftSidebar = true,
    showRightSidebar = true
}: TeacherLayoutProps) {
    return (
        <div className="h-screen bg-[#fafbff] flex flex-col font-['Nunito'] overflow-hidden">
            {/* Header - Fixed at top */}
            <TeacherHeader />

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Fixed, scrollable internally */}
                {showLeftSidebar && (
                    <aside className="hidden lg:block shrink-0 z-10 ml-[clamp(8rem,2vw,12rem)]  overflow-hidden">
                        <TeacherLeftSidebar />
                    </aside>
                )}

                {/* Main Content Area - Scrollable */}
                <main className="flex-1 overflow-y-auto p-8 relative scrollbar-thin "
                
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#ccc #f1f1f1',
                }}>
                    {children}
                </main>

                {/* Right Sidebar - Fixed, scrollable internally */}
                {showRightSidebar && (
                    <aside className="hidden xl:block shrink-0 bg-white/50 backdrop-blur-sm border-l border-gray-100 mr-[clamp(8rem,2vw,6rem)] overflow-hidden">
                        <TeacherRightSidebar />
                    </aside>
                )}
            </div>
        </div>
    );
}
