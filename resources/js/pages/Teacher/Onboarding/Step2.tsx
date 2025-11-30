import React, { useState, useEffect } from 'react';
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
import { Input } from "@/components/ui/input";

interface Subject {
    id: number;
    name: string;
}

interface Props {
    teacher: any;
    subjects: Subject[];
}

const EXPERIENCE_OPTIONS = [
    { value: "0", label: "0-1 years" },
    { value: "1", label: "1-3 years" },
    { value: "3", label: "3-5 years" },
    { value: "5", label: "5-10 years" },
    { value: "10", label: "10+ years" },
];

const QUALIFICATION_OPTIONS = [
    { value: "high_school", label: "High School" },
    { value: "bachelor", label: "Bachelor's Degree" },
    { value: "master", label: "Master's Degree" },
    { value: "doctorate", label: "Doctorate" },
];

export default function Step2({ teacher, subjects }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        subjects: teacher.subjects?.map((s: any) => s.id) || [],
        experience_years: teacher.experience_years?.toString() || '',
        qualification_level: teacher.qualification_level || '',
        bio: teacher.bio || '',
    });

    const [bioLength, setBioLength] = useState(data.bio.length);

    // Determine initial selection state
    const getInitialExperienceSelection = () => {
        const val = teacher.experience_years?.toString();
        if (!val) return "";
        return EXPERIENCE_OPTIONS.some(opt => opt.value === val) ? val : "other";
    };

    const getInitialQualificationSelection = () => {
        const val = teacher.qualification_level;
        if (!val) return "";
        return QUALIFICATION_OPTIONS.some(opt => opt.value === val) ? val : "other";
    };

    const [experienceSelection, setExperienceSelection] = useState<string>(getInitialExperienceSelection());
    const [qualificationSelection, setQualificationSelection] = useState<string>(getInitialQualificationSelection());

    const handleSubjectToggle = (subjectId: number) => {
        const currentSubjects = [...data.subjects];
        const index = currentSubjects.indexOf(subjectId);

        if (index > -1) {
            currentSubjects.splice(index, 1);
        } else {
            currentSubjects.push(subjectId);
        }

        setData('subjects', currentSubjects);
    };

    const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length <= 1000) {
            setData('bio', value);
            setBioLength(value.length);
        }
    };

    const handleExperienceSelect = (value: string) => {
        setExperienceSelection(value);
        if (value !== "other") {
            setData('experience_years', value);
        } else {
            setData('experience_years', ''); // Clear for custom input
        }
    };

    const handleQualificationSelect = (value: string) => {
        setQualificationSelection(value);
        if (value !== "other") {
            setData('qualification_level', value);
        } else {
            setData('qualification_level', ''); // Clear for custom input
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.subjects.length === 0) {
            toast.error('Please select at least one subject');
            return;
        }

        if (experienceSelection === 'other' && !data.experience_years) {
            toast.error('Please enter your years of experience');
            return;
        }

        if (qualificationSelection === 'other' && !data.qualification_level) {
            toast.error('Please enter your qualification');
            return;
        }

        post('/teacher/onboarding/step-2', {
            onSuccess: () => {
                toast.success('Teaching details saved!');
            },
        });
    };

    const goBack = () => {
        router.visit('/teacher/onboarding/step-1');
    };

    return (
        <TeacherLayout>
            <Head title="Teacher Onboarding - Step 2" />

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
                            <div className="w-[98px] h-[6px] bg-[#EFF0F6] rounded-full ml-[18px] relative">
                                <div className="absolute left-0 top-0 w-[49px] h-[6px] bg-[#338078] rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="flex items-center justify-center w-[34px] h-[34px] rounded-full bg-[#EFF0F6] text-[#6B7280] font-normal text-[16px]" style={{ fontFamily: 'DM Sans' }}>
                                3
                            </div>
                            <div className="w-[98px] h-[6px] bg-[#EFF0F6] rounded-full ml-[18px]"></div>
                        </div>
                        <div className="flex items-center justify-center w-[34px] h-[34px] rounded-full bg-[#EFF0F6] text-[#6B7280] font-normal text-[16px]" style={{ fontFamily: 'DM Sans' }}>
                            4
                        </div>
                    </div>

                    <div className="border-b border-gray-200 mb-8"></div>

                    <form onSubmit={submit} className="space-y-8">
                        {/* Teaching Details Section */}
                        <div>
                            <h2 className="text-[#170F49] text-[18px] font-medium mb-3" style={{ fontFamily: 'Nunito' }}>
                                Teaching Details
                            </h2>
                            <p className="text-[#6B7280] text-[16px] font-medium mb-6" style={{ fontFamily: 'Nunito' }}>
                                Your Teaching Expertise
                            </p>

                            <div className="space-y-7">
                                {/* Subjects you teach */}
                                <div>
                                    <label className="block text-[#170F49] text-[16px] font-medium mb-4" style={{ fontFamily: 'Nunito' }}>
                                        Subjects you teach
                                    </label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {subjects.map((subject) => (
                                            <label
                                                key={subject.id}
                                                className="flex items-center gap-2 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={data.subjects.includes(subject.id)}
                                                    onChange={() => handleSubjectToggle(subject.id)}
                                                    className="w-5 h-5 rounded border-[#9E9E9E] text-[#338078] focus:ring-[#338078]"
                                                />
                                                <span className="text-[#170F49] text-[16px]" style={{ fontFamily: 'Nunito' }}>
                                                    {subject.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.subjects && <p className="mt-2 text-sm text-red-600">{errors.subjects}</p>}
                                </div>

                                {/* Years of Experience and Qualification Row */}
                                <div className="grid grid-cols-2 gap-8">
                                    {/* Years of Experience */}
                                    <div>
                                        <label htmlFor="experience" className="block text-[#170F49] text-[16px] font-medium mb-4" style={{ fontFamily: 'Nunito' }}>
                                            Years of Experience
                                        </label>
                                        <Select
                                            value={experienceSelection}
                                            onValueChange={handleExperienceSelect}
                                        >
                                            <SelectTrigger className="w-full h-[48px] px-[18px] border border-[#9E9E9E] rounded-[5px] text-[#000000] text-[16px] focus:ring-[#338078]">
                                                <SelectValue placeholder="Select one option..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {EXPERIENCE_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {experienceSelection === 'other' && (
                                            <div className="mt-2">
                                                <Input
                                                    type="number"
                                                    placeholder="Enter years of experience"
                                                    value={data.experience_years}
                                                    onChange={(e) => setData('experience_years', e.target.value)}
                                                    className="w-full h-[48px] px-[18px] border border-[#9E9E9E] rounded-[5px] text-[#000000] text-[16px] focus:ring-[#338078]"
                                                />
                                            </div>
                                        )}
                                        {errors.experience_years && <p className="mt-2 text-sm text-red-600">{errors.experience_years}</p>}
                                    </div>

                                    {/* Qualification */}
                                    <div>
                                        <label htmlFor="qualification" className="block text-[#170F49] text-[16px] font-medium mb-4" style={{ fontFamily: 'Nunito' }}>
                                            Qualification
                                        </label>
                                        <Select
                                            value={qualificationSelection}
                                            onValueChange={handleQualificationSelect}
                                        >
                                            <SelectTrigger className="w-full h-[48px] px-[18px] border border-[#9E9E9E] rounded-[5px] text-[#000000] text-[16px] focus:ring-[#338078]">
                                                <SelectValue placeholder="Select one option..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {QUALIFICATION_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {qualificationSelection === 'other' && (
                                            <div className="mt-2">
                                                <Input
                                                    type="text"
                                                    placeholder="Enter your qualification"
                                                    value={data.qualification_level}
                                                    onChange={(e) => setData('qualification_level', e.target.value)}
                                                    className="w-full h-[48px] px-[18px] border border-[#9E9E9E] rounded-[5px] text-[#000000] text-[16px] focus:ring-[#338078]"
                                                />
                                            </div>
                                        )}
                                        {errors.qualification_level && <p className="mt-2 text-sm text-red-600">{errors.qualification_level}</p>}
                                    </div>
                                </div>

                                {/* Introduce Yourself */}
                                <div>
                                    <label htmlFor="bio" className="block text-[#170F49] text-[18px] font-medium mb-3" style={{ fontFamily: 'Nunito' }}>
                                        Introduce Yourself
                                    </label>
                                    <p className="text-[#6B7280] text-[16px] font-medium mb-4" style={{ fontFamily: 'Nunito' }}>
                                        Show potential students who you are! share your teaching experience and passion for education and briefly mention your interests and hobbies
                                    </p>
                                    <div className="relative">
                                        <textarea
                                            id="bio"
                                            value={data.bio}
                                            onChange={handleBioChange}
                                            placeholder="Write your bio here"
                                            rows={6}
                                            className="w-full px-[18px] py-[12px] border border-[#9E9E9E] rounded-[5px] text-[#000000] text-[16px] placeholder:text-[#6B7280] focus:outline-none focus:border-[#338078] focus:ring-1 focus:ring-[#338078] resize-none"
                                            style={{ fontFamily: 'Nunito' }}
                                        />
                                        <div className="absolute bottom-3 right-3 text-[#6B7280] text-[14px]" style={{ fontFamily: 'Nunito' }}>
                                            {bioLength}/1000
                                        </div>
                                    </div>
                                    {errors.bio && <p className="mt-2 text-sm text-red-600">{errors.bio}</p>}
                                </div>
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
