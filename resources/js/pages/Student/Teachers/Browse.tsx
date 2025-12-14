import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';
import { SearchBar } from '@/components/Teachers/SearchBar';
import { AdvancedFilter, FilterValues } from '@/components/Teachers/AdvancedFilter';
import { SectionHeader } from '@/components/Teachers/SectionHeader';
import { TeacherGrid } from '@/components/Teachers/TeacherGrid';
import { TeacherProfileModal } from '@/components/Teachers/TeacherProfileModal';
import axios from 'axios';

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
}

interface Subject {
    id: number;
    name: string;
    slug: string;
    icon?: string;
}

interface PaginatedResponse {
    data: Teacher[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function Browse() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterValues>({
        subject: null,
        timePreference: null,
        budgetMin: 100,
        budgetMax: 50000,
        currency: 'USD',
        language: null,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0,
    });
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch subjects on mount
    useEffect(() => {
        fetchSubjects();
    }, []);

    // Fetch teachers when filters change
    useEffect(() => {
        fetchTeachers();
    }, [searchQuery, filters, pagination.currentPage]);

    const fetchSubjects = async () => {
        try {
            const response = await axios.get('/api/subjects');
            setSubjects(response.data.subjects);
        } catch (error) {
            console.error('Failed to fetch subjects:', error);
        }
    };

    const fetchTeachers = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get<PaginatedResponse>('/api/teachers', {
                params: {
                    search: searchQuery || undefined,
                    subject: filters.subject || undefined,
                    min_price: filters.budgetMin,
                    max_price: filters.budgetMax,
                    page: pagination.currentPage,
                    per_page: 12,
                },
            });

            setTeachers(response.data.data);
            setPagination({
                currentPage: response.data.current_page,
                lastPage: response.data.last_page,
                total: response.data.total,
            });
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to page 1
    };

    const handleFilterChange = (newFilters: FilterValues) => {
        setFilters(newFilters);
        setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to page 1
    };

    const handleViewProfile = (teacherId: number) => {
        setSelectedTeacherId(teacherId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTeacherId(null);
    };

    const handlePageChange = (page: number) => {
        setPagination((prev) => ({ ...prev, currentPage: page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <Head title="Browse Teachers" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="mb-6 text-[29px] font-semibold leading-tight text-gray-900 dark:text-white">
                        Browse Teachers
                    </h1>

                    {/* Search Bar */}
                    <div className="max-w-[479px]">
                        <SearchBar
                            value={searchQuery}
                            onChange={handleSearch}
                            placeholder="Search for competent teacher or subject"
                        />
                    </div>
                </div>

                {/* Advanced Filter */}
                {subjects.length > 0 && (
                    <div className="mb-8">
                        <AdvancedFilter
                            subjects={subjects}
                            selectedSubject={filters.subject}
                            onFilterChange={handleFilterChange}
                        />
                    </div>
                )}

                {/* Section Header */}
                <div className="mb-4">
                    <SectionHeader
                        title="All Teachers"
                        showCount
                        count={pagination.total}
                    />
                </div>

                {/* Teachers Grid */}
                <div className="min-h-[400px]">
                    <TeacherGrid
                        teachers={teachers}
                        isLoading={isLoading}
                        onTeacherClick={handleViewProfile}
                    />
                </div>

                {/* Pagination */}
                {!isLoading && pagination.lastPage > 1 && (
                    <div className="mt-8 w-full clear-both flex items-center justify-center gap-2">
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Previous
                        </button>

                        <div className="flex gap-1">
                            {[...Array(Math.min(pagination.lastPage, 5))].map((_, index) => {
                                const pageNumber = index + 1;
                                const isActive = pageNumber === pagination.currentPage;

                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => handlePageChange(pageNumber)}
                                        className={`rounded-md px-4 py-2 text-sm font-medium ${isActive
                                            ? 'bg-primary text-white'
                                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.lastPage}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Teacher Profile Modal */}
                {selectedTeacherId && (
                    <TeacherProfileModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        teacherId={selectedTeacherId}
                    />
                )}
            </div>
        </>
    );
}
Browse.layout = (page: React.ReactNode) => <StudentLayout children={page} hideRightSidebar={true} />;
