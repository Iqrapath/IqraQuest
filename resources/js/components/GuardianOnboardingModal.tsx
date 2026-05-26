import { Icon } from '@iconify/react';
import { router, useForm } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import AppLogoIcon from './app-logo-icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, X } from 'lucide-react';

interface Subject {
    id: number;
    name: string;
    icon?: string;
    category?: string | null;
}

interface GuardianOnboardingModalProps {
    isOpen: boolean;
    onComplete: () => void;
    onSkip: () => void;
    initialStep?: number;
}

const LEARNING_TIMES = [
    { id: 'morning', label: 'Morning' },
    { id: 'afternoon', label: 'Afternoon' },
    { id: 'evening', label: 'Evening' },
    { id: 'weekend', label: 'Weekend' },
];

export default function GuardianOnboardingModal({ isOpen, onComplete, onSkip, initialStep = 1 }: GuardianOnboardingModalProps) {
    const [step, setStep] = useState(initialStep);

    useEffect(() => {
        if (isOpen) {
            setStep(initialStep);
        }
    }, [isOpen, initialStep]);
        const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({});
    const [comboboxOpens, setComboboxOpens] = useState<{ [key: number]: boolean }>({});

    const setComboboxOpenForChild = (index: number, open: boolean) => {
        setComboboxOpens(prev => ({
            ...prev,
            [index]: open
        }));
    };

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

    const togglePasswordVisibility = (index: number) => {
        setShowPasswords(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const { data, setData, post, processing, errors } = useForm({
        // Step 1: Guardian Info
        phone: '',
        city: '',
        country: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        bio: '',
        // Step 2: Children Info
        children: [
            {
                name: '',
                email: '',
                password: '',
                age: '',
                gender: '',
                subjects: [] as number[],
                learning_times: [] as string[]
            }
        ]
    });

    useEffect(() => {
        if (isOpen && subjects.length === 0) {
            fetchSubjects();
        }
    }, [isOpen]);

    const fetchSubjects = async () => {
        setIsLoadingSubjects(true);
        try {
            const response = await fetch('/guardian/onboarding/subjects');
            const result = await response.json();
            setSubjects(result);
        } catch (error) {
            toast.error('Failed to load subjects.');
        } finally {
            setIsLoadingSubjects(false);
        }
    };

    const addChild = () => {
        setData('children', [
            ...data.children,
            { name: '', email: '', password: '', age: '', gender: '', subjects: [], learning_times: [] }
        ]);
    };

    const removeChild = (index: number) => {
        if (data.children.length === 1) return;
        const newChildren = [...data.children];
        newChildren.splice(index, 1);
        setData('children', newChildren);
    };

    const updateChild = (index: number, field: string, value: any) => {
        const newChildren = [...data.children];
        (newChildren[index] as any)[field] = value;
        setData('children', newChildren);
    };

    const toggleSubject = (childIndex: number, subjectId: number) => {
        const current = [...data.children[childIndex].subjects];
        if (current.includes(subjectId)) {
            updateChild(childIndex, 'subjects', current.filter(id => id !== subjectId));
        } else {
            updateChild(childIndex, 'subjects', [...current, subjectId]);
        }
    };

    const toggleTime = (childIndex: number, timeId: string) => {
        const current = [...data.children[childIndex].learning_times];
        if (current.includes(timeId)) {
            updateChild(childIndex, 'learning_times', current.filter(id => id !== timeId));
        } else {
            updateChild(childIndex, 'learning_times', [...current, timeId]);
        }
    };

    const handleNextStep = () => {
        if (step === 1) {
            // Basic validation for step 1
            if (!data.city || !data.country) {
                toast.error('Please fill in your location details.');
                return;
            }
            setStep(2);
        }
    };

    const handleComplete = () => {
        post('/guardian/onboarding/complete', {
            onSuccess: () => {
                toast.success('Registration successful!');
                onComplete();
                router.visit('/guardian/dashboard');
            },
            onError: (err) => {
                const errorFields = Object.keys(err).map(key => {
                    // Handle array notation (children.0.name)
                    if (key.includes('.')) {
                        const parts = key.split('.');
                        if (parts[0] === 'children' && parts.length >= 3) {
                            const index = parseInt(parts[1]) + 1;
                            const field = parts[2].charAt(0).toUpperCase() + parts[2].slice(1);
                            return `Child ${index} ${field}`;
                        }
                    }
                    // Handle top level fields
                    return key.charAt(0).toUpperCase() + key.slice(1);
                });

                const uniqueFields = [...new Set(errorFields)];
                const message = uniqueFields.length > 0
                    ? `Please check the following fields: ${uniqueFields.join(', ')}`
                    : 'Please check all fields and try again.';

                toast.error(message);
            }
        });
    };

    const handleSkip = () => {
        post('/guardian/onboarding/skip', {
            onSuccess: () => onSkip()
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1d56]/40 backdrop-blur-sm p-4 overflow-hidden">
            <div className="relative flex w-full max-w-[650px] max-h-[90vh] flex-col rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">

                {/* Fixed Header */}
                <div className="p-6 md:px-12 md:pt-10 md:pb-6 border-b border-gray-50 shrink-0 bg-white">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <AppLogoIcon className="h-7 w-auto text-[#338078]" />
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Step {step} of 2</span>
                            <button
                                onClick={handleSkip}
                                className="text-gray-300 hover:text-gray-600 transition-colors"
                            >
                                <Icon icon="solar:close-circle-bold" className="w-8 h-8" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:px-12 md:py-8 scrollbar-thin scrollbar-thumb-gray-200">
                    <div className="flex flex-col gap-6">

                        {step === 1 ? (
                            <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500">
                                <div className="flex flex-col gap-2 text-center pb-4">
                                    <div className="mx-auto w-16 h-16 rounded-2xl bg-[#EDF7F6] flex items-center justify-center mb-2">
                                        <Icon icon="solar:user-id-bold" className="w-8 h-8 text-[#338078]" />
                                    </div>
                                    <h2 className="font-['Nunito'] text-2xl sm:text-3xl font-extrabold text-[#1a1d56]">
                                        Complete Your Profile
                                    </h2>
                                    <p className="font-['Inter'] text-gray-500 text-sm sm:text-base">
                                        Tell us a bit about yourself so we can personalize your experience.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-[#1a1d56]">Phone Number</label>
                                        <Input
                                            placeholder="+234..."
                                            type="tel"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className="rounded-xl border-gray-200 h-11 bg-gray-50/50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-[#1a1d56]">Timezone</label>
                                        <Input
                                            value={data.timezone}
                                            readOnly
                                            className="rounded-xl border-gray-200 h-11 bg-gray-100/50 text-gray-400"
                                        />
                                    </div>
                                    <div className="space-y-1.5 ">
                                        <label className="text-sm font-semibold text-[#1a1d56]">City</label>
                                        <Input
                                            placeholder="e.g. Lagos"
                                            value={data.city}
                                            onChange={e => setData('city', e.target.value)}
                                            className="rounded-xl border-gray-200 h-11 bg-gray-50/50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-[#1a1d56]">Country</label>
                                        <Input
                                            placeholder="e.g. Nigeria"
                                            value={data.country}
                                            onChange={e => setData('country', e.target.value)}
                                            className="rounded-xl border-gray-200 h-11 bg-gray-50/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-[#1a1d56]">About You (Bio)</label>
                                    <Textarea
                                        placeholder="Briefly describe yourself or your family's learning goals..."
                                        value={data.bio}
                                        onChange={e => setData('bio', e.target.value)}
                                        className="rounded-xl border-gray-200 min-h-[100px] bg-gray-50/50"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500">
                                <div className="flex flex-col gap-2">
                                    <h2 className="font-['Nunito'] text-2xl sm:text-3xl font-extrabold text-[#1a1d56]">
                                        Register Your Child(ren)
                                    </h2>
                                    <p className="font-['Inter'] text-gray-500 text-sm sm:text-base leading-relaxed">
                                        Add each child's details. They will have their own login credentials.
                                    </p>
                                </div>

                                {data.children.map((child, index) => (
                                    <div key={index} className="relative p-6 rounded-[24px] bg-gray-50/50 border border-gray-100 flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
                                        {data.children.length > 1 && (
                                            <button
                                                onClick={() => removeChild(index)}
                                                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <Icon icon="solar:trash-bin-minimalistic-bold" className="w-5 h-5" />
                                            </button>
                                        )}

                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#338078] text-white flex items-center justify-center font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <h3 className="font-['Nunito'] font-bold text-[#1a1d56]">Child {index + 1} Profile</h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-[#1a1d56]">Child's Name</label>
                                                <Input
                                                    placeholder="Full Name"
                                                    value={child.name}
                                                    onChange={e => updateChild(index, 'name', e.target.value)}
                                                    className="rounded-xl border-gray-200 h-11 bg-white"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-[#1a1d56]">Age</label>
                                                    <Input
                                                        type="number"
                                                        placeholder="Age"
                                                        value={child.age}
                                                        onChange={e => updateChild(index, 'age', e.target.value)}
                                                        className="rounded-xl border-gray-200 h-11 bg-white"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-[#1a1d56]">Gender</label>
                                                    <Select value={child.gender} onValueChange={v => updateChild(index, 'gender', v)}>
                                                        <SelectTrigger className="rounded-xl border-gray-200 h-11 bg-white">
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="male">Male</SelectItem>
                                                            <SelectItem value="female">Female</SelectItem>
                                                            <SelectItem value="other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-[#1a1d56]">Child's Email (Login)</label>
                                                <Input
                                                    type="email"
                                                    placeholder="child@example.com"
                                                    value={child.email}
                                                    onChange={e => updateChild(index, 'email', e.target.value)}
                                                    className="rounded-xl border-gray-200 h-11 bg-white"
                                                />
                                                {errors[`children.${index}.email`] && <p className="text-xs text-red-500">{errors[`children.${index}.email`]}</p>}
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-[#1a1d56]">Password</label>
                                                <div className="relative">
                                                    <Input
                                                        type={showPasswords[index] ? 'text' : 'password'}
                                                        placeholder="Set password"
                                                        value={child.password}
                                                        onChange={e => updateChild(index, 'password', e.target.value)}
                                                        className="rounded-xl border-gray-200 h-11 bg-white pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            togglePasswordVisibility(index);
                                                        }}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10 cursor-pointer"
                                                    >
                                                        <Icon
                                                            icon={showPasswords[index] ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                                                            className="w-5 h-5"
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-[#1a1d56]">Preferred Subjects</label>
                                            
                                            <Popover open={comboboxOpens[index] || false} onOpenChange={(open) => setComboboxOpenForChild(index, open)}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={comboboxOpens[index] || false}
                                                        className="w-full justify-between h-11 px-4 border border-gray-200 rounded-xl text-[#000000] text-[14px] font-normal hover:bg-white hover:text-[#000000] focus:ring-[#338078]"
                                                    >
                                                        {child.subjects.length > 0 
                                                            ? `${child.subjects.length} subject${child.subjects.length > 1 ? 's' : ''} selected` 
                                                            : "Select preferred subjects..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                                    <Command className="w-full">
                                                        <CommandInput placeholder="Search subjects..." className="h-11 border-none focus:ring-0" />
                                                        <CommandList className="max-h-[250px] overflow-y-auto">
                                                            <CommandEmpty>No subject found.</CommandEmpty>
                                                            {Object.entries(groupedSubjects).map(([category, categorySubjects]) => (
                                                                <CommandGroup key={category} heading={category} className="px-2 py-1.5 text-[#1a1d56] font-bold">
                                                                    {categorySubjects.map((sub) => {
                                                                        const isSelected = child.subjects.includes(sub.id);
                                                                        return (
                                                                            <CommandItem
                                                                                key={sub.id}
                                                                                value={sub.name}
                                                                                onSelect={() => toggleSubject(index, sub.id)}
                                                                                className="cursor-pointer flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-100/80 text-sm font-normal text-gray-700"
                                                                            >
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className={cn(
                                                                                        "flex h-4 w-4 items-center justify-center rounded border border-gray-300 transition-colors",
                                                                                        isSelected ? "bg-[#338078] border-[#338078] text-white" : "bg-white"
                                                                                    )}>
                                                                                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                                                                    </div>
                                                                                    <span>{sub.name}</span>
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
                                            {child.subjects.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {child.subjects.map((subId: number) => {
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
                                                                    onClick={() => toggleSubject(index, subId)}
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

                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-[#1a1d56]">Preferred Learning Time</label>
                                            <div className="flex flex-wrap gap-6">
                                                {LEARNING_TIMES.map((time) => (
                                                    <label key={time.id} className="flex items-center gap-2 cursor-pointer group">
                                                        <Checkbox
                                                            checked={child.learning_times.includes(time.id)}
                                                            onCheckedChange={() => toggleTime(index, time.id)}
                                                            className="border-gray-300 data-[state=checked]:bg-[#338078] data-[state=checked]:border-[#338078]"
                                                        />
                                                        <span className="text-sm text-gray-600 group-hover:text-[#1a1d56] transition-colors">{time.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={addChild}
                                    className="group flex flex-col items-start gap-1 p-2 transition-all"
                                >
                                    <div className="flex items-center gap-2 text-[#338078] font-bold">
                                        <div className="w-6 h-6 rounded-full bg-[#EDF7F6] flex items-center justify-center group-hover:bg-[#338078] transition-colors">
                                            <Icon icon="solar:add-circle-bold" className="w-5 h-5 text-[#338078] group-hover:text-white" />
                                        </div>
                                        <span>Add Another Child</span>
                                    </div>
                                    <p className="text-xs text-gray-400 pl-8">Create multiple child profiles</p>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fixed Footer */}
                <div className="p-6 md:px-12 md:py-8 border-t border-gray-50 shrink-0 bg-white flex gap-4">
                    {step === 2 && (
                        <button
                            onClick={() => setStep(1)}
                            className="px-8 py-4 rounded-full border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-all"
                        >
                            Back
                        </button>
                    )}

                    {step === 1 ? (
                        <button
                            onClick={handleNextStep}
                            className="flex-1 py-4 rounded-full bg-[#338078] font-bold text-white shadow-lg shadow-[#338078]/20 hover:bg-[#2a6b64] transition-all flex items-center justify-center gap-2"
                        >
                            <span>Next Step: Register Children</span>
                            <Icon icon="solar:alt-arrow-right-bold" className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleComplete}
                            disabled={processing}
                            className="flex-1 py-4 rounded-full bg-[#338078] font-bold text-white shadow-lg shadow-[#338078]/20 hover:bg-[#2a6b64] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <Spinner className="w-5 h-5" />
                                    <span>Creating Profiles...</span>
                                </>
                            ) : (
                                'Complete Onboarding'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
