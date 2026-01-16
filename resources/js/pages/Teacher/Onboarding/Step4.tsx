import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from '@/contexts/CurrencyContext';

interface Props {
    teacher: any;
}

const NGN_MIN_RATE = 3000;
const NGN_MAX_RATE = 5000;

export default function Step4({ teacher }: Props) {
    const { currency, setCurrency, config, convert, loading } = useCurrency();
    const [rateError, setRateError] = useState<string | null>(null);
    const [banks, setBanks] = useState<any[]>([]);
    const [open, setOpen] = useState(false);

    // Calculate dynamic limits based on currency
    const minRate = currency === 'NGN' ? NGN_MIN_RATE : convert(NGN_MIN_RATE, 'NGN', 'USD');
    const maxRate = currency === 'NGN' ? NGN_MAX_RATE : convert(NGN_MAX_RATE, 'NGN', 'USD');

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        preferred_currency: teacher.payment_method?.preferred_currency || currency,
        hourly_rate: teacher.hourly_rate || '',
        payment_type: teacher.payment_method?.payment_type || '',
        bank_name: teacher.payment_method?.bank_name || '',
        bank_code: teacher.payment_method?.bank_code || '',
        account_number: teacher.payment_method?.account_number || '',
        account_name: teacher.payment_method?.account_name || '',
        routing_number: teacher.payment_method?.routing_number || '',
        paypal_email: teacher.payment_method?.email || '', // Mapped from email
        stripe_account_id: teacher.payment_method?.account_id || '', // Mapped from account_id
    });

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

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (rateError) {
            toast.error(rateError);
            return;
        }

        post('/teacher/onboarding/step-4', {
            onSuccess: () => {
                toast.success('Onboarding completed successfully!');
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('Please check the form for errors.');
            }
        });
    };

    const goBack = () => {
        router.visit('/teacher/onboarding/step-3');
    };

    return (
        <TeacherLayout hideRightSidebar={true} hideLeftSidebar={true}>
            <Head title="Teacher Onboarding - Step 4" />

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
                            <div className="w-[40px] sm:w-[98px] h-[6px] bg-[#338078] rounded-full ml-2 sm:ml-[18px]"></div>
                        </div>
                        <div className="flex items-center flex-shrink-0 ml-2 sm:ml-0">
                            <div className="flex items-center justify-center w-[34px] h-[34px] rounded-full bg-[#338078] text-white font-medium text-[16px]" style={{ fontFamily: 'DM Sans' }}>
                                3
                            </div>
                            <div className="w-[40px] sm:w-[98px] h-[6px] bg-[#338078] rounded-full ml-2 sm:ml-[18px]"></div>
                        </div>
                        <div className="flex items-center justify-center flex-shrink-0 w-[34px] h-[34px] rounded-full bg-[#338078] text-white font-medium text-[16px] ml-2 sm:ml-0" style={{ fontFamily: 'DM Sans' }}>
                            4
                        </div>
                    </div>

                    <div className="border-b border-gray-200 mb-8"></div>

                    <form onSubmit={submit} className="space-y-8">
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
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                                        <Popover open={open} onOpenChange={setOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={open}
                                                    className="w-full justify-between h-[42px] px-[14px] border-[#9E9E9E] rounded-[5px] text-[#000000] text-[14px] font-normal hover:bg-transparent"
                                                >
                                                    {data.bank_code
                                                        ? banks.find((bank) => bank.code === data.bank_code)?.name
                                                        : "Select Bank..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[calc(100vw-3rem)] sm:w-[400px] p-0">
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
                                                                        setOpen(false);
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
                                            type="number"
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
                                {processing ? 'Completing...' : 'Complete Registration'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </TeacherLayout>
    );
}
