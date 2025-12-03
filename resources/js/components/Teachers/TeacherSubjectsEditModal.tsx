import { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface Subject {
    id: number;
    name: string;
}

interface Teacher {
    id: number;
    subjects: Subject[];
    experience_years: number;
    qualification_level?: string;
    teaching_type?: string;
    teaching_mode: string;
    availability?: {
        day_of_week: string;
        start_time: string;
        end_time: string;
        is_available: boolean;
    }[];
}

interface TeacherSubjectsEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacher: Teacher;
    availableSubjects: Subject[];
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

export default function TeacherSubjectsEditModal({
    isOpen,
    onClose,
    teacher,
    availableSubjects,
}: TeacherSubjectsEditModalProps) {
    // Initialize availability from database (convert DB format to frontend format)
    const initializeAvailability = () => {
        return (teacher.availability || []).map((slot: any) => ({
            day: (slot.day || slot.day_of_week).toLowerCase(),
            start: (slot.start || slot.start_time)?.slice(0, 5) || '09:00',
            end: (slot.end || slot.end_time)?.slice(0, 5) || '10:00'
        }));
    };

    // Determine initial experience selection (check if matches preset or is "other")
    const getInitialExperienceSelection = () => {
        const val = teacher.experience_years?.toString();
        if (!val) return "";
        return EXPERIENCE_OPTIONS.some(opt => opt.value === val) ? val : "other";
    };

    // Determine initial qualification selection
    const getInitialQualificationSelection = () => {
        const val = teacher.qualification_level;
        if (!val) return "";
        return QUALIFICATION_OPTIONS.some(opt => opt.value === val) ? val : "other";
    };

    const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>(
        teacher.subjects.map(s => s.id)
    );
    const [teachingMode, setTeachingMode] = useState(teacher.teaching_mode || 'full-time');
    const [teachingType, setTeachingType] = useState(teacher.teaching_type || 'online');

    const [experienceSelection, setExperienceSelection] = useState<string>(getInitialExperienceSelection());
    const [customExperience, setCustomExperience] = useState(
        getInitialExperienceSelection() === "other" ? teacher.experience_years?.toString() || '' : ''
    );

    const [qualificationSelection, setQualificationSelection] = useState<string>(getInitialQualificationSelection());
    const [customQualification, setCustomQualification] = useState(
        getInitialQualificationSelection() === "other" ? teacher.qualification_level || '' : ''
    );

    const [availability, setAvailability] = useState<any[]>(initializeAvailability());
    const [error, setError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleToggleSubject = (subjectId: number) => {
        setSelectedSubjectIds(prev => {
            if (prev.includes(subjectId)) {
                return prev.filter(id => id !== subjectId);
            } else {
                return [...prev, subjectId];
            }
        });
        if (error) setError('');
    };

    const handleExperienceSelect = (value: string) => {
        setExperienceSelection(value);
        if (value !== "other") {
            setCustomExperience('');
        }
    };

    const handleQualificationSelect = (value: string) => {
        setQualificationSelection(value);
        if (value !== "other") {
            setCustomQualification('');
        }
    };

    const handleDayToggle = (day: string) => {
        const currentAvailability = [...availability];
        const index = currentAvailability.findIndex((a: any) => a.day.toLowerCase() === day.toLowerCase());

        if (index > -1) {
            // Remove day
            currentAvailability.splice(index, 1);
        } else {
            // Check limits for Part-Time
            if (teachingMode === 'part-time' && currentAvailability.length >= 3) {
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

        setAvailability(currentAvailability);
    };

    const updateTime = (day: string, value: string) => {
        const currentAvailability = [...availability];
        const index = currentAvailability.findIndex((a: any) => a.day.toLowerCase() === day.toLowerCase());

        if (index > -1) {
            currentAvailability[index].start = value;

            // Calculate end time (Start + 1 hour)
            const timeIndex = TIME_SLOTS.findIndex(t => t.value === value);
            const nextIndex = (timeIndex + 1) % 24;
            currentAvailability[index].end = TIME_SLOTS[nextIndex].value;

            setAvailability(currentAvailability);
        }
    };

    const getDayAvailability = (day: string) => {
        return availability.find((a: any) => a.day.toLowerCase() === day.toLowerCase());
    };

    const validateForm = () => {
        if (selectedSubjectIds.length === 0) {
            setError('Please select at least one subject');
            return false;
        }

        if (!experienceSelection) {
            setError('Please select years of experience');
            return false;
        }

        if (experienceSelection === 'other' && !customExperience) {
            setError('Please enter your years of experience');
            return false;
        }

        if (qualificationSelection === 'other' && !customQualification) {
            setError('Please enter your qualification');
            return false;
        }

        if (availability.length === 0) {
            setError('Please select at least one day of availability');
            return false;
        }

        setError('');
        return true;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSubmitting(true);

        // Get final experience value
        const finalExperience = experienceSelection === 'other' ? parseInt(customExperience) : parseInt(experienceSelection);

        // Get final qualification value
        const finalQualification = qualificationSelection === 'other' ? customQualification : qualificationSelection;

        router.put(`/admin/teachers/${teacher.id}/subjects-details`, {
            subject_ids: selectedSubjectIds,
            teaching_mode: teachingMode,
            teaching_type: teachingType,
            years_of_experience: finalExperience,
            qualification: finalQualification,
            availability: availability,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                toast.success('Subjects & experience updated successfully');
                onClose();
            },
            onError: (err) => {
                setIsSubmitting(false);
                if (err.subject_ids) {
                    setError(err.subject_ids as string);
                }
                toast.error('Failed to update subjects & experience');
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[580px] p-0 gap-0 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <DialogHeader className="px-8 pt-8 pb-0">
                    <DialogTitle className="font-['Nunito'] font-semibold text-[20px] text-[#1a1a1a] leading-[1.2]">
                        Teacher Subjects & Experience
                    </DialogTitle>
                </DialogHeader>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8">
                    <div className="flex flex-col gap-6">
                        {/* Subjects Taught */}
                        <div className="flex flex-col gap-3">
                            <Label className="font-['Nunito'] font-medium text-sm text-[#1a1a1a]">
                                Subjects Taught
                            </Label>
                            <div className="flex flex-wrap gap-4">
                                {availableSubjects.map((subject) => (
                                    <div key={subject.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`subject-${subject.id}`}
                                            checked={selectedSubjectIds.includes(subject.id)}
                                            onCheckedChange={() => handleToggleSubject(subject.id)}
                                        />
                                        <label
                                            htmlFor={`subject-${subject.id}`}
                                            className="font-['Nunito'] text-sm text-[#333333] cursor-pointer"
                                        >
                                            {subject.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            {error && selectedSubjectIds.length === 0 && (
                                <p className="text-xs text-red-500 font-['Nunito']">{error}</p>
                            )}
                        </div>

                        {/* Teaching Mode */}
                        <div className="flex flex-col gap-3">
                            <Label className="font-['Nunito'] font-medium text-sm text-[#1a1a1a]">
                                Teaching Mode
                            </Label>
                            <p className="text-xs text-gray-500 font-['Nunito']">
                                Max 6 hrs/day for full-time, 3 hrs/day for part-time
                            </p>
                            <RadioGroup value={teachingMode} onValueChange={setTeachingMode}>
                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="full-time" id="full-time" />
                                        <Label htmlFor="full-time" className="font-['Nunito'] text-sm text-[#333333] cursor-pointer">
                                            Full-Time
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="part-time" id="part-time" />
                                        <Label htmlFor="part-time" className="font-['Nunito'] text-sm text-[#333333] cursor-pointer">
                                            Part-Time
                                        </Label>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Teaching Type */}
                        <div className="flex flex-col gap-3">
                            <Label className="font-['Nunito'] font-medium text-sm text-[#1a1a1a]">
                                Teaching Type
                            </Label>
                            <RadioGroup value={teachingType} onValueChange={setTeachingType}>
                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="online" id="online" />
                                        <Label htmlFor="online" className="font-['Nunito'] text-sm text-[#333333] cursor-pointer">
                                            Online
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="in-person" id="in-person" />
                                        <Label htmlFor="in-person" className="font-['Nunito'] text-sm text-[#333333] cursor-pointer">
                                            In-person
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="both" id="both" />
                                        <Label htmlFor="both" className="font-['Nunito'] text-sm text-[#333333] cursor-pointer">
                                            Both
                                        </Label>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Years of Experience & Qualification */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Years of Experience */}
                            <div className="flex flex-col gap-2">
                                <Label className="font-['Nunito'] font-medium text-sm text-[#1a1a1a]">
                                    Years of Experience
                                </Label>
                                <Select value={experienceSelection} onValueChange={handleExperienceSelect}>
                                    <SelectTrigger className="font-['Nunito']">
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
                                    <Input
                                        type="number"
                                        placeholder="Enter years of experience"
                                        value={customExperience}
                                        onChange={(e) => setCustomExperience(e.target.value)}
                                        className="font-['Nunito'] mt-1"
                                    />
                                )}
                            </div>

                            {/* Qualification */}
                            <div className="flex flex-col gap-2">
                                <Label className="font-['Nunito'] font-medium text-sm text-[#1a1a1a]">
                                    Qualification
                                </Label>
                                <Select value={qualificationSelection} onValueChange={handleQualificationSelect}>
                                    <SelectTrigger className="font-['Nunito']">
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
                                    <Input
                                        type="text"
                                        placeholder="Enter your qualification"
                                        value={customQualification}
                                        onChange={(e) => setCustomQualification(e.target.value)}
                                        className="font-['Nunito'] mt-1"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="flex flex-col gap-3">
                            <Label className="font-['Nunito'] font-medium text-sm text-[#1a1a1a]">
                                Select Your Availability
                            </Label>
                            <p className="text-xs text-gray-500 font-['Nunito']">
                                A correct time zone is essential to coordinate lessons with international students
                            </p>

                            <div className="flex flex-col gap-4">
                                {DAYS.map((day) => {
                                    const dayAvailability = getDayAvailability(day);
                                    const isChecked = !!dayAvailability;

                                    return (
                                        <div key={day}>
                                            <label className="flex items-center gap-3 cursor-pointer mb-2">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleDayToggle(day)}
                                                    className="w-5 h-5 rounded border-[#9E9E9E] text-[#338078] focus:ring-[#338078]"
                                                />
                                                <span className="font-['Nunito'] text-sm font-medium text-[#333333]">
                                                    {day}
                                                </span>
                                            </label>

                                            {isChecked && dayAvailability && (
                                                <div className="grid grid-cols-2 gap-3 ml-8">
                                                    <div>
                                                        <label className="block text-[#170F49] text-xs mb-1 font-['Nunito']">From</label>
                                                        <Select
                                                            value={dayAvailability.start}
                                                            onValueChange={(val) => updateTime(day, val)}
                                                        >
                                                            <SelectTrigger className="font-['Nunito'] h-9 text-sm">
                                                                <SelectValue placeholder="Start time" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {TIME_SLOTS.map((time) => (
                                                                    <SelectItem key={`start-${time.value}`} value={time.value}>
                                                                        {time.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[#170F49] text-xs mb-1 font-['Nunito']">To</label>
                                                        <div className="h-9 px-3 border border-[#E5E7EB] bg-gray-50 rounded-md text-[#6B7280] text-sm flex items-center">
                                                            {TIME_SLOTS.find(t => t.value === dayAvailability.end)?.label || dayAvailability.end}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* General Error */}
                        {error && (
                            <p className="text-xs text-red-500 font-['Nunito']">{error}</p>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#2D9A8C] hover:bg-[#248074] text-white px-6 py-2.5 rounded-lg font-['Nunito'] font-medium text-sm disabled:opacity-50"
                            >
                                {isSubmitting ? 'Saving...' : 'Save and Continue'}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
