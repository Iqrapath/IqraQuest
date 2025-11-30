import { Icon } from '@iconify/react';

export default function TeacherRightSidebar() {
    return (
        <div
            className="flex flex-col gap-6 overflow-hidden"
            style={{
                width: 'clamp(250px, 18vw, 300px)',
                height: 'calc(100vh - clamp(120px, 10vh, 140px))',
                padding: 'clamp(1rem, 2vh, 2rem) clamp(1rem, 1.5vw, 1.5rem) clamp(1rem, 2vh, 2rem) 0'
            }}
        >

            {/* Student Request Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#181818] font-['Nunito']">Student Request</h3>
                    <button className="text-[#338078]">
                        <Icon icon="mdi:dots-horizontal" className="w-6 h-6" />
                    </button>
                </div>

                {/* Request Card */}
                <div className="bg-[#f3fffe] p-6 rounded-[22px] shadow-sm flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-md">
                            <img src="https://ui-avatars.com/api/?name=Nadia+S&background=random" alt="Student" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>

                    <div className="text-center">
                        <h4 className="text-lg font-bold text-[#192020] font-['Nunito']">Nadia Syaheera</h4>
                        <p className="text-sm text-gray-500 font-['Nunito']">Student</p>
                    </div>

                    <div className="flex gap-4 w-full">
                        <button className="flex-1 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                            <Icon icon="mdi:close" className="w-5 h-5" />
                        </button>
                        <button className="flex-1 h-10 rounded-full bg-[#338078] text-white flex items-center justify-center hover:bg-[#2a6e67] shadow-lg shadow-[#338078]/20">
                            <Icon icon="mdi:check" className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages Section */}
            <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#181818] font-['Nunito']">Messages</h3>
                    <button className="text-[#338078]">
                        <Icon icon="mdi:pencil-outline" className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Message Item 1 */}
                    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                <img src="https://ui-avatars.com/api/?name=Samantha+W&background=random" alt="User" />
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-[#192020] text-sm truncate font-['Nunito']">Samantha William</h5>
                            <p className="text-xs text-gray-500 truncate font-['Nunito']">Can we reschedule our...</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] text-gray-400 font-['Nunito']">12:45 PM</span>
                            <span className="w-5 h-5 rounded-full bg-[#ff3b30] text-white text-[10px] flex items-center justify-center font-bold">2</span>
                        </div>
                    </div>

                    {/* Message Item 2 */}
                    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                <img src="https://ui-avatars.com/api/?name=Tony+Soap&background=random" alt="User" />
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-300 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-[#192020] text-sm truncate font-['Nunito']">Tony Soap</h5>
                            <p className="text-xs text-gray-500 truncate font-['Nunito']">Thanks for the lesson!</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] text-gray-400 font-['Nunito']">Yesterday</span>
                        </div>
                    </div>
                </div>

                <button className="w-full py-2 border border-[#338078] text-[#338078] rounded-lg text-xs font-medium hover:bg-[#338078]/5 transition-colors font-['Poppins']">
                    View All Messages
                </button>
            </div>
        </div>
    );
}
