import { Icon } from '@iconify/react';
import { router, useForm } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import AppLogoIcon from './app-logo-icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, X } from 'lucide-react';

interface Subject {
    id: number;
    name: string;
    description: string;
    icon?: string;
    category?: string | null;
}

interface StudentOnboardingModalProps {
    isOpen: boolean;
    onComplete: () => void;
    onSkip: () => void;
}

export default function StudentOnboardingModal({ isOpen, onComplete, onSkip }: StudentOnboardingModalProps) {
    const [step, setStep] = useState(1);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [comboboxOpen, setComboboxOpen] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        gender: '',
        date_of_birth: '',
        city: '',
        country: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        learning_goal_description: '',
        availability_type: 'flexible',
        subjects: [] as number[],
    });

    const groupedSubjects = useMemo(() => {
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

    useEffect(() => {
        if (isOpen && step === 3 && subjects.length === 0) {
            fetchSubjects();
        }
    }, [isOpen, step]);

    const fetchSubjects = async () => {
        setIsLoadingSubjects(true);
        try {
            const response = await fetch('/student/onboarding/subjects');
            const result = await response.json();
            setSubjects(result);
        } catch (error) {
            toast.error('Failed to load subjects. Please try again.');
        } finally {
            setIsLoadingSubjects(false);
        }
    };

    const nextStep = () => setStep((s) => s + 1);
    const prevStep = () => setStep((s) => s - 1);

    const handleComplete = () => {
        post('/student/onboarding/complete', {
            onSuccess: () => {
                toast.success('Welcome aboard!');
                onComplete();
            },
            onError: () => {
                toast.error('Submission failed. Please check your details.');
            }
        });
    };

    const handleSkip = () => {
        post('/student/onboarding/skip', {
            onSuccess: () => {
                onSkip();
            }
        });
    };

    if (!isOpen) return null;

    const toggleSubject = (id: number) => {
        const current = [...data.subjects];
        if (current.includes(id)) {
            setData('subjects', current.filter(sid => sid !== id));
        } else {
            setData('subjects', [...current, id]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1d56]/40 backdrop-blur-sm p-4 overflow-hidden">
            <div className="relative flex w-full max-w-[650px] max-h-[90vh] flex-col rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">

                {/* Fixed Header */}
                <div className="p-6 md:px-12 md:pt-10 md:pb-6 border-b border-gray-50 shrink-0 bg-white">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <AppLogoIcon className="h-7 w-auto text-[#338078]" />
                            <span className="font-['Nunito'] text-xl font-bold text-[#1a1d56] hidden sm:inline">IqraQuest</span>
                        </div>
                        <div className="flex gap-1.5">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 w-6 sm:w-8 rounded-full transition-all duration-300 ${step >= i ? 'bg-[#338078]' : 'bg-gray-100'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:px-12 md:py-8 scrollbar-thin scrollbar-thumb-gray-200">
                    {/* Step 1: Welcome */}
                    {step === 1 && (
                        <div className="flex flex-col gap-8 text-center animate-in slide-in-from-bottom-4 duration-500">
                            <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-[#E8F5F4] rounded-full flex items-center justify-center shrink-0">
                                <Icon icon="solar:globus-bold-duotone" className="w-10 h-10 sm:w-12 sm:h-12 text-[#338078]" />
                            </div>
                            <div className="flex flex-col gap-3">
                                <h2 className="font-['Nunito'] text-[28px] sm:text-[32px] font-extrabold text-[#1a1d56]">Marhaban! 🎓</h2>
                                <p className="font-['Inter'] text-gray-500 text-base sm:text-lg">
                                    We're excited to help you start your Islamic learning journey. Let's personalize your experience.
                                </p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl flex flex-col gap-4 text-left">
                                <div className="flex gap-4 items-center">
                                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
                                        <Icon icon="solar:user-rounded-bold" className="text-[#338078] w-6 h-6" />
                                    </div>
                                    <p className="text-[#1a1d56] font-medium text-sm sm:text-base">Create your unique student profile</p>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
                                        <Icon icon="solar:star-bold" className="text-[#338078] w-6 h-6" />
                                    </div>
                                    <p className="text-[#1a1d56] font-medium text-sm sm:text-base">Select your preferred learning subjects</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Personal Info */}
                    {step === 2 && (
                        <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500">
                            <div className="text-center md:text-left">
                                <h2 className="font-['Nunito'] text-2xl font-bold text-[#1a1d56]">Personal Details</h2>
                                <p className="text-gray-500 text-sm sm:text-base">Tell us a bit about yourself and your location.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#1a1d56]">Date of Birth</label>
                                    <Input
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={e => setData('date_of_birth', e.target.value)}
                                        className="rounded-xl border-gray-200 focus:border-[#338078] focus:ring-0 h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#1a1d56]">Gender</label>
                                    <Select value={data.gender} onValueChange={v => setData('gender', v)}>
                                        <SelectTrigger className="rounded-xl border-gray-200 h-12">
                                            <SelectValue placeholder="Select Gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#1a1d56]">Country</label>
                                    <Input
                                        placeholder="e.g. United Kingdom"
                                        value={data.country}
                                        onChange={e => setData('country', e.target.value)}
                                        className="rounded-xl border-gray-200 h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#1a1d56]">City</label>
                                    <Input
                                        placeholder="e.g. London"
                                        value={data.city}
                                        onChange={e => setData('city', e.target.value)}
                                        className="rounded-xl border-gray-200 h-12"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#1a1d56]">Timezone</label>
                                <Input
                                    value={data.timezone}
                                    disabled
                                    className="rounded-xl border-gray-200 bg-gray-50 text-gray-400 h-12"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Subjects */}
                    {step === 3 && (
                        <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500">
                            <div className="text-center md:text-left">
                                <h2 className="font-['Nunito'] text-2xl font-bold text-[#1a1d56]">Your Interests</h2>
                                <p className="text-gray-500 text-sm sm:text-base">Which subjects interest you?</p>
                            </div>

                            {isLoadingSubjects ? (
                                <div className="flex flex-col items-center py-12 gap-3">
                                    <Spinner className="text-[#338078] w-8 h-8" />
                                    <p className="text-gray-400">Loading subjects...</p>
                                </div>
                            ) : (
                                <div className="space-y-4 pb-4">
                                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={comboboxOpen}
                                                className="w-full justify-between h-12 px-4 border border-gray-200 rounded-xl text-[#000000] text-[16px] font-normal hover:bg-white hover:text-[#000000] focus:ring-[#338078]"
                                            >
                                                {data.subjects.length > 0 
                                                    ? `${data.subjects.length} subject${data.subjects.length > 1 ? 's' : ''} selected` 
                                                    : "Select subjects you are interested in..."}
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
                                                                        onSelect={() => toggleSubject(subject.id)}
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
                                                            onClick={() => toggleSubject(subId)}
                                                            className="text-[#338078] hover:text-red-500 transition-colors focus:outline-none"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Goals */}
                    {step === 4 && (
                        <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500">
                            <div className="text-center md:text-left">
                                <h2 className="font-['Nunito'] text-2xl font-bold text-[#1a1d56]">Goals & Availability</h2>
                                <p className="text-gray-500 text-sm sm:text-base">Final step! Tell us what you hope to achieve.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#1a1d56]">Learning Goals</label>
                                    <Textarea
                                        placeholder="e.g. I want to improve my Tajweed for the last 10 Surahs..."
                                        value={data.learning_goal_description}
                                        onChange={e => setData('learning_goal_description', e.target.value)}
                                        className="rounded-2xl border-gray-200 min-h-[120px] focus:border-[#338078] text-sm sm:text-base"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#1a1d56]">Preferred Availability</label>
                                    <Select value={data.availability_type} onValueChange={v => setData('availability_type', v)}>
                                        <SelectTrigger className="rounded-xl border-gray-200 h-12">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="flexible">Flexible (Whenever teachers are free)</SelectItem>
                                            <SelectItem value="fixed">Fixed (Specific days & times)</SelectItem>
                                            <SelectItem value="both">Both</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Fixed Footer */}
                <div className="p-6 md:px-12 md:py-8 border-t border-gray-50 shrink-0 bg-white">
                    <div className="flex flex-col md:flex-row gap-3">
                        {step > 1 && (
                            <button
                                onClick={prevStep}
                                className="flex-1 py-3 sm:py-4 px-8 rounded-full border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-all order-2 md:order-1 text-sm sm:text-base"
                            >
                                Back
                            </button>
                        )}

                        {step < 4 ? (
                            <button
                                onClick={nextStep}
                                className="flex-[2] py-3 sm:py-4 px-8 rounded-full bg-[#338078] font-bold text-white shadow-lg shadow-[#338078]/20 hover:bg-[#2a6b64] transition-all order-1 md:order-2 text-sm sm:text-base"
                            >
                                Continue
                            </button>
                        ) : (
                            <button
                                onClick={handleComplete}
                                disabled={processing}
                                className="flex-[2] py-3 sm:py-4 px-8 rounded-full bg-[#338078] font-bold text-white shadow-lg shadow-[#338078]/20 hover:bg-[#2a6b64] transition-all disabled:opacity-50 order-1 md:order-2 text-sm sm:text-base"
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner className="w-4 h-4" />
                                        <span>Saving...</span>
                                    </div>
                                ) : 'Complete Onboarding'}
                            </button>
                        )}

                        {step === 1 && (
                            <button
                                onClick={handleSkip}
                                className="py-2 px-8 font-['Inter'] text-sm text-gray-400 hover:text-gray-600 transition-all underline underline-offset-4 order-3 text-center"
                            >
                                Skip for now
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
