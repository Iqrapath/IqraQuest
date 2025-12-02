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

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    const hour24 = hour.toString().padStart(2, '0');
    return {
        value: `${hour24}:00`,
        label: `${hour12}:00 ${ampm}`
    };
});

export default function Step3({ teacher, timezones = Intl.supportedValuesOf('timeZone') }: Props) {
    // Initialize availability from teacher data or default empty
    // Initialize availability from teacher data or default empty
    // Map DB fields (day_of_week, start_time, end_time) to frontend fields (day, start, end)
    const initialAvailability = (teacher.availability || []).map((slot: any) => ({
        day: slot.day || slot.day_of_week,
        start: slot.start || slot.start_time?.slice(0, 5),
        end: slot.end || slot.end_time?.slice(0, 5)
    }));

    // Ensure teaching_modes is treated as a single string if it comes as an array from backend
    // or if it's already a string (depending on how backend sends it back if validation fails)
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

    const handleModeToggle = (mode: string) => {
        // Single selection logic
        setData('teaching_mode', mode);

        // If switching to part-time, check if we need to trim availability
        if (mode === 'part-time' && data.availability.length > 3) {
            toast.warning('Part-time teachers are limited to 3 days of availability. Please adjust your schedule.');
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

    const handleDayToggle = (day: string) => {
        const currentAvailability = [...data.availability];
        const index = currentAvailability.findIndex((a: any) => a.day.toLowerCase() === day.toLowerCase());

        if (index > -1) {
            // Remove day
            currentAvailability.splice(index, 1);
        } else {
            // Check limits for Part-Time
            if (data.teaching_mode === 'part-time' && currentAvailability.length >= 3) {
                toast.error('Part-time teachers can only select up to 3 days.');
                return;
            }

            // Add day with default times (09:00 - 10:00)
            currentAvailability.push({
                day: day.toLowerCase(),
                start: '09:00',
                end: '10:00'
            });
        }

        setData('availability', currentAvailability);
    };

    const updateTime = (day: string, field: 'start' | 'end', value: string) => {
        // Only allow updating start time, end time is auto-calculated
        if (field === 'end') return;

        const currentAvailability = [...data.availability];
        const index = currentAvailability.findIndex((a: any) => a.day.toLowerCase() === day.toLowerCase());

        if (index > -1) {
            currentAvailability[index].start = value;

            // Calculate end time (Start + 1 hour)
            const timeIndex = TIME_SLOTS.findIndex(t => t.value === value);
            const nextIndex = (timeIndex + 1) % 24;
            currentAvailability[index].end = TIME_SLOTS[nextIndex].value;

            setData('availability', currentAvailability);
        }
    };

    const getDayAvailability = (day: string) => {
        return data.availability.find((a: any) => a.day.toLowerCase() === day.toLowerCase());
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
            toast.error('Please select at least one day of availability');
            return;
        }

        // Transform teaching_mode back to array for backend compatibility
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
                                Your Teaching Expertise
                            </p>

                            <div className="grid grid-cols-2 gap-8 mb-8">
                                {/* Timezone */}
                                <div>
                                    <label className="block text-[#170F49] text-[16px] font-medium mb-2" style={{ fontFamily: 'Nunito' }}>
                                        Set your Time Zone
                                    </label>
                                    <p className="text-[#6B7280] text-[12px] mb-3" style={{ fontFamily: 'Nunito' }}>
                                        A correct time zone is essential to coordinate lessons with international students
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
                                        Max 6 hrs/day for full-time, 3 hrs/day for part-time
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
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.teaching_types.includes('in-person')}
                                                onChange={() => handleTypeToggle('in-person')}
                                                className="w-5 h-5 rounded border-[#9E9E9E] text-[#338078] focus:ring-[#338078]"
                                            />
                                            <span className="text-[#6B7280] text-[16px]" style={{ fontFamily: 'Nunito' }}>In-Person</span>
                                        </label>
                                    </div>
                                    {errors.teaching_types && <p className="mt-2 text-sm text-red-600">{errors.teaching_types}</p>}
                                </div>
                            </div>

                            {/* Availability List */}
                            <div>
                                <label className="block text-[#170F49] text-[16px] font-medium mb-2" style={{ fontFamily: 'Nunito' }}>
                                    Select Your Availability
                                </label>
                                <p className="text-[#6B7280] text-[12px] mb-6" style={{ fontFamily: 'Nunito' }}>
                                    A correct time zone is essential to coordinate lessons with international students
                                </p>

                                <div className="space-y-6">
                                    {DAYS.map((day) => {
                                        const availability = getDayAvailability(day);
                                        const isChecked = !!availability;

                                        return (
                                            <div key={day}>
                                                <label className="flex items-center gap-3 cursor-pointer mb-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handleDayToggle(day)}
                                                        className="w-5 h-5 rounded border-[#9E9E9E] text-[#338078] focus:ring-[#338078]"
                                                    />
                                                    <span className="text-[#170F49] text-[16px] font-medium" style={{ fontFamily: 'Nunito' }}>
                                                        {day}
                                                    </span>
                                                </label>

                                                {isChecked && (
                                                    <div className="grid grid-cols-2 gap-4 ml-8">
                                                        <div>
                                                            <label className="block text-[#170F49] text-[14px] mb-1" style={{ fontFamily: 'Nunito' }}>From</label>
                                                            <Select
                                                                value={availability.start}
                                                                onValueChange={(val) => updateTime(day, 'start', val)}
                                                            >
                                                                <SelectTrigger className="w-full h-[42px] px-[14px] border border-[#9E9E9E] rounded-[5px] text-[#000000] text-[14px] focus:ring-[#338078]">
                                                                    <SelectValue placeholder="Start time" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {TIME_SLOTS.map((time) => (
                                                                        <SelectItem key={`start-${time.value}`} value={time.value}>{time.label}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[#170F49] text-[14px] mb-1" style={{ fontFamily: 'Nunito' }}>To</label>
                                                            <div className="w-full h-[42px] px-[14px] border border-[#E5E7EB] bg-gray-50 rounded-[5px] text-[#6B7280] text-[14px] flex items-center">
                                                                {TIME_SLOTS.find(t => t.value === availability.end)?.label || availability.end}
                                                            </div>
                                                        </div>
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
