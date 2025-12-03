import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Country, City } from 'country-state-city';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import AdminLayout from '@/layouts/AdminLayout';

interface Subject {
    id: number;
    name: string;
}

interface Props {
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

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIME_SLOTS = [
    { value: '06:00', label: '6:00 AM' },
    { value: '07:00', label: '7:00 AM' },
    { value: '08:00', label: '8:00 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '13:00', label: '1:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '17:00', label: '5:00 PM' },
    { value: '18:00', label: '6:00 PM' },
    { value: '19:00', label: '7:00 PM' },
    { value: '20:00', label: '8:00 PM' },
    { value: '21:00', label: '9:00 PM' },
    { value: '22:00', label: '10:00 PM' },
];

const NGN_MIN_RATE = 3000;
const NGN_MAX_RATE = 5000;

export default function TeacherCreate({ subjects }: Props) {
    const [currentStep, setCurrentStep] = useState(1);
    const [experienceSelection, setExperienceSelection] = useState<string>('');
    const [qualificationSelection, setQualificationSelection] = useState<string>('');
    const [bioLength, setBioLength] = useState(0);

    // Country/City state
    const [countries] = useState(Country.getAllCountries());
    const [cities, setCities] = useState<any[]>([]);
    const [selectedCountryCode, setSelectedCountryCode] = useState<string>('');
    const [countryComboboxOpen, setCountryComboboxOpen] = useState(false);
    const [cityComboboxOpen, setCityComboboxOpen] = useState(false);
    const [countrySearchValue, setCountrySearchValue] = useState('');
    const [citySearchValue, setCitySearchValue] = useState('');

    // Earnings State
    const { currency, setCurrency, config, convert, loading } = useCurrency();
    const [rateError, setRateError] = useState<string | null>(null);
    const [banks, setBanks] = useState<any[]>([]);
    const [bankComboboxOpen, setBankComboboxOpen] = useState(false);

    // Calculate dynamic limits based on currency
    const minRate = currency === 'NGN' ? NGN_MIN_RATE : convert(NGN_MIN_RATE, 'NGN', 'USD');
    const maxRate = currency === 'NGN' ? NGN_MAX_RATE : convert(NGN_MAX_RATE, 'NGN', 'USD');

    // Password visibility state
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        // Step 1: Personal Information
        name: '',
        email: '',
        phone: '',
        country: '',
        city: '',

        // Step 2: Teaching Details
        experience_years: '',
        qualification_level: '',
        bio: '',

        // Step 3: Subjects & Availability
        subject_ids: [] as number[],
        teaching_mode: 'full-time' as 'full-time' | 'part-time',
        teaching_type: '' as string,
        availability: [] as { day: string, start: string, end: string }[],

        // Step 4: Earnings & Payments
        preferred_currency: currency,
        hourly_rate: '',
        payment_type: '',
        bank_name: '',
        bank_code: '',
        account_number: '',
        account_name: '',
        routing_number: '',
        paypal_email: '',
        stripe_account_id: '',

        // Step 5: Account Setup
        password: '',
        password_confirmation: '',
    });

    // Load cities when country changes
    useEffect(() => {
        if (selectedCountryCode) {
            const countryCities = City.getCitiesOfCountry(selectedCountryCode);
            setCities(countryCities || []);
        } else {
            setCities([]);
        }
    }, [selectedCountryCode]);

    // Fetch banks
    useEffect(() => {
        fetch('https://api.paystack.co/bank')
            .then(res => res.json())
            .then(data => {
                if (data.status) {
                    setBanks(data.data);
                }
            })
            .catch(err => console.error('Failed to fetch banks', err));
    }, []);

    // Sync context currency with form data
    useEffect(() => {
        if (data.preferred_currency && data.preferred_currency !== currency) {
            setCurrency(data.preferred_currency as any);
        }
    }, []);

    // Realtime validation for hourly rate
    useEffect(() => {
        if (!data.hourly_rate || loading) {
            setRateError(null);
            return;
        }

        const rate = Number(data.hourly_rate);
        // Round limits for display/check to 2 decimal places if USD to avoid floating point weirdness
        const checkMin = Number(minRate.toFixed(2));
        const checkMax = Number(maxRate.toFixed(2));

        if (rate < checkMin) {
            setRateError(`Minimum rate is ${config.symbol}${checkMin}`);
        } else if (rate > checkMax) {
            setRateError(`Maximum rate is ${config.symbol}${checkMax}`);
        } else {
            setRateError(null);
        }
    }, [data.hourly_rate, config, minRate, maxRate, loading]);

    const handleCurrencyChange = (newCurrency: 'NGN' | 'USD') => {
        const oldCurrency = currency;

        // Convert the hourly rate if there's an existing value
        if (data.hourly_rate && !loading) {
            const currentRate = Number(data.hourly_rate);
            if (!isNaN(currentRate) && currentRate > 0) {
                const convertedRate = convert(currentRate, oldCurrency, newCurrency);
                setData('hourly_rate', convertedRate.toFixed(2));
            }
        }

        setCurrency(newCurrency);
        setData('preferred_currency', newCurrency);
        // Clear any existing backend errors when currency changes
        clearErrors('hourly_rate');
    };

    const handleBankChange = (code: string) => {
        const bank = banks.find(b => b.code === code);
        if (bank) {
            setData(data => ({
                ...data,
                bank_code: code,
                bank_name: bank.name
            }));
        }
    };

    const handleCountryChange = (countryName: string, countryCode: string) => {
        setSelectedCountryCode(countryCode);
        setData('country', countryName);
        setData('city', ''); // Reset city when country changes
        setCountrySearchValue('');
        setCountryComboboxOpen(false);
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
            const nextIndex = (timeIndex + 1) % TIME_SLOTS.length;
            currentAvailability[index].end = TIME_SLOTS[nextIndex].value;

            setData('availability', currentAvailability);
        }
    };

    const handleSubjectToggle = (subjectId: number) => {
        const currentSubjects = [...data.subject_ids];
        const index = currentSubjects.indexOf(subjectId);

        if (index > -1) {
            currentSubjects.splice(index, 1);
        } else {
            currentSubjects.push(subjectId);
        }

        setData('subject_ids', currentSubjects);
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
            setData('experience_years', '');
        }
    };

    const handleQualificationSelect = (value: string) => {
        setQualificationSelection(value);
        if (value !== "other") {
            setData('qualification_level', value);
        } else {
            setData('qualification_level', '');
        }
    };

    const validateStep1 = () => {
        if (!data.name) {
            toast.error('Please enter full name');
            return false;
        }
        if (!data.email) {
            toast.error('Please enter email address');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        // Step 2: Experience and qualification are optional, bio is optional
        return true; // No required fields
    };

    const validateStep3 = () => {
        if (data.subject_ids.length === 0) {
            toast.error('Please select at least one subject');
            return false;
        }
        if (!data.teaching_type) {
            toast.error('Please select teaching type');
            return false;
        }
        return true;
    };

    const validateStep4 = () => {
        if (!data.hourly_rate) {
            toast.error('Please enter hourly rate');
            return false;
        }

        if (rateError) {
            toast.error(rateError);
            return false;
        }

        if (!data.payment_type) {
            toast.error('Please select a payment method');
            return false;
        }

        if (data.payment_type === 'bank_transfer' || data.payment_type === 'paystack') {
            if (!data.bank_code) {
                toast.error('Please select a bank');
                return false;
            }
            if (!data.account_number) {
                toast.error('Please enter account number');
                return false;
            }
            if (!data.account_name) {
                toast.error('Please enter account name');
                return false;
            }
        }

        if (data.payment_type === 'paypal' && !data.paypal_email) {
            toast.error('Please enter PayPal email');
            return false;
        }

        if (data.payment_type === 'stripe' && !data.stripe_account_id) {
            toast.error('Please enter Stripe Account ID');
            return false;
        }

        return true;
    };

    const validateStep5 = () => {
        if (!data.password) {
            toast.error('Please enter a password');
            return false;
        }
        if (data.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return false;
        }
        if (data.password !== data.password_confirmation) {
            toast.error('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (currentStep === 1 && !validateStep1()) return;
        if (currentStep === 2 && !validateStep2()) return;
        if (currentStep === 3 && !validateStep3()) return;
        if (currentStep === 4 && !validateStep4()) return;
        setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep3()) return;

        post('/admin/teachers', {
            onSuccess: () => {
                toast.success('Teacher created successfully!');
            },
            onError: () => {
                toast.error('Failed to create teacher. Please check the form.');
            },
        });
    };

    return (
        <>
            <Head title="Create New Teacher" />

            <div className="min-h-screen py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[730px] w-full mx-auto bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-10">
                    {/* Progress Bar */}
                    <div className="flex items-center justify-between mb-6 sm:mb-8 overflow-x-auto">
                        <div className="flex items-center">
                            <div className={`flex items-center justify-center w-[28px] h-[28px] sm:w-[34px] sm:h-[34px] rounded-full ${currentStep >= 1 ? 'bg-[#338078] text-white' : 'bg-[#EFF0F6] text-[#6B7280]'} font-medium text-[14px] sm:text-[16px]`} style={{ fontFamily: 'DM Sans' }}>
                                1
                            </div>
                            <div className={`w-[30px] sm:w-[50px] h-[6px] rounded-full ml-[6px] sm:ml-[10px] ${currentStep >= 2 ? 'bg-[#338078]' : 'bg-[#EFF0F6]'}`}></div>
                        </div>
                        <div className="flex items-center">
                            <div className={`flex items-center justify-center w-[28px] h-[28px] sm:w-[34px] sm:h-[34px] rounded-full ${currentStep >= 2 ? 'bg-[#338078] text-white' : 'bg-[#EFF0F6] text-[#6B7280]'} font-medium text-[14px] sm:text-[16px]`} style={{ fontFamily: 'DM Sans' }}>
                                2
                            </div>
                            <div className={`w-[30px] sm:w-[50px] h-[6px] rounded-full ml-[6px] sm:ml-[10px] ${currentStep >= 3 ? 'bg-[#338078]' : 'bg-[#EFF0F6]'}`}></div>
                        </div>
                        <div className="flex items-center">
                            <div className={`flex items-center justify-center w-[28px] h-[28px] sm:w-[34px] sm:h-[34px] rounded-full ${currentStep >= 3 ? 'bg-[#338078] text-white' : 'bg-[#EFF0F6] text-[#6B7280]'} font-medium text-[14px] sm:text-[16px]`} style={{ fontFamily: 'DM Sans' }}>
                                3
                            </div>
                            <div className={`w-[30px] sm:w-[50px] h-[6px] rounded-full ml-[6px] sm:ml-[10px] ${currentStep >= 4 ? 'bg-[#338078]' : 'bg-[#EFF0F6]'}`}></div>
                        </div>
                        <div className="flex items-center">
                            <div className={`flex items-center justify-center w-[28px] h-[28px] sm:w-[34px] sm:h-[34px] rounded-full ${currentStep >= 4 ? 'bg-[#338078] text-white' : 'bg-[#EFF0F6] text-[#6B7280]'} font-medium text-[14px] sm:text-[16px]`} style={{ fontFamily: 'DM Sans' }}>
                                4
                            </div>
                            <div className={`w-[30px] sm:w-[50px] h-[6px] rounded-full ml-[6px] sm:ml-[10px] ${currentStep >= 5 ? 'bg-[#338078]' : 'bg-[#EFF0F6]'}`}></div>
                        </div>
                        <div className={`flex items-center justify-center w-[28px] h-[28px] sm:w-[34px] sm:h-[34px] rounded-full ${currentStep >= 5 ? 'bg-[#338078] text-white' : 'bg-[#EFF0F6] text-[#6B7280]'} font-medium text-[14px] sm:text-[16px]`} style={{ fontFamily: 'DM Sans' }}>
                            5
                        </div>
                    </div>

                    <div className="border-b border-gray-200 mb-8"></div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Step 1: Personal Information */}
                        {currentStep === 1 && (
                            <div>
                                <h2 className="text-[#170F49] text-[18px] font-medium mb-3" style={{ fontFamily: 'Nunito' }}>
                                    Personal Information
                                </h2>
                                <p className="text-[#6B7280] text-[16px] font-medium mb-6" style={{ fontFamily: 'Nunito' }}>
                                    Basic contact details
                                </p>

                                <div className="space-y-7">
                                    {/* Name and Email Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                                        <div>
                                            <label htmlFor="name" className="block text-[#170F49] text-[16px] font-medium mb-4" style={{ fontFamily: 'Nunito' }}>
                                                Full Name
                                            </label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="w-full h-[48px] px-[18px] border border-[#9E9E9E] rounded-[5px] text-[#000000] text-[16px] focus:ring-[#338078]"
                                                placeholder="Enter full name"
                                            />
                                            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-[#170F49] text-[16px] font-medium mb-4" style={{ fontFamily: 'Nunito' }}>
                                                Email Address
                                            </label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="w-full h-[48px] px-[18px] border border-[#9E9E9E] rounded-[5px] text-[#000000] text-[16px] focus:ring-[#338078]"
                                                placeholder="teacher@example.com"
                                            />
                                            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                                        </div>
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label htmlFor="phone" className="block text-[#170F49] text-[16px] font-medium mb-4" style={{ fontFamily: 'Nunito' }}>
                                            Phone Number
                                        </label>
                                        <PhoneInput
                                            international
                                            defaultCountry={selectedCountryCode as any || 'NG'}
                                            value={data.phone}
                                            onChange={(value) => setData('phone', value || '')}
                                            className="w-full h-[48px] px-[18px] border border-[#9E9E9E] rounded-[5px] text-[#000000] text-[16px] focus:outline-none focus:border-[#338078] focus:ring-1 focus:ring-[#338078]"
                                            style={{ fontFamily: 'Nunito' }}
                                        />
                                        {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
                                    </div>

                                    {/* Country and City Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                                        {/* Country Field - Combobox */}
                                        <div>
                                            <label htmlFor="country" className="block text-[#170F49] text-[16px] font-medium mb-4" style={{ fontFamily: 'Nunito' }}>
                                                Country
                                            </label>
                                            <Popover open={countryComboboxOpen} onOpenChange={setCountryComboboxOpen}>
                                                <PopoverTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className={cn(
                                                            "w-full h-[48px] px-[18px] border border-[#9E9E9E] rounded-[5px] text-[16px] flex items-center justify-between focus:outline-none focus:border-[#338078] focus:ring-1 focus:ring-[#338078]",
                                                            data.country ? "text-[#000000]" : "text-[#6B7280]"
                                                        )}
                                                        style={{ fontFamily: 'Nunito' }}
                                                    >
                                                        {data.country || "Select country"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[307px] p-0" align="start">
                                                    <Command>
                                                        <CommandInput
                                                            placeholder="Search country..."
                                                            value={countrySearchValue}
                                                            onValueChange={setCountrySearchValue}
                                                        />
                                                        <CommandList>
                                                            <CommandEmpty>No country found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {countries.map((country) => (
                                                                    <CommandItem
                                                                        key={country.isoCode}
                                                                        value={country.name}
                                                                        onSelect={() => handleCountryChange(country.name, country.isoCode)}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                data.country === country.name ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {country.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            {errors.country && <p className="mt-2 text-sm text-red-600">{errors.country}</p>}
                                        </div>

                                        {/* City Field - Combobox or Text Input */}
                                        <div>
                                            <label htmlFor="city" className="block text-[#170F49] text-[16px] font-medium mb-4" style={{ fontFamily: 'Nunito' }}>
                                                City
                                            </label>
                                            {cities.length > 0 ? (
                                                <Popover open={cityComboboxOpen} onOpenChange={setCityComboboxOpen}>
                                                    <PopoverTrigger asChild>
                                                        <button
                                                            type="button"
                                                            disabled={!data.country}
                                                            className={cn(
                                                                "w-full h-[48px] px-[18px] border border-[#9E9E9E] rounded-[5px] text-[16px] flex items-center justify-between focus:outline-none focus:border-[#338078] focus:ring-1 focus:ring-[#338078]",
                                                                data.city ? "text-[#000000]" : "text-[#6B7280]",
                                                                !data.country && "bg-gray-100 cursor-not-allowed"
                                                            )}
                                                            style={{ fontFamily: 'Nunito' }}
                                                        >
                                                            {data.city || "Select city"}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[307px] p-0" align="start">
                                                        <Command>
                                                            <CommandInput
                                                                placeholder="Search city..."
                                                                value={citySearchValue}
                                                                onValueChange={setCitySearchValue}
                                                            />
                                                            <CommandList>
                                                                <CommandEmpty>No city found.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {cities.map((city) => (
                                                                        <CommandItem
                                                                            key={city.name}
                                                                            value={city.name}
                                                                            onSelect={(currentValue) => {
                                                                                setData('city', currentValue);
                                                                                setCitySearchValue('');
                                                                                setCityComboboxOpen(false);
                                                                            }}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4",
                                                                                    data.city === city.name ? "opacity-100" : "opacity-0"
                                                                                )}
                                                                            />
                                                                            {city.name}
                                                                        </CommandItem>
                                                                    ))}
                                                                    {/* Add "Other" option for manual entry */}
                                                                    <CommandItem
                                                                        value="__other__"
                                                                        onSelect={() => {
                                                                            setData('city', '');
                                                                            setCityComboboxOpen(false);
                                                                        }}
                                                                        className="border-t"
                                                                    >
                                                                        <span className="italic text-gray-500">Other (type manually)</span>
                                                                    </CommandItem>
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                            ) : (
                                                <Input
                                                    id="city"
                                                    type="text"
                                                    value={data.city}
                                                    onChange={(e) => setData('city', e.target.value)}
                                                    disabled={!data.country}
                                                    className={cn(
                                                        "w-full h-[48px] px-[18px] border border-[#9E9E9E] rounded-[5px] text-[#000000] text-[16px] focus:ring-[#338078]",
                                                        !data.country && "bg-gray-100 cursor-not-allowed"
                                                    )}
                                                    placeholder={data.country ? "Enter city name" : "Select a country first"}
                                                />
                                            )}
                                            {errors.city && <p className="mt-2 text-sm text-red-600">{errors.city}</p>}
                                            {data.country && cities.length === 0 && (
                                                <p className="mt-1 text-xs text-gray-500">No cities available for this country. Please enter manually.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Teaching Details */}
                        {currentStep === 2 && (
                            <div>
                                <h2 className="text-[#170F49] text-[18px] font-medium mb-3" style={{ fontFamily: 'Nunito' }}>
                                    Teaching Details
                                </h2>
                                <p className="text-[#6B7280] text-[16px] font-medium mb-6" style={{ fontFamily: 'Nunito' }}>
                                    Your teaching experience and background
                                </p>

                                <div className="space-y-7">
                                    {/* Years of Experience and Qualification Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
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
                                            Share your teaching experience and passion for education
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
                        )}

                        {/* Step 3: Subjects & Availability */}
                        {currentStep === 3 && (
                            <div>
                                <h2 className="text-[#170F49] text-[18px] font-medium mb-3" style={{ fontFamily: 'Nunito' }}>
                                    Subjects & Availability
                                </h2>
                                <p className="text-[#6B7280] text-[16px] font-medium mb-6" style={{ fontFamily: 'Nunito' }}>
                                    What subjects do you teach and when are you available?
                                </p>

                                <div className="space-y-8">
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
                                                        checked={data.subject_ids.includes(subject.id)}
                                                        onChange={() => handleSubjectToggle(subject.id)}
                                                        className="w-5 h-5 rounded border-[#9E9E9E] text-[#338078] focus:ring-[#338078]"
                                                    />
                                                    <span className="text-[#170F49] text-[16px]" style={{ fontFamily: 'Nunito' }}>
                                                        {subject.name}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.subject_ids && <p className="mt-2 text-sm text-red-600">{errors.subject_ids}</p>}
                                    </div>

                                    {/* Teaching Mode */}
                                    <div>
                                        <label className="block text-[#170F49] text-[16px] font-medium mb-4" style={{ fontFamily: 'Nunito' }}>
                                            Teaching Mode
                                        </label>
                                        <div className="flex gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="teaching_mode"
                                                    value="full-time"
                                                    checked={data.teaching_mode === 'full-time'}
                                                    onChange={(e) => setData('teaching_mode', e.target.value as 'full-time' | 'part-time')}
                                                    className="w-5 h-5 border-[#9E9E9E] text-[#338078] focus:ring-[#338078]"
                                                />
                                                <span className="text-[#170F49] text-[16px]" style={{ fontFamily: 'Nunito' }}>Full Time</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="teaching_mode"
                                                    value="part-time"
                                                    checked={data.teaching_mode === 'part-time'}
                                                    onChange={(e) => setData('teaching_mode', e.target.value as 'full-time' | 'part-time')}
                                                    className="w-5 h-5 border-[#9E9E9E] text-[#338078] focus:ring-[#338078]"
                                                />
                                                <span className="text-[#170F49] text-[16px]" style={{ fontFamily: 'Nunito' }}>Part Time</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Teaching Type */}
                                    <div>
                                        <label className="block text-[#170F49] text-[16px] font-medium mb-4" style={{ fontFamily: 'Nunito' }}>
                                            Teaching Type
                                        </label>
                                        <Select
                                            value={data.teaching_type}
                                            onValueChange={(value) => setData('teaching_type', value)}
                                        >
                                            <SelectTrigger className="w-full h-[48px] px-[18px] border border-[#9E9E9E] rounded-[5px] text-[#000000] text-[16px] focus:ring-[#338078]">
                                                <SelectValue placeholder="Select teaching type..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="online">Online</SelectItem>
                                                <SelectItem value="in-person">In-Person</SelectItem>
                                                <SelectItem value="both">Both</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.teaching_type && <p className="mt-2 text-sm text-red-600">{errors.teaching_type}</p>}
                                    </div>

                                    {/* Availability Schedule */}
                                    <div>
                                        <label className="block text-[#170F49] text-[16px] font-medium mb-4" style={{ fontFamily: 'Nunito' }}>
                                            Availability Schedule
                                        </label>
                                        <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                                            {DAYS_OF_WEEK.map((day) => {
                                                const dayAvailability = data.availability.find((a: any) => a.day.toLowerCase() === day.toLowerCase());
                                                const isSelected = !!dayAvailability;

                                                return (
                                                    <div key={day} className="flex items-center justify-between p-4 border-b border-[#E5E7EB] last:border-0 hover:bg-gray-50">
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => handleDayToggle(day)}
                                                                className="w-5 h-5 rounded border-[#9E9E9E] text-[#338078] focus:ring-[#338078]"
                                                            />
                                                            <span className="text-[#170F49] text-[16px] font-medium" style={{ fontFamily: 'Nunito' }}>{day}</span>
                                                        </div>

                                                        {isSelected && (
                                                            <div className="flex items-center gap-2">
                                                                <Select
                                                                    value={dayAvailability.start}
                                                                    onValueChange={(value) => updateTime(day, 'start', value)}
                                                                >
                                                                    <SelectTrigger className="w-[110px] h-[36px] border border-[#E5E7EB] rounded text-[14px]">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {TIME_SLOTS.map((time) => (
                                                                            <SelectItem key={`start-${time.value}`} value={time.value}>
                                                                                {time.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <span className="text-gray-400">-</span>
                                                                <div className="w-[110px] h-[36px] flex items-center justify-center bg-gray-50 border border-[#E5E7EB] rounded text-[14px] text-gray-500">
                                                                    {TIME_SLOTS.find(t => t.value === dayAvailability.end)?.label || dayAvailability.end}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Earnings & Payments */}
                        {currentStep === 4 && (
                            <div>
                                <h2 className="text-[#170F49] text-[18px] font-medium mb-3" style={{ fontFamily: 'Nunito' }}>
                                    Payment & Earnings
                                </h2>
                                <p className="text-[#6B7280] text-[16px] font-medium mb-6" style={{ fontFamily: 'Nunito' }}>
                                    Set Your Rate & Payment Method
                                </p>

                                {/* Preferred Currency */}
                                <div className="mb-8">
                                    <label className="block text-[#170F49] text-[16px] font-medium mb-4" style={{ fontFamily: 'Nunito' }}>
                                        Preferred Currency
                                    </label>
                                    <div className="flex gap-8">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${currency === 'NGN' ? 'border-[#338078] bg-[#338078]' : 'border-[#9E9E9E]'}`}>
                                                {currency === 'NGN' && (
                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                            <input
                                                type="radio"
                                                name="preferred_currency"
                                                value="NGN"
                                                checked={currency === 'NGN'}
                                                onChange={() => handleCurrencyChange('NGN')}
                                                className="hidden"
                                            />
                                            <span className="text-[#6B7280] text-[16px]" style={{ fontFamily: 'Nunito' }}>Naira</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${currency === 'USD' ? 'border-[#338078] bg-[#338078]' : 'border-[#9E9E9E]'}`}>
                                                {currency === 'USD' && (
                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                            <input
                                                type="radio"
                                                name="preferred_currency"
                                                value="USD"
                                                checked={currency === 'USD'}
                                                onChange={() => handleCurrencyChange('USD')}
                                                className="hidden"
                                            />
                                            <span className="text-[#6B7280] text-[16px]" style={{ fontFamily: 'Nunito' }}>Dollar</span>
                                        </label>
                                    </div>
                                    {errors.preferred_currency && <p className="mt-2 text-sm text-red-600">{errors.preferred_currency}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    {/* Hourly Rate */}
                                    <div>
                                        <label className="block text-[#170F49] text-[16px] font-medium mb-2" style={{ fontFamily: 'Nunito' }}>
                                            Minimum & Maximum Hourly Rate
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] font-medium">
                                                {config.symbol}
                                            </span>
                                            <input
                                                type="number"
                                                value={data.hourly_rate}
                                                onChange={(e) => setData('hourly_rate', e.target.value)}
                                                placeholder="Input hourly rate"
                                                className="w-full h-[48px] pl-10 pr-[18px] border border-[#9E9E9E] rounded-[5px] text-[#000000] text-[16px] focus:ring-[#338078] focus:border-[#338078] outline-none"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Range: {config.symbol}{minRate.toFixed(0)} - {config.symbol}{maxRate.toFixed(0)}
                                        </p>
                                        {(rateError || errors.hourly_rate) && (
                                            <p className="mt-2 text-sm text-red-600">{rateError || errors.hourly_rate}</p>
                                        )}
                                    </div>

                                    {/* Payment Method */}
                                    <div>
                                        <label className="block text-[#170F49] text-[16px] font-medium mb-2" style={{ fontFamily: 'Nunito' }}>
                                            Payment Method
                                        </label>
                                        <Select
                                            value={data.payment_type}
                                            onValueChange={(val) => setData('payment_type', val)}
                                        >
                                            <SelectTrigger className="w-full h-[48px] px-[18px] border border-[#9E9E9E] rounded-[5px] text-[#000000] text-[16px] focus:ring-[#338078]">
                                                <SelectValue placeholder="Select payment method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="paystack">Paystack</SelectItem>
                                                <SelectItem value="paypal">PayPal</SelectItem>
                                                <SelectItem value="stripe">Stripe</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.payment_type && <p className="mt-2 text-sm text-red-600">{errors.payment_type}</p>}
                                    </div>
                                </div>

                                {/* Dynamic Payment Fields */}
                                {(data.payment_type === 'bank_transfer' || data.payment_type === 'paystack') && (
                                    <div className="grid grid-cols-1 gap-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                                        <h3 className="text-[#170F49] font-medium">
                                            {data.payment_type === 'paystack' ? 'Paystack Bank Details' : 'Bank Details'}
                                        </h3>
                                        <div>
                                            <label className="block text-[#170F49] text-[14px] mb-1">Bank Name</label>
                                            <Popover open={bankComboboxOpen} onOpenChange={setBankComboboxOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={bankComboboxOpen}
                                                        className="w-full justify-between h-[42px] px-[14px] border-[#9E9E9E] rounded-[5px] text-[#000000] text-[14px] font-normal hover:bg-transparent"
                                                    >
                                                        {data.bank_code
                                                            ? banks.find((bank) => bank.code === data.bank_code)?.name
                                                            : "Select Bank..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[400px] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search bank..." />
                                                        <CommandList>
                                                            <CommandEmpty>No bank found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {banks.map((bank) => (
                                                                    <CommandItem
                                                                        key={bank.id}
                                                                        value={bank.name}
                                                                        onSelect={() => {
                                                                            handleBankChange(bank.code);
                                                                            setBankComboboxOpen(false);
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                data.bank_code === bank.code
                                                                                    ? "opacity-100"
                                                                                    : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {bank.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            {errors.bank_name && <p className="mt-1 text-sm text-red-600">{errors.bank_name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-[#170F49] text-[14px] mb-1">Bank Code</label>
                                            <input
                                                type="text"
                                                value={data.bank_code}
                                                readOnly
                                                className="w-full h-[42px] px-[14px] border border-[#9E9E9E] rounded-[5px] bg-gray-100 text-gray-500 cursor-not-allowed"
                                                placeholder="Auto-generated"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[#170F49] text-[14px] mb-1">Account Number</label>
                                            <input
                                                type="text"
                                                value={data.account_number}
                                                onChange={(e) => setData('account_number', e.target.value)}
                                                className="w-full h-[42px] px-[14px] border border-[#9E9E9E] rounded-[5px]"
                                                placeholder="Enter account number"
                                            />
                                            {errors.account_number && <p className="mt-1 text-sm text-red-600">{errors.account_number}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-[#170F49] text-[14px] mb-1">Account Name</label>
                                            <input
                                                type="text"
                                                value={data.account_name}
                                                onChange={(e) => setData('account_name', e.target.value)}
                                                className="w-full h-[42px] px-[14px] border border-[#9E9E9E] rounded-[5px]"
                                                placeholder="Enter account name"
                                            />
                                            {errors.account_name && <p className="mt-1 text-sm text-red-600">{errors.account_name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-[#170F49] text-[14px] mb-1">Routing Number (Optional)</label>
                                            <input
                                                type="text"
                                                value={data.routing_number}
                                                onChange={(e) => setData('routing_number', e.target.value)}
                                                className="w-full h-[42px] px-[14px] border border-[#9E9E9E] rounded-[5px]"
                                                placeholder="Enter routing number"
                                            />
                                        </div>
                                    </div>
                                )}

                                {data.payment_type === 'paypal' && (
                                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                                        <h3 className="text-[#170F49] font-medium mb-4">PayPal Details</h3>
                                        <div>
                                            <label className="block text-[#170F49] text-[14px] mb-1">PayPal Email</label>
                                            <input
                                                type="email"
                                                value={data.paypal_email}
                                                onChange={(e) => setData('paypal_email', e.target.value)}
                                                className="w-full h-[42px] px-[14px] border border-[#9E9E9E] rounded-[5px]"
                                                placeholder="Enter PayPal email"
                                            />
                                            {errors.paypal_email && <p className="mt-1 text-sm text-red-600">{errors.paypal_email}</p>}
                                        </div>
                                    </div>
                                )}

                                {data.payment_type === 'stripe' && (
                                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                                        <h3 className="text-[#170F49] font-medium mb-4">Stripe Details</h3>
                                        <div>
                                            <label className="block text-[#170F49] text-[14px] mb-1">Stripe Account ID</label>
                                            <input
                                                type="text"
                                                value={data.stripe_account_id}
                                                onChange={(e) => setData('stripe_account_id', e.target.value)}
                                                className="w-full h-[42px] px-[14px] border border-[#9E9E9E] rounded-[5px]"
                                                placeholder="Enter Stripe Account ID"
                                            />
                                            {errors.stripe_account_id && <p className="mt-1 text-sm text-red-600">{errors.stripe_account_id}</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 5: Account Setup */}
                        {currentStep === 5 && (
                            <div>
                                <h2 className="text-[#170F49] text-[18px] font-medium mb-3" style={{ fontFamily: 'Nunito' }}>
                                    Account Setup
                                </h2>
                                <p className="text-[#6B7280] text-[16px] font-medium mb-6" style={{ fontFamily: 'Nunito' }}>
                                    Create login credentials
                                </p>

                                <div className="space-y-7">
                                    <div>
                                        <label htmlFor="password" className="block text-[#170F49] text-[16px] font-medium mb-4" style={{ fontFamily: 'Nunito' }}>
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className="w-full h-[48px] px-[18px] pr-12 border border-[#9E9E9E] rounded-[5px] text-[#000000] text-[16px] focus:ring-[#338078]"
                                                placeholder="Enter password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPassword ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="password_confirmation" className="block text-[#170F49] text-[16px] font-medium mb-4" style={{ fontFamily: 'Nunito' }}>
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <Input
                                                id="password_confirmation"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className="w-full h-[48px] px-[18px] pr-12 border border-[#9E9E9E] rounded-[5px] text-[#000000] text-[16px] focus:ring-[#338078]"
                                                placeholder="Re-enter password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showConfirmPassword ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        {errors.password_confirmation && <p className="mt-2 text-sm text-red-600">{errors.password_confirmation}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-6">
                            {currentStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="text-[#338078] px-4 sm:px-6 py-2.5 sm:py-3 rounded-[56px] text-[14px] sm:text-[16px] font-medium hover:bg-gray-100 transition-colors w-full sm:w-auto"
                                    style={{ fontFamily: 'Nunito' }}
                                >
                                    Back
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => router.visit('/admin/teachers')}
                                    className="text-[#338078] px-4 sm:px-6 py-2.5 sm:py-3 rounded-[56px] text-[14px] sm:text-[16px] font-medium hover:bg-gray-100 transition-colors w-full sm:w-auto"
                                    style={{ fontFamily: 'Nunito' }}
                                >
                                    Cancel
                                </button>
                            )}

                            {currentStep < 5 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="bg-[#338078] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-[56px] text-[14px] sm:text-[16px] font-medium hover:bg-[#2a6962] transition-colors cursor-pointer w-full sm:w-auto"
                                    style={{ fontFamily: 'Nunito' }}
                                >
                                    Continue
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[#338078] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-[56px] text-[14px] sm:text-[16px] font-medium hover:bg-[#2a6962] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer w-full sm:w-auto"
                                    style={{ fontFamily: 'Nunito' }}
                                >
                                    {processing ? 'Creating...' : 'Create Teacher'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

TeacherCreate.layout = (page: React.ReactNode) => <AdminLayout children={page} hideRightSidebar={true} />;

