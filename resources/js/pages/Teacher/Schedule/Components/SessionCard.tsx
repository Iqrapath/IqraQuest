import React from 'react';
import { Button } from '@/components/ui/button';

interface Session {
    id: number;
    student: { id: number; name: string; avatar: string | null };
    subject: { id: number; name: string };
    start_time: string;
    end_time: string;
    date_key: string;
    formatted_date: string;
    formatted_day: string;
    formatted_month: string;
    formatted_start_time: string;
    formatted_end_time: string;
    status: string;
    can_join: boolean;
    meeting_link: string | null;
}

interface SessionCardProps {
    session: Session;
    onJoin: (session: Session) => void;
}

export function SessionCard({ session, onJoin }: SessionCardProps) {
    return (
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-end min-w-[5rem]">
                <span className="font-['Poppins'] font-semibold text-lg text-[#338078]">{session.formatted_start_time}</span>
                <span className="font-['Nunito'] text-xs text-[#9ca3af]">{session.formatted_end_time}</span>
            </div>
            <div className="w-px h-12 bg-[#e5e7eb]" />
            <div className="flex-1 bg-[#e4f7f4] rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="font-['Nunito'] text-sm text-[#6b7280]">{session.subject.name}</span>
                    <span className="font-['Poppins'] font-medium text-[#181818]">{session.student.name}</span>
                </div>
                {session.can_join && (
                    <Button onClick={() => onJoin(session)} className="rounded-[56px] bg-[#338078] hover:bg-[#2a6b64] text-white font-['Nunito'] font-semibold text-sm px-4 h-9">
                        Join Session
                    </Button>
                )}
            </div>
        </div>
    );
}
