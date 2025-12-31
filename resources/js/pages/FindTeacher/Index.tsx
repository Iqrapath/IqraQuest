import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import HeroSection from '@/components/FindTeacher/HeroSection';
import { SearchBar } from '@/components/Teachers/SearchBar';
import { AdvancedFilter, FilterValues } from '@/components/Teachers/AdvancedFilter';
import { TeacherGrid } from '@/components/Teachers/TeacherGrid';
import { TeacherProfileModal } from '@/components/Teachers/TeacherProfileModal';
import { Icon } from '@iconify/react';
import HowItWorksSection from '@/components/landing/sections/HowItWorksSection';
import MatchMeSection from '@/components/FindTeacher/MatchMeSection';
import BecomeTeacherCTA from '@/components/FindTeacher/BecomeTeacherCTA';

interface Teacher {
    id: number;
    user: {
        name: string;
        avatar?: string;
    };
    bio: string;
    experience_years: number;
    hourly_rate: number | null;
    subjects: Array<{
        id: number;
        name: string;
        proficiency_level: string;
    }>;
    average_rating: number;
    total_reviews: number;
    city?: string;
    availability_summary?: string;
}

interface Subject {
    id: number;
    name: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface FindTeacherProps {
    teachers: {
        data: Teacher[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    subjects: Subject[];
    filters: {
        search?: string;
        subject?: string;
        time_preference?: string;
        budget_min?: string;
        budget_max?: string;
        language?: string;
    };
}

export default function FindTeacher({ teachers, subjects, filters }: FindTeacherProps) {
    const { auth } = usePage().props as any;
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);

    const handleSearch = () => {
        router.get('/find-teacher', { ...filters, search: searchQuery }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilterChange = (newFilters: FilterValues) => {
        router.get('/find-teacher', {
            search: searchQuery,
            subject: newFilters.subject,
            time_preference: newFilters.timePreference,
            budget_min: newFilters.budgetMin,
            budget_max: newFilters.budgetMax,
            language: newFilters.language,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleViewProfile = (teacherId: number) => {
        setSelectedTeacherId(teacherId);
        setIsProfileModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsProfileModalOpen(false);
        setSelectedTeacherId(null);
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {}, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="Find a Teacher" />
            <Navbar />

            <main className="min-h-screen bg-[#F9FAFB]">
                {/* Hero Section - Full Width */}
                <HeroSection />

                {/* Search Banner Section - Teal Gradient */}
                <div className="relative px-[clamp(1rem,11.81vw,10.625rem)]">
                    {/* Teal Gradient Banner */}
                    <div
                        className="relative rounded-[36px] overflow-hidden min-h-[300px]"
                        style={{
                            backgroundImage: "linear-gradient(133.51deg, rgb(144, 205, 199) 66.98%, rgb(46, 188, 174) 83.48%)"
                        }}
                    >
                        {/* Background Overlay Pattern */}
                        <div className="absolute inset-0  overflow-hidden">
                            <img
                                src="/images/ai-generated-tranquil-shots-of-individuals-engrossed-in-reading-and-reciting-the-quran-during-ramadan-nights-free-photo 3.png"
                                alt=""
                                className="h-full w-full object-cover scale-[-1] rotate-180"
                            />
                        </div>

                        {/* Vector Decoration */}
                        <div className="absolute right-0 top-0 h-full">
                            <img
                                src="/images/Vector-bg.png"
                                alt=""
                                className="h-full w-auto object-contain"
                            />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 px-[clamp(2rem,4.65vw,4.188rem)] py-[clamp(2.5rem,4.24vw,3.813rem)]">
                            {/* Subtitle */}
                            <p className="font-['Nunito'] text-[clamp(1rem,1.53vw,1.375rem)] font-normal text-white mb-4 max-w-[698px]">
                                Browse verified Quran tutors for Tajweed, Hifz, Qaida, and more.
                            </p>

                            {/* Search Bar */}
                            <div className="max-w-[479px]">
                                <SearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    onSearch={handleSearch}
                                    placeholder="Search by Teacher Name or Subject…"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Overlapping Filter Section */}
                    <div className="relative -mt-[100px] z-20 mx-auto max-w-[1045px]">
                        <div className="bg-white rounded-[36px] shadow-lg p-6">
                            <AdvancedFilter
                                subjects={subjects}
                                selectedSubject={filters.subject ? Number(filters.subject) : null}
                                onFilterChange={handleFilterChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Teacher Grid Section */}
                <div id="teachers" className="px-[clamp(1rem,11.81vw,10.625rem)] py-8">
                    <div className="mx-auto max-w-7xl">
                        {/* Results Count */}
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing <span className="font-semibold">{teachers.data.length}</span> of{' '}
                                <span className="font-semibold">{teachers.total}</span> teachers
                            </p>
                        </div>

                        {/* Teacher Grid */}
                        <TeacherGrid
                            teachers={teachers.data}
                            onTeacherClick={handleViewProfile}
                            emptyState={
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <Icon icon="mdi:account-search" className="mb-4 h-16 w-16 text-gray-300" />
                                    <h3 className="mb-2 text-lg font-semibold text-gray-900">No Teachers Found</h3>
                                    <p className="max-w-md text-gray-500">
                                        We couldn't find any teachers matching your criteria. Try adjusting your filters or search terms.
                                    </p>
                                </div>
                            }
                        />

                        {/* Pagination */}
                        {teachers.last_page > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-2">
                                {teachers.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handlePageChange(link.url)}
                                        disabled={!link.url || link.active}
                                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${link.active
                                            ? 'bg-[#338078] text-white'
                                            : link.url
                                                ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                                : 'cursor-not-allowed bg-gray-100 text-gray-400'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {/* How It Works Section */}
                <section>
                    <HowItWorksSection />
                </section>

                {/* Match Me Section */}
                <MatchMeSection subjects={subjects} />

                {/* Become Teacher CTA */}
                <BecomeTeacherCTA />
            </main>

            <Footer />

            {/* Teacher Profile Modal */}
            {selectedTeacherId && (
                <TeacherProfileModal
                    isOpen={isProfileModalOpen}
                    onClose={handleCloseModal}
                    teacherId={selectedTeacherId}
                />
            )}
        </>
    );
}
