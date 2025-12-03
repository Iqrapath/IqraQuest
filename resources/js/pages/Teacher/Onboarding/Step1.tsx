import React, { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import TeacherLayout from '@/layouts/TeacherLayout';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Country, City } from 'country-state-city';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
    teacher: any;
}

export default function Step1({ teacher }: Props) {
    const { auth } = usePage<any>().props;
    const user = auth.user;

    const [countries] = useState(Country.getAllCountries());
    const [cities, setCities] = useState<any[]>([]);
    const [selectedCountryCode, setSelectedCountryCode] = useState<string>('');
    const [countryComboboxOpen, setCountryComboboxOpen] = useState(false);
    const [cityComboboxOpen, setCityComboboxOpen] = useState(false);
    const [countrySearchValue, setCountrySearchValue] = useState('');
    const [citySearchValue, setCitySearchValue] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        phone: user.phone || '',
        country: teacher.country || '',
        city: teacher.city || '',
        preferred_language: teacher.preferred_language || 'English',
        avatar: null as File | null,
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Load cities when country changes
    useEffect(() => {
        if (selectedCountryCode) {
            const countryCities = City.getCitiesOfCountry(selectedCountryCode);
            setCities(countryCities || []);
        } else {
            setCities([]);
        }
    }, [selectedCountryCode]);

    const handleCountryChange = (countryName: string, countryCode: string) => {
        setSelectedCountryCode(countryCode);
        setData('country', countryName);
        setData('city', ''); // Reset city when country changes
        setCountrySearchValue('');
        setCountryComboboxOpen(false);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate phone number for selected country
        if (data.phone && !isValidPhoneNumber(data.phone)) {
            toast.error('Invalid Phone Number', {
                description: `Please enter a valid phone number for ${data.country || 'the selected country'}.`,
            });
            return;
        }

        post('/teacher/onboarding/step-1', {
            forceFormData: true,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('avatar', file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    return (
        <TeacherLayout hideRightSidebar={true} hideLeftSidebar={true}>
            <Head title="Teacher Onboarding - Step 1" />

            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[730px] w-full bg-white rounded-lg shadow-sm p-10">
                    {/* Progress Bar */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <div className="flex items-center justify-center w-[34px] h-[34px] rounded-full bg-[#338078] text-white font-medium text-[16px]" style={{ fontFamily: 'DM Sans' }}>
                                1
                            </div>
                            <div className="w-[98px] h-[6px] bg-[#EFF0F6] rounded-full ml-[18px] relative">
                                <div className="absolute left-0 top-0 w-[49px] h-[6px] bg-[#338078] rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="flex items-center justify-center w-[34px] h-[34px] rounded-full bg-[#EFF0F6] text-[#6B7280] font-normal text-[16px]" style={{ fontFamily: 'DM Sans' }}>
                                2
                            </div>
                            <div className="w-[98px] h-[6px] bg-[#EFF0F6] rounded-full ml-[18px]"></div>
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
                        {/* Personal Information Section */}
                        <div>
                            <h2 className="text-[#170F49] text-[18px] font-medium mb-3" style={{ fontFamily: 'Nunito' }}>
                                Personal Information
                            </h2>
                            <p className="text-[#6B7280] text-[16px] font-medium mb-6" style={{ fontFamily: 'Nunito' }}>
                                Tell us about yourself
                            </p>

                            <div className="space-y-7">
                                {/* Name and Phone Row */}
                                <div className="grid grid-cols-2 gap-8">
                                    {/* Name Field */}
                                    <div>
                                        <label htmlFor="name" className="block text-[#170F49] text-[16px] font-medium mb-4" style={{ fontFamily: 'Nunito' }}>
                                            Name
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="name"
                                                value={user.name}
                                                disabled
                                                className="w-full h-[48px] px-[18px] pl-[54px] border border-[#9E9E9E] rounded-[5px] bg-gray-100 text-[#6B7280] text-[16px] cursor-not-allowed"
                                                style={{ fontFamily: 'Nunito' }}
                                            />
                                            <svg className="absolute left-[18px] top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Phone Field */}
                                    <div>
                                        <label htmlFor="phone" className="block text-[#170F49] text-[16px] font-medium mb-4" style={{ fontFamily: 'Nunito' }}>
                                            Phone Number
                                        </label>
                                        <PhoneInput
                                            international
                                            defaultCountry={selectedCountryCode as any || 'US'}
                                            value={data.phone}
                                            onChange={(value) => setData('phone', value || '')}
                                            className="w-full h-[48px] px-[18px] border border-[#9E9E9E] rounded-[5px] text-[#000000] text-[16px] focus:outline-none focus:border-[#338078] focus:ring-1 focus:ring-[#338078]"
                                            style={{ fontFamily: 'Nunito' }}
                                        />
                                        {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
                                    </div>
                                </div>

                                {/* Country and City Row */}
                                <div className="grid grid-cols-2 gap-8">
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
                                                                    {country.flag} {country.name}
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
                                                        disabled={!selectedCountryCode}
                                                        className={cn(
                                                            "w-full h-[48px] px-[18px] border border-[#9E9E9E] rounded-[5px] text-[16px] flex items-center justify-between focus:outline-none focus:border-[#338078] focus:ring-1 focus:ring-[#338078] disabled:opacity-50 disabled:cursor-not-allowed",
                                                            data.city ? "text-[#000000]" : "text-[#6B7280]"
                                                        )}
                                                        style={{ fontFamily: 'Nunito' }}
                                                    >
                                                        {data.city || (selectedCountryCode ? "Select city" : "Select a country first")}
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
                                            <input
                                                id="city"
                                                type="text"
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                disabled={!selectedCountryCode}
                                                className={cn(
                                                    "w-full h-[48px] px-[18px] border border-[#9E9E9E] rounded-[5px] text-[#000000] text-[16px] focus:ring-[#338078] outline-none",
                                                    !selectedCountryCode && "opacity-50 cursor-not-allowed"
                                                )}
                                                placeholder={selectedCountryCode ? "Enter city name" : "Select a country first"}
                                                style={{ fontFamily: 'Nunito' }}
                                            />
                                        )}
                                        {errors.city && <p className="mt-2 text-sm text-red-600">{errors.city}</p>}
                                        {selectedCountryCode && cities.length === 0 && (
                                            <p className="mt-1 text-xs text-gray-500">No cities available for this country. Please enter manually.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Photo Section */}
                        <div>
                            <h2 className="text-[#170F49] text-[18px] font-medium mb-3" style={{ fontFamily: 'Nunito' }}>
                                Profile Photo
                            </h2>
                            <p className="text-[#6B7280] text-[16px] font-medium mb-7" style={{ fontFamily: 'Nunito' }}>
                                Choose a photo that will help learners get to know you
                            </p>

                            <div className="flex items-center gap-1">
                                {/* Upload Box */}
                                <div className="w-[105px] h-[93px] border border-dashed border-[rgba(0,0,0,0.3)] rounded-[8px] bg-gray-200 flex flex-col items-center justify-center px-[21px] py-[26px]">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover rounded" />
                                    ) : user.avatar ? (
                                        <img src={`/storage/${user.avatar}`} alt="Current avatar" className="w-full h-full object-cover rounded" />
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-[#A4A4A4] text-[12px] font-medium leading-[20px]" style={{ fontFamily: 'Nunito' }}>
                                                JPG or PNG
                                            </p>
                                            <p className="text-[#A4A4A4] text-[12px] font-medium leading-[20px]" style={{ fontFamily: 'Nunito' }}>
                                                Max 5MB
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Upload Button */}
                                <label htmlFor="avatar-upload" className="cursor-pointer px-6 py-3 rounded-[56px] text-[#6B7280] text-[16px] font-medium hover:bg-gray-100 transition-colors" style={{ fontFamily: 'Nunito' }}>
                                    Upload
                                </label>
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    accept="image/jpeg,image/png,image/jpg"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                            {errors.avatar && <p className="mt-2 text-sm text-red-600">{errors.avatar}</p>}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6">
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
