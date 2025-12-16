import { Head } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';

export default function Dashboard({ bookings = [] }: { bookings: any[] }) {
    return (
        <>
            <Head title="Teacher Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="md:flex md:items-center md:justify-between mb-8">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                                Teacher Dashboard
                            </h2>
                        </div>
                    </div>

                    {/* Upcoming Classes Section */}
                    <div className="bg-white shadow-sm sm:rounded-xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">Upcoming Classes (The Majlis)</h3>
                        </div>

                        {/* List */}
                        <ul role="list" className="divide-y divide-gray-100">
                            {/* @ts-ignore - Booking type definition skipped for brevity */}
                            {/* @ts-ignore */}
                            {bookings.length === 0 ? (
                                <li className="px-6 py-12 text-center">
                                    <p className="text-gray-500">No confirmed classes yet. Go to <a href="/teacher/requests" className="text-[#358D83] font-bold">Requests</a> to accept new students.</p>
                                </li>
                            ) : (
                                // @ts-ignore
                                bookings.map((booking) => (
                                    <li key={booking.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-5 px-6 hover:bg-gray-50 transition-colors">
                                        <div className="min-w-0">
                                            <div className="flex items-start gap-x-3">
                                                <p className="text-sm font-semibold leading-6 text-gray-900">
                                                    {booking.subject?.name || 'Quran Session'}
                                                </p>
                                                <p className={`rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${booking.status === 'confirmed' ? 'text-green-700 bg-green-50 ring-green-600/20' : 'text-gray-600 bg-gray-50 ring-gray-500/10'}`}>
                                                    {booking.status}
                                                </p>
                                            </div>
                                            <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                                                <p className="truncate">Student: {booking.student?.name || 'Student'}</p>
                                                <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current"><circle cx={1} cy={1} r={1} /></svg>
                                                <p className="whitespace-nowrap">
                                                    {new Date(booking.start_time).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-none items-center gap-x-4">
                                            <a
                                                href={`/classroom/${booking.id}`}
                                                className="rounded-full bg-[#358D83] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#2b756d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#358D83] transition-all flex items-center gap-2"
                                            >
                                                <span>Enter Classroom</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                </svg>
                                            </a>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => <TeacherLayout children={page} />;
