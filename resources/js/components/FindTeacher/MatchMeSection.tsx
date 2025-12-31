import React, { useState } from 'react';
import { toast } from 'sonner';
import { Combobox } from '@/components/ui/combobox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';

interface MatchMeSectionProps {
    subjects?: Array<{ id: number; name: string }>;
}

export default function MatchMeSection({ subjects = [] }: MatchMeSectionProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        timePreference: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const timePreferences = [
        { value: 'morning', label: 'Morning (6AM - 12PM)' },
        { value: 'afternoon', label: 'Afternoon (12PM - 6PM)' },
        { value: 'evening', label: 'Evening (6PM - 10PM)' },
        { value: 'flexible', label: 'Flexible' },
    ];

    // Default subjects if none provided
    const defaultSubjects = [
        { id: 1, name: 'Tajweed' },
        { id: 2, name: 'Hifz' },
        { id: 3, name: 'Qaida' },
        { id: 4, name: 'Arabic Language' },
        { id: 5, name: 'Islamic Studies' },
    ];

    const subjectOptions = (subjects.length > 0 ? subjects : defaultSubjects).map(s => ({
        value: s.id.toString(),
        label: s.name,
    }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.email || !formData.subject || !formData.timePreference) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post('/api/match-request', {
                name: formData.name,
                email: formData.email,
                subject: formData.subject,
                time_preference: formData.timePreference,
            });

            if (response.data.success) {
                toast.success("Check your email! 📧", {
                    description: response.data.message || "We've sent personalized teacher recommendations to your email.",
                    duration: 6000,
                });

                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    timePreference: '',
                });
            } else {
                toast.error("Matching failed", {
                    description: response.data.message || "Please try again later.",
                });
            }
        } catch (error: any) {
            const message = error.response?.data?.message || "Something went wrong. Please try again.";
            toast.error("Error", {
                description: message,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section
            className="relative w-full py-[clamp(1.5rem,1.67vw,1.5rem)] px-[clamp(1rem,11.81vw,10.625rem)]"
            style={{
                backgroundImage: "linear-gradient(79.4deg, rgb(255, 251, 249) 0.37%, rgba(239, 253, 251, 0.8) 64.96%, rgba(228, 255, 252, 0) 113.39%)"
            }}
        >
            {/* Header Section */}
            <div className="flex flex-col gap-[clamp(2rem,3.4vw,3.063rem)] items-start mb-[clamp(2rem,3.4vw,3.063rem)]">
                {/* Title with Gradient */}
                <div
                    className="font-['Nunito'] font-bold text-[clamp(2rem,3.61vw,3.25rem)] leading-[1.2] bg-clip-text"
                    style={{
                        WebkitTextFillColor: "transparent",
                        backgroundImage: "linear-gradient(to left, #0a1a18, #338078)"
                    }}
                >
                    <p className="mb-1">Not Sure</p>
                    <p>Who to Choose?</p>
                </div>

                {/* Subtitle */}
                <p className="font-['Nunito'] font-normal text-[clamp(1rem,2.22vw,2rem)] text-[#6b7280] max-w-[1015px]">
                    Let us match you with a verified Quran teacher based on your preferences. Fill the short form below and we'll take care of the rest.
                </p>
            </div>

            {/* Content Grid */}
            <div className="flex flex-col lg:flex-row gap-[clamp(2rem,4vw,4rem)] items-start">
                {/* Form Section */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-[clamp(1.5rem,2.36vw,2.125rem)] w-full lg:w-[480px]">
                    {/* Name Field */}
                    <div className="flex flex-col gap-[11px]">
                        <label className="font-['Nunito'] font-medium text-[clamp(0.875rem,1vw,0.899rem)] text-black">
                            Your Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Write your name"
                            className="w-full h-[45px] px-[18px] py-3 bg-white border border-[#9ca3af] rounded-[12px] font-['Nunito'] font-light text-[clamp(0.75rem,0.88vw,0.787rem)] text-[#080808] placeholder:text-[#b4b4b4] outline-none focus:border-[#338078] focus:ring-2 focus:ring-[#338078]/20 transition-colors"
                        />
                    </div>

                    {/* Email Field */}
                    <div className="flex flex-col gap-[11px]">
                        <label className="font-['Nunito'] font-medium text-[clamp(0.875rem,1vw,0.899rem)] text-black">
                            Your Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Write your email"
                            className="w-full h-[45px] px-[18px] py-3 bg-white border border-[#9ca3af] rounded-[12px] font-['Nunito'] font-light text-[clamp(0.75rem,0.88vw,0.787rem)] text-[#080808] placeholder:text-[#b4b4b4] outline-none focus:border-[#338078] focus:ring-2 focus:ring-[#338078]/20 transition-colors"
                        />
                    </div>

                    {/* Subject Combobox */}
                    <div className="flex flex-col gap-[11px]">
                        <label className="font-['Nunito'] font-medium text-[clamp(0.875rem,1vw,0.899rem)] text-black">
                            Preferred Subjects
                        </label>
                        <Combobox
                            options={subjectOptions}
                            value={formData.subject}
                            onChange={(val) => setFormData({ ...formData, subject: val })}
                            placeholder="e.g., Tajweed, Hifz"
                            searchPlaceholder="Search subjects..."
                            emptyText="No subject found"
                            className="w-full h-[45px] bg-white border border-[#9ca3af] rounded-[12px] font-['Nunito'] text-sm"
                        />
                    </div>

                    {/* Time Preference Select */}
                    <div className="flex flex-col gap-[11px]">
                        <label className="font-['Nunito'] font-medium text-[clamp(0.875rem,1vw,0.899rem)] text-black">
                            Best Time to Learn
                        </label>
                        <Select
                            value={formData.timePreference}
                            onValueChange={(val) => setFormData({ ...formData, timePreference: val })}
                        >
                            <SelectTrigger className="w-full h-[45px] px-[18px] bg-white border border-[#9ca3af] rounded-[12px] font-['Nunito'] text-sm">
                                <SelectValue placeholder="e.g., Morning, Afternoon" />
                            </SelectTrigger>
                            <SelectContent>
                                {timePreferences.map((pref) => (
                                    <SelectItem key={pref.value} value={pref.value}>
                                        {pref.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full lg:w-[234px] h-[46px] rounded-[56px] bg-[#338078] font-['Nunito'] font-medium text-base capitalize text-white transition-all hover:bg-[#2a6b64] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Finding Matches...
                            </>
                        ) : (
                            'Match Me With a Teacher'
                        )}
                    </button>
                </form>

                {/* Images Section */}
                <div className="relative hidden lg:block flex-1 min-h-[555px]">
                    {/* Main Image */}
                    <div className="absolute right-0 top-0 h-[555px] w-[536px] rounded-b-[24px] overflow-hidden">
                        <img
                            src="/images/Rectangle 34624143.png"
                            alt="Student learning Quran"
                            className="h-full w-full object-cover"
                        />
                    </div>

                    {/* Overlapping Image */}
                    <div className="absolute left-0 bottom-0 h-[314px] w-[304px] rounded-[28px] overflow-hidden shadow-xl">
                        <img
                            src="/images/Rectangle 34624144.png"
                            alt="Teacher helping student"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
