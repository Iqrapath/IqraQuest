import React, { useState } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Props {
    teacher: any;
    timezones: string[];
}

interface TimeSlot {
    day: string;
    start: string;
    end: string;
    [key: string]: string; // Index signature for FormDataConvertible compatibility
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MAX_SLOTS_PER_DAY = 5;

export default function Step3({ teacher, timezones = Intl.supportedValuesOf('timeZone') }: Props) {
    // Map DB fields to frontend fields
    const initialAvailability: TimeSlot[] = (teacher.availability || []).map((slot: any) => ({
        day: (slot.day || slot.day_of_week || '').toLowerCase(),
        start: slot.start || slot.start_time?.slice(0, 5) || '09:00',
        end: slot.end || slot.end_time?.slice(0, 5) || '10:00'
    }));

    let initialMode = '';
    if (Array.isArray(teacher.teaching_modes) && teacher.teaching_modes.length > 0) {
        initialMode = teacher.teaching_modes[0];
    } else if (typeof teacher.teaching_mode === 'string') {
        initialMode = teacher.teaching_mode;
    }

    const { data, setData, post, processing, errors } = useForm({
        timezone: teacher.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        teaching_mode: initialMode,
        teaching_types: teacher.teaching_types || [],
        availability: initialAvailability,
    });

    // Track which days are expanded
    const [expandedDays, setExpandedDays] = useState<string[]>(
        [...new Set(initialAvailability.map((s: TimeSlot) => s.day))]
    );

    const handleModeToggle = (mode: string) => {
        setData('teaching_mode', mode);

        if (mode === 'part-time') {
            const uniqueDays = [...new Set(data.availability.map((a: TimeSlot) => a.day))];
            if (uniqueDays.length > 3) {
                toast.warning('Part-time teachers are limited to 3 days. Please reduce your days.');
            }
        }
    };

    const handleTypeToggle = (type: string) => {
        const currentTypes = [...data.teaching_types];
        const index = currentTypes.indexOf(type);

        if (index > -1) {
            currentTypes.splice(index, 1);
        } else {
            currentTypes.push(type);
        }

        setData('teaching_types', currentTypes);
    };

    const toggleDay = (day: string) => {
        const dayLower = day.toLowerCase();
        const isExpanded = expandedDays.includes(dayLower);

        if (isExpanded) {
            // Collapse and remove all slots for this day
            setExpandedDays(expandedDays.filter(d => d !== dayLower));
            setData('availability', data.availability.filter((a: TimeSlot) => a.day !== dayLower));
        } else {
            // Check part-time limit before adding
            if (data.teaching_mode === 'part-time') {
                const uniqueDays = [...new Set(data.availability.map((a: TimeSlot) => a.day))];
                if (uniqueDays.length >= 3) {
                    toast.error('Part-time teachers can only select up to 3 days.');
                    return;
                }
            }

            // Expand and add first slot
            setExpandedDays([...expandedDays, dayLower]);
            setData('availability', [
                ...data.availability,
                { day: dayLower, start: '09:00', end: '10:00' }
            ]);
        }
    };

    const addSlot = (day: string) => {
        const dayLower = day.toLowerCase();
        const daySlots = data.availability.filter((a: TimeSlot) => a.day === dayLower);

        if (daySlots.length >= MAX_SLOTS_PER_DAY) {
            toast.error(`Maximum ${MAX_SLOTS_PER_DAY} time slots per day.`);
            return;
        }

        // Find a time that doesn't overlap - start at 09:00 and increment
        const usedStarts = daySlots.map((s: TimeSlot) => s.start);
        let startHour = 9;
        while (usedStarts.includes(`${startHour.toString().padStart(2, '0')}:00`) && startHour < 23) {
            startHour++;
        }
        const newStart = `${startHour.toString().padStart(2, '0')}:00`;
        const endHour = (startHour + 1) % 24;
        const newEnd = `${endHour.toString().padStart(2, '0')}:00`;

        setData('availability', [
            ...data.availability,
            { day: dayLower, start: newStart, end: newEnd }
        ]);
    };

    const removeSlot = (day: string, index: number) => {
        const dayLower = day.toLowerCase();
        const daySlots = data.availability.filter((a: TimeSlot) => a.day === dayLower);
        const otherSlots = data.availability.filter((a: TimeSlot) => a.day !== dayLower);

        // Remove the slot at the given index
        daySlots.splice(index, 1);

        // If no slots left, collapse the day
        if (daySlots.length === 0) {
            setExpandedDays(expandedDays.filter(d => d !== dayLower));
        }

        setData('availability', [...otherSlots, ...daySlots]);
    };

    const updateSlotTime = (day: string, slotIndex: number, field: 'start' | 'end', value: string) => {
        const dayLower = day.toLowerCase();
        const daySlots = data.availability.filter((a: TimeSlot) => a.day === dayLower);
        const globalIdx = data.availability.indexOf(daySlots[slotIndex]);

        const updated = data.availability.map((slot: TimeSlot, idx: number) => {
            if (idx === globalIdx) {
                if (field === 'start') {
                    // When start changes, auto-set end to +1 hour
                    const startHour = parseInt(value.split(':')[0]);
                    const endHour = (startHour + 1) % 24;
                    const newEnd = `${endHour.toString().padStart(2, '0')}:00`;
                    return { ...slot, start: value, end: newEnd };
                } else {
                    // When end changes, just update it (will be validated on submit)
                    return { ...slot, end: value };
                }
            }
            return slot;
        });
        setData('availability', updated);
    };

    // Calculate duration in minutes between start and end time
    const getSlotDuration = (start: string, end: string): number => {
        const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1] || '0');
        let endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1] || '0');
        // Handle overnight (e.g., 23:00 to 00:00)
        if (endMinutes <= startMinutes) endMinutes += 24 * 60;
        return endMinutes - startMinutes;
    };

    // Check if a slot has valid duration (1 hour or less, but more than 0)
    const isSlotDurationValid = (slot: TimeSlot): boolean => {
        const duration = getSlotDuration(slot.start, slot.end);
        return duration > 0 && duration <= 60;
    };


    const getDaySlots = (day: string): TimeSlot[] => {
        return data.availability.filter((a: TimeSlot) => a.day === day.toLowerCase());
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.teaching_mode) {
            toast.error('Please select a teaching mode');
            return;
        }

        if (data.teaching_types.length === 0) {
            toast.error('Please select at least one teaching type');
            return;
        }

        if (data.availability.length === 0) {
            toast.error('Please add at least one time slot');
            return;
        }

        // Check duration for all slots
        const invalidSlots = data.availability.filter((slot: TimeSlot) => !isSlotDurationValid(slot));
        if (invalidSlots.length > 0) {
            toast.error('Each time slot must be exactly 1 hour or less. Please adjust your end times.');
            return;
        }

        const payload = {
            ...data,
            teaching_modes: [data.teaching_mode]
        };

        router.post('/teacher/onboarding/step-3', payload, {
            onSuccess: () => {
                toast.success('Availability saved!');
            },
        });
    };

    const goBack = () => {
        router.visit('/teacher/onboarding/step-2');
    };

    return (
        <TeacherLayout hideRightSidebar={true} hideLeftSidebar={true}>
            <Head title="Teacher Onboarding - Step 3" />

            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[730px] w-full bg-white rounded-lg shadow-sm p-10">
                    {/* Progress Bar */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <div className="flex items-center justify-center w-[34px] h-[34px] rounded-full bg-[#338078] text-white font-medium text-[16px]" style={{ fontFamily: 'DM Sans' }}>
                                1
                            </div>
                            <div className="w-[98px] h-[6px] bg-[#338078] rounded-full ml-[18px]"></div>
                        </div>
                        <div className="flex items-center">
                            <div className="flex items-center justify-center w-[34px] h-[34px] rounded-full bg-[#338078] text-white font-medium text-[16px]" style={{ fontFamily: 'DM Sans' }}>
                                2
                            </div>
                            <div className="w-[98px] h-[6px] bg-[#338078] rounded-full ml-[18px]"></div>
                        </div>
                        <div className="flex items-center">
                            <div className="flex items-center justify-center w-[34px] h-[34px] rounded-full bg-[#338078] text-white font-medium text-[16px]" style={{ fontFamily: 'DM Sans' }}>
                                3
                            </div>
                            <div className="w-[98px] h-[6px] bg-[#EFF0F6] rounded-full ml-[18px] relative">
                                <div className="absolute left-0 top-0 w-[49px] h-[6px] bg-[#338078] rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center w-[34px] h-[34px] rounded-full bg-[#EFF0F6] text-[#6B7280] font-normal text-[16px]" style={{ fontFamily: 'DM Sans' }}>
                            4
                        </div>
                    </div>

                    <div className="border-b border-gray-200 mb-8"></div>

                    <form onSubmit={submit} className="space-y-8">
                        <div>
                            <h2 className="text-[#170F49] text-[18px] font-medium mb-3" style={{ fontFamily: 'Nunito' }}>
                                Availability & Schedule
                            </h2>
                            <p className="text-[#6B7280] text-[16px] font-medium mb-6" style={{ fontFamily: 'Nunito' }}>
                                Set your teaching hours
                            </p>

                            <div className="grid grid-cols-2 gap-8 mb-8">
                                {/* Timezone */}
                                <div>
                                    <label className="block text-[#170F49] text-[16px] font-medium mb-2" style={{ fontFamily: 'Nunito' }}>
                                        Set your Time Zone
                                    </label>
                                    <p className="text-[#6B7280] text-[12px] mb-3" style={{ fontFamily: 'Nunito' }}>
                                        Essential for coordinating with international students
                                    </p>
                                    <Select
                                        value={data.timezone}
                                        onValueChange={(val) => setData('timezone', val)}
                                    >
                                        <SelectTrigger className="w-full h-[48px] px-[18px] border border-[#9E9E9E] rounded-[5px] text-[#000000] text-[16px] focus:ring-[#338078]">
                                            <SelectValue placeholder="Select timezone..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timezones.map((tz) => (
                                                <SelectItem key={tz} value={tz}>
                                                    {tz}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.timezone && <p className="mt-2 text-sm text-red-600">{errors.timezone}</p>}
                                </div>

                                {/* Teaching Mode */}
                                <div>
                                    <label className="block text-[#170F49] text-[16px] font-medium mb-2" style={{ fontFamily: 'Nunito' }}>
                                        Teaching Mode
                                    </label>
                                    <p className="text-[#6B7280] text-[12px] mb-3" style={{ fontFamily: 'Nunito' }}>
                                        Full-time: Up to 7 days | Part-time: Max 3 days
                                    </p>
                                    <div className="flex gap-6 mt-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${data.teaching_mode === 'full-time' ? 'border-[#338078]' : 'border-[#9E9E9E]'}`}>
                                                {data.teaching_mode === 'full-time' && <div className="w-3 h-3 rounded-full bg-[#338078]" />}
                                            </div>
                                            <input
                                                type="radio"
                                                name="teaching_mode"
                                                value="full-time"
                                                checked={data.teaching_mode === 'full-time'}
                                                onChange={() => handleModeToggle('full-time')}
                                                className="hidden"
                                            />
                                            <span className="text-[#6B7280] text-[16px]" style={{ fontFamily: 'Nunito' }}>Full-Time</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${data.teaching_mode === 'part-time' ? 'border-[#338078]' : 'border-[#9E9E9E]'}`}>
                                                {data.teaching_mode === 'part-time' && <div className="w-3 h-3 rounded-full bg-[#338078]" />}
                                            </div>
                                            <input
                                                type="radio"
                                                name="teaching_mode"
                                                value="part-time"
                                                checked={data.teaching_mode === 'part-time'}
                                                onChange={() => handleModeToggle('part-time')}
                                                className="hidden"
                                            />
                                            <span className="text-[#6B7280] text-[16px]" style={{ fontFamily: 'Nunito' }}>Part-Time</span>
                                        </label>
                                    </div>
                                    {/* @ts-ignore */}
                                    {errors.teaching_modes && <p className="mt-2 text-sm text-red-600">{errors.teaching_modes}</p>}
                                </div>

                                {/* Teaching Type */}
                                <div className="col-span-2">
                                    <label className="block text-[#170F49] text-[16px] font-medium mb-2" style={{ fontFamily: 'Nunito' }}>
                                        Teaching Type
                                    </label>
                                    <p className="text-[#6B7280] text-[12px] mb-3" style={{ fontFamily: 'Nunito' }}>
                                        Select how you want to teach
                                    </p>
                                    <div className="flex gap-6 mt-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.teaching_types.includes('online')}
                                                onChange={() => handleTypeToggle('online')}
                                                className="w-5 h-5 rounded border-[#9E9E9E] text-[#338078] focus:ring-[#338078]"
                                            />
                                            <span className="text-[#6B7280] text-[16px]" style={{ fontFamily: 'Nunito' }}>Online</span>
                                        </label>
                                    </div>
                                    {errors.teaching_types && <p className="mt-2 text-sm text-red-600">{errors.teaching_types}</p>}
                                </div>
                            </div>

                            {/* Availability List */}
                            <div>
                                <label className="block text-[#170F49] text-[16px] font-medium mb-2" style={{ fontFamily: 'Nunito' }}>
                                    Select Your Available Days & Time Slots
                                </label>
                                <p className="text-[#6B7280] text-[12px] mb-6" style={{ fontFamily: 'Nunito' }}>
                                    Add up to {MAX_SLOTS_PER_DAY} time slots per day (1-hour sessions each)
                                </p>

                                <div className="space-y-4">
                                    {DAYS.map((day) => {
                                        const dayLower = day.toLowerCase();
                                        const isExpanded = expandedDays.includes(dayLower);
                                        const daySlots = getDaySlots(day);

                                        return (
                                            <div key={day} className="border border-gray-200 rounded-lg overflow-hidden">
                                                {/* Day Header */}
                                                <div
                                                    className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isExpanded ? 'bg-[#F0FAF9]' : 'bg-white hover:bg-gray-50'}`}
                                                    onClick={() => toggleDay(day)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={isExpanded}
                                                            onChange={() => { }}
                                                            className="w-5 h-5 rounded border-[#9E9E9E] text-[#338078] focus:ring-[#338078]"
                                                        />
                                                        <span className="text-[#170F49] text-[16px] font-medium" style={{ fontFamily: 'Nunito' }}>
                                                            {day}
                                                        </span>
                                                    </div>
                                                    {isExpanded && (
                                                        <span className="text-[#338078] text-[14px]">
                                                            {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Time Slots */}
                                                {isExpanded && (
                                                    <div className="p-4 pt-2 border-t border-gray-100 bg-gray-50">
                                                        <div className="space-y-3">
                                                            {daySlots.map((slot, idx) => (
                                                                <div key={`${day}-${idx}`} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                                                                    <div className="flex-1">
                                                                        <label className="block text-[#6B7280] text-[12px] mb-1">Start Time</label>
                                                                        <input
                                                                            type="time"
                                                                            value={slot.start}
                                                                            onChange={(e) => updateSlotTime(day, idx, 'start', e.target.value)}
                                                                            className="w-full h-[40px] px-3 border border-[#9E9E9E] rounded-[5px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#338078] focus:border-transparent"
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <label className="block text-[#6B7280] text-[12px] mb-1">End Time (max 1hr)</label>
                                                                        <input
                                                                            type="time"
                                                                            value={slot.end}
                                                                            onChange={(e) => updateSlotTime(day, idx, 'end', e.target.value)}
                                                                            className={`w-full h-[40px] px-3 rounded-[5px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#338078] focus:border-transparent ${!isSlotDurationValid(slot) ? 'border-red-500 border-2' : 'border border-[#9E9E9E]'}`}
                                                                        />
                                                                        {!isSlotDurationValid(slot) && (
                                                                            <p className="text-red-500 text-[11px] mt-1">Max 1 hour allowed</p>
                                                                        )}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            removeSlot(day, idx);
                                                                        }}
                                                                        className="mt-5 w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                                        title="Remove slot"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Add Slot Button */}
                                                        {daySlots.length < MAX_SLOTS_PER_DAY && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    addSlot(day);
                                                                }}
                                                                className="mt-3 flex items-center gap-2 text-[#338078] hover:text-[#2a6962] text-[14px] font-medium transition-colors"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                                </svg>
                                                                Add Time Slot
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {errors.availability && <p className="mt-2 text-sm text-red-600">{errors.availability}</p>}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between pt-6">
                            <button
                                type="button"
                                onClick={goBack}
                                className="text-[#338078] px-6 py-3 rounded-[56px] text-[16px] font-medium hover:bg-gray-100 transition-colors"
                                style={{ fontFamily: 'Nunito' }}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-[#338078] text-white px-6 py-3 rounded-[56px] text-[16px] font-medium hover:bg-[#2a6962] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                style={{ fontFamily: 'Nunito' }}
                            >
                                {processing ? 'Saving...' : 'Save and Continue'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </TeacherLayout>
    );
}
