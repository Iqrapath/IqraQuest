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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";

interface Subject {
    id: number;
    name: string;
    category?: string | null;
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
    const [comboboxOpen, setComboboxOpen] = useState(false);

    const groupedSubjects = React.useMemo(() => {
        const groups: Record<string, Subject[]> = {};
        subjects.forEach((subject) => {
            const category = subject.category || 'Other';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(subject);
        });
        return groups;
    }, [subjects]);

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
        <TeacherLayout hideRightSidebar={true} hideLeftSidebar={true}>
            <Head title="Teacher Onboarding - Step 2" />

            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[730px] w-full bg-white rounded-lg shadow-sm p-6 sm:p-10">
                    {/* Progress Bar */}
                    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 scrollbar-hide">
                        <div className="flex items-center flex-shrink-0">
                            <div className="flex items-center justify-center w-[34px] h-[34px] rounded-full bg-[#338078] text-white font-medium text-[16px]" style={{ fontFamily: 'DM Sans' }}>
                                1
                            </div>
                            <div className="w-[40px] sm:w-[98px] h-[6px] bg-[#338078] rounded-full ml-2 sm:ml-[18px]"></div>
                        </div>
                        <div className="flex items-center flex-shrink-0 ml-2 sm:ml-0">
                            <div className="flex items-center justify-center w-[34px] h-[34px] rounded-full bg-[#338078] text-white font-medium text-[16px]" style={{ fontFamily: 'DM Sans' }}>
                                2
                            </div>
                            <div className="w-[40px] sm:w-[98px] h-[6px] bg-[#EFF0F6] rounded-full ml-2 sm:ml-[18px] relative">
                                <div className="absolute left-0 top-0 w-[20px] sm:w-[49px] h-[6px] bg-[#338078] rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex items-center flex-shrink-0 ml-2 sm:ml-0">
                            <div className="flex items-center justify-center w-[34px] h-[34px] rounded-full bg-[#EFF0F6] text-[#6B7280] font-normal text-[16px]" style={{ fontFamily: 'DM Sans' }}>
                                3
                            </div>
                            <div className="w-[40px] sm:w-[98px] h-[6px] bg-[#EFF0F6] rounded-full ml-2 sm:ml-[18px]"></div>
                        </div>
                        <div className="flex items-center justify-center flex-shrink-0 w-[34px] h-[34px] rounded-full bg-[#EFF0F6] text-[#6B7280] font-normal text-[16px] ml-2 sm:ml-0" style={{ fontFamily: 'DM Sans' }}>
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
                                <div className="space-y-3">
                                    <label className="block text-[#170F49] text-[16px] font-medium mb-1" style={{ fontFamily: 'Nunito' }}>
                                        Subjects you teach
                                    </label>
                                    
                                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={comboboxOpen}
                                                className="w-full justify-between h-[48px] px-[18px] border border-[#9E9E9E] rounded-[5px] text-[#000000] text-[16px] font-normal hover:bg-white hover:text-[#000000] focus:ring-[#338078] focus:border-[#338078]"
                                            >
                                                {data.subjects.length > 0 
                                                    ? `${data.subjects.length} subject${data.subjects.length > 1 ? 's' : ''} selected` 
                                                    : "Select subjects you teach..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                            <Command className="w-full">
                                                <CommandInput placeholder="Search subjects..." className="h-11 border-none focus:ring-0" />
                                                <CommandList className="max-h-[300px] overflow-y-auto">
                                                    <CommandEmpty>No subject found.</CommandEmpty>
                                                    {Object.entries(groupedSubjects).map(([category, categorySubjects]) => (
                                                        <CommandGroup key={category} heading={category} className="px-2 py-1.5 text-[#1a1d56] font-bold">
                                                            {categorySubjects.map((subject) => {
                                                                const isSelected = data.subjects.includes(subject.id);
                                                                return (
                                                                    <CommandItem
                                                                        key={subject.id}
                                                                        value={subject.name}
                                                                        onSelect={() => handleSubjectToggle(subject.id)}
                                                                        className="cursor-pointer flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-100/80 text-sm font-normal text-gray-700"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <div className={cn(
                                                                                "flex h-4 w-4 items-center justify-center rounded border border-gray-300 transition-colors",
                                                                                isSelected ? "bg-[#338078] border-[#338078] text-white" : "bg-white"
                                                                            )}>
                                                                                {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                                                            </div>
                                                                            <span>{subject.name}</span>
                                                                        </div>
                                                                    </CommandItem>
                                                                );
                                                            })}
                                                        </CommandGroup>
                                                    ))}
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>

                                    {/* Display selected subject badges */}
                                    {data.subjects.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {data.subjects.map((subId: number) => {
                                                const subject = subjects.find(s => s.id === subId);
                                                if (!subject) return null;
                                                return (
                                                    <Badge
                                                        key={subId}
                                                        variant="secondary"
                                                        className="bg-[#E8F5F4] hover:bg-[#d5eded] text-[#338078] border border-[#338078]/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[14px] font-medium"
                                                    >
                                                        {subject.name}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSubjectToggle(subId)}
                                                            className="text-[#338078] hover:text-red-500 transition-colors focus:outline-none"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {errors.subjects && <p className="mt-2 text-sm text-red-600">{errors.subjects}</p>}
                                </div>

                                {/* Years of Experience and Qualification Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
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
                        <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-6">
                            <button
                                type="button"
                                onClick={goBack}
                                className="w-full sm:w-auto text-[#338078] px-6 py-3 rounded-[56px] text-[16px] font-medium hover:bg-gray-100 transition-colors"
                                style={{ fontFamily: 'Nunito' }}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto bg-[#338078] text-white px-6 py-3 rounded-[56px] text-[16px] font-medium hover:bg-[#2a6962] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
