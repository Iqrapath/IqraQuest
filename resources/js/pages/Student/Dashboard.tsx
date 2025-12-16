import { Head } from '@inertiajs/react';
import StudentLayout from '@/layouts/StudentLayout';

export default function Dashboard({ bookings = [] }: { bookings: any[] }) {
    return (
        <>
            <Head title="Student Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="md:flex md:items-center md:justify-between mb-8">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                                Student Dashboard
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Main Column: Upcoming Classes */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Upcoming Classes Section */}
                            <div className="bg-white shadow-sm sm:rounded-xl border border-gray-100 overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="text-base font-semibold leading-6 text-gray-900">Your Classes (The Majlis)</h3>
                                </div>

                                <ul role="list" className="divide-y divide-gray-100">
                                    {bookings.length === 0 ? (
                                        <li className="px-6 py-12 text-center">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No classes scheduled</h3>
                                            <p className="mt-1 text-sm text-gray-500">Get started by finding a teacher.</p>
                                            <div className="mt-6">
                                                <a
                                                    href="/teachers"
                                                    className="inline-flex items-center rounded-md bg-[#358D83] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2b756d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#358D83]"
                                                >
                                                    <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                                    </svg>
                                                    Find a Teacher
                                                </a>
                                            </div>
                                        </li>
                                    ) : (
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
                                                        <p className="truncate">Teacher: {booking.teacher?.user?.name || 'Ustad'}</p>
                                                        <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current"><circle cx={1} cy={1} r={1} /></svg>
                                                        <p className="whitespace-nowrap">
                                                            {new Date(booking.start_time).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-none items-center gap-x-4">
                                                    <a
                                                        href={`/classroom/${booking.id}`}
                                                        className="rounded-full bg-[#358D83] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#2b756d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#358D83] transition-all flex items-center gap-2 group"
                                                    >
                                                        <span>Enter Classroom</span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
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

                        {/* Right Column: Stats / Quick Actions */}
                        <div className="space-y-6">
                            <div className="bg-white shadow-sm sm:rounded-xl border border-gray-100 p-6">
                                <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Quick Stats</h3>
                                <dl className="grid grid-cols-1 gap-4">
                                    <div className="overflow-hidden rounded-lg bg-gray-50 px-4 py-3 sm:p-4">
                                        <dt className="truncate text-sm font-medium text-gray-500">Total Classes</dt>
                                        <dd className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">{bookings.length}</dd>
                                    </div>
                                    <div className="overflow-hidden rounded-lg bg-gray-50 px-4 py-3 sm:p-4">
                                        <dt className="truncate text-sm font-medium text-gray-500">Learning Hours</dt>
                                        <dd className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">0.0</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => <StudentLayout children={page} />;
