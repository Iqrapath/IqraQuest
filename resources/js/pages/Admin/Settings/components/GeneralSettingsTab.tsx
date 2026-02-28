import React, { FormEventHandler, useState, useRef, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Switch } from "@/components/ui/switch";
import TermsConditionsTab from './TermsConditionsTab';
import PrivacyPolicyTab from './PrivacyPolicyTab';
import KnowledgeBaseTab from './KnowledgeBaseTab';

interface Props {
    settings: any;
    localization: any;
    legalSettings: any;
    faqs: any[];
}

export default function GeneralSettingsTab({ settings, localization, legalSettings, faqs }: Props) {
    const { site_logo, site_name: global_site_name, translations } = usePage<any>().props;

    // Translation helper
    const __ = (key: string) => translations[key] || key;

    const [logoPreview, setLogoPreview] = useState<string | null>(site_logo || "/images/Logo.png");
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingDateFormat, setIsEditingDateFormat] = useState(false);
    const [activeExtension, setActiveExtension] = useState<'none' | 'terms' | 'privacy' | 'faq'>('none');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Generate timezone options
    const timezones = React.useMemo(() => {
        try {
            return (Intl as any).supportedValuesOf('timeZone').map((tz: string) => {
                const now = new Date();
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: tz,
                    timeZoneName: 'shortOffset'
                });
                const parts = formatter.formatToParts(now);
                const offset = parts.find(p => p.type === 'timeZoneName')?.value || '';

                return {
                    value: tz,
                    label: `${tz} (${offset})`
                };
            });
        } catch (e) {
            // Fallback for older browsers
            return [
                { value: 'Africa/Lagos', label: 'Africa/Lagos (GMT+1)' },
                { value: 'UTC', label: 'UTC (GMT+0)' },
                { value: 'America/New_York', label: 'America/New_York (GMT-5)' }
            ];
        }
    }, []);

    const dateFormats = [
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (25/12/2025)' },
        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/25/2025)' },
        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2025-12-25)' },
        { value: 'jS F Y', label: 'Full Date (25th December 2025)' },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        site_name: settings?.site_name || global_site_name || 'IQRAQUEST',
        support_email: settings?.support_email || '',
        office_address: settings?.office_address || '',
        contact_number: settings?.contact_number || '',
        whatsapp_number: settings?.whatsapp_number || '',
        show_support_email: settings?.show_support_email === undefined ? true : settings?.show_support_email == 1 || settings?.show_support_email === true,
        show_office_address: settings?.show_office_address === undefined ? true : settings?.show_office_address == 1 || settings?.show_office_address === true,
        show_contact_number: settings?.show_contact_number === undefined ? true : settings?.show_contact_number == 1 || settings?.show_contact_number === true,
        show_whatsapp_number: settings?.show_whatsapp_number === undefined ? true : settings?.show_whatsapp_number == 1 || settings?.show_whatsapp_number === true,
        language: localization?.language || 'en',
        timezone: localization?.timezone || 'Africa/Lagos',
        date_format: localization?.date_format || 'DD/MM/YYYY',
        default_landing_page: localization?.default_landing_page || 'home',
        logo: null as File | null,
    });

    // Sync with props when they update from the server
    useEffect(() => {
        if (site_logo) setLogoPreview(site_logo);
        setData('site_name', settings?.site_name || global_site_name || 'IQRAQUEST');
    }, [site_logo, settings?.site_name, global_site_name]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        // Multi-part form for file upload automatically handled by useForm when data contains a File
        post('/admin/settings/general', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('General settings updated successfully');
                setIsEditingName(false);
            },
            onError: () => toast.error('Failed to update settings. Please check the form.'),
        });
    };

    if (activeExtension === 'terms') {
        return <TermsConditionsTab settings={legalSettings} onBack={() => setActiveExtension('none')} />;
    }

    if (activeExtension === 'privacy') {
        return <PrivacyPolicyTab settings={legalSettings} onBack={() => setActiveExtension('none')} />;
    }

    if (activeExtension === 'faq') {
        return <KnowledgeBaseTab faqs={faqs} onBack={() => setActiveExtension('none')} />;
    }


    return (
        <form onSubmit={handleSubmit} className="font-[Nunito] pb-20">
            <div className="max-w-[1000px] space-y-10">
                {/* Header */}
                <div>
                    <h2 className="text-[20px] font-bold text-[#101928]">{__("General Settings")}</h2>
                </div>

                {/* Logo Section */}
                <div className="space-y-4">
                    <p className="text-sm font-medium text-[#101928]">{__("Logo Upload")}</p>
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-center gap-2">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-[120px] h-[120px] rounded-full bg-[#E5E7EB] flex items-center justify-center group cursor-pointer relative overflow-hidden border-2 border-dashed border-gray-300"
                            >
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <Icon icon="ph:camera-light" className="w-10 h-10 text-gray-500" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Icon icon="ph:upload-simple-light" className="w-8 h-8 text-white" />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleLogoChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>
                            <span className="text-xs text-gray-400">{__("Upload")}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {isEditingName ? (
                                <input
                                    type="text"
                                    value={data.site_name}
                                    onChange={e => setData('site_name', e.target.value)}
                                    className="text-[36px] font-semibold text-[#101928] border-b border-[#338078] outline-none bg-transparent"
                                    autoFocus
                                    onBlur={() => setIsEditingName(false)}
                                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                                />
                            ) : (
                                <h3 className="text-[36px] font-semibold text-[#101928]">{data.site_name}</h3>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsEditingName(!isEditingName)}
                                className={`transition-colors ${isEditingName ? 'text-[#338078]' : 'text-gray-400 hover:text-[#338078]'}`}
                            >
                                <Icon icon="ph:pencil-simple-fill" className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="ml-auto">
                            <button
                                type="submit"
                                disabled={processing || !data.logo}
                                className={`px-6 py-2 rounded-[30px] flex items-center gap-2 text-sm font-medium transition-all ${data.logo ? 'bg-[#338078] text-white hover:bg-[#2a6b64] shadow-md' : 'bg-[#B3B3B3] text-white opacity-80 cursor-not-allowed'}`}
                            >
                                <Icon icon="ph:upload-simple-bold" className="w-5 h-5" />
                                {processing ? __("Updating...") : __("Update")}
                            </button>
                        </div>
                    </div>
                    {errors.logo && <p className="text-xs text-red-500">{errors.logo}</p>}
                </div>

                <hr className="border-gray-100" />

                {/* Contact Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-[#101928]">{__("Support Email")}</label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">{data.show_support_email ? __("Visible") : __("Hidden")}</span>
                                <Switch checked={data.show_support_email} onCheckedChange={(v) => setData('show_support_email', v)} />
                            </div>
                        </div>
                        <input
                            type="email"
                            value={data.support_email}
                            onChange={e => setData('support_email', e.target.value)}
                            placeholder="e.g., support@iqraquest.com"
                            className="w-full h-[52px] px-5 rounded-[12px] border border-gray-100 bg-[#F9FAFB] text-sm focus:ring-1 focus:ring-[#338078] outline-none placeholder:text-gray-300"
                        />
                        {errors.support_email && <p className="text-xs text-red-500">{errors.support_email}</p>}
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-[#101928]">{__("Office Address")}</label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">{data.show_office_address ? __("Visible") : __("Hidden")}</span>
                                <Switch checked={data.show_office_address} onCheckedChange={(v) => setData('show_office_address', v)} />
                            </div>
                        </div>
                        <input
                            type="text"
                            value={data.office_address}
                            onChange={e => setData('office_address', e.target.value)}
                            placeholder="e.g., 123 Business Lane, Lagos, Nigeria"
                            className="w-full h-[52px] px-5 rounded-[12px] border border-gray-100 bg-[#F9FAFB] text-sm focus:ring-1 focus:ring-[#338078] outline-none placeholder:text-gray-300"
                        />
                        {errors.office_address && <p className="text-xs text-red-500">{errors.office_address}</p>}
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-[#101928]">{__("Contact Number")}:</label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">{data.show_contact_number ? __("Visible") : __("Hidden")}</span>
                                <Switch checked={data.show_contact_number} onCheckedChange={(v) => setData('show_contact_number', v)} />
                            </div>
                        </div>
                        <input
                            type="text"
                            value={data.contact_number}
                            onChange={e => setData('contact_number', e.target.value)}
                            placeholder="e.g., +234 801 234 5678"
                            className="w-full h-[52px] px-5 rounded-[12px] border border-gray-100 bg-[#F9FAFB] text-sm focus:ring-1 focus:ring-[#338078] outline-none placeholder:text-gray-300"
                        />
                        {errors.contact_number && <p className="text-xs text-red-500">{errors.contact_number}</p>}
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-[#101928]">{__("Whatsapp Number")}:</label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">{data.show_whatsapp_number ? __("Visible") : __("Hidden")}</span>
                                <Switch checked={data.show_whatsapp_number} onCheckedChange={(v) => setData('show_whatsapp_number', v)} />
                            </div>
                        </div>
                        <input
                            type="text"
                            value={data.whatsapp_number}
                            onChange={e => setData('whatsapp_number', e.target.value)}
                            placeholder="e.g., +234 801 234 5678"
                            className="w-full h-[52px] px-5 rounded-[12px] border border-gray-100 bg-[#F9FAFB] text-sm focus:ring-1 focus:ring-[#338078] outline-none placeholder:text-gray-300"
                        />
                        {errors.whatsapp_number && <p className="text-xs text-red-500">{errors.whatsapp_number}</p>}
                    </div>
                </div>

                {/* Localization Card */}
                <div className="bg-white border border-gray-100 rounded-[20px] p-8 shadow-[0px_2px_10px_0px_rgba(0,0,0,0.02)] space-y-6 max-w-[650px]">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-[#101928]">{__("Platform Language")}</label>
                        <Select value={data.language} onValueChange={v => setData('language', v)}>
                            <SelectTrigger className="w-[180px] h-[44px] bg-white border-gray-200 rounded-[8px]">
                                <SelectValue placeholder={__("Language")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">{__("English")}</SelectItem>
                                <SelectItem value="ar">{__("Arabic")}</SelectItem>
                                <SelectItem value="fr">{__("French")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-[#101928]">{__("Time Zone")}</label>
                        <Combobox
                            options={timezones}
                            value={data.timezone}
                            onChange={v => setData('timezone', v)}
                            placeholder={__("Select Timezone")}
                            className="w-[280px] h-[44px] bg-white border-gray-200 rounded-[8px]"
                        />
                    </div> */}

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#101928]">{__("Date Format")}</label>
                        <div className="flex items-center gap-4">
                            {isEditingDateFormat ? (
                                <input
                                    type="text"
                                    value={data.date_format}
                                    onChange={e => setData('date_format', e.target.value)}
                                    placeholder="e.g., DD/MM/YYYY"
                                    className="w-[280px] h-[44px] px-4 rounded-[8px] border border-[#338078] bg-white text-sm outline-none"
                                    autoFocus
                                />
                            ) : (
                                <Select value={data.date_format} onValueChange={v => setData('date_format', v)}>
                                    <SelectTrigger className="w-[280px] h-[44px] bg-white border-gray-200 rounded-[8px]">
                                        <SelectValue placeholder={__("Select Format")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dateFormats.map(fmt => (
                                            <SelectItem key={fmt.value} value={fmt.value}>{fmt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsEditingDateFormat(!isEditingDateFormat)}
                                className="text-[#338078] text-xs font-semibold hover:underline"
                            >
                                {isEditingDateFormat ? __("Back to Presets") : __("Custom")}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <label className="text-sm font-bold text-[#101928]">{__("Default Landing Page")}</label>
                        <Select value={data.default_landing_page} onValueChange={v => setData('default_landing_page', v)}>
                            <SelectTrigger className="w-[150px] h-[44px] bg-white border-gray-200 rounded-[8px]">
                                <SelectValue placeholder={__("Landing Page")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="home">{__("Home")}</SelectItem>
                                <SelectItem value="find-teacher">{__("Find a Teacher")}</SelectItem>
                                <SelectItem value="how-it-works">{__("How It Works")}</SelectItem>
                                <SelectItem value="blog">{__("Blog")}</SelectItem>
                                <SelectItem value="about-us">{__("About Us")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Legal & FAQ Card */}
                <div className="bg-white border border-gray-100 rounded-[20px] p-8 shadow-[0px_2px_10px_0px_rgba(0,0,0,0.02)] space-y-8 max-w-[650px]">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#101928]">{__("Terms & Conditions")}</span>
                        <div className="flex items-center gap-6">
                            <button
                                type="button"
                                onClick={() => setActiveExtension('terms')}
                                className="flex items-center gap-2 text-[#667085] hover:text-[#338078] text-sm cursor-pointer hover:underline transition-all"
                            >
                                <Icon icon="ph:eye-light" className="w-5 h-5 text-gray-400" />
                                {__("View")}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveExtension('terms')}
                                className="flex items-center gap-2 text-[#338078] hover:text-[#2a6b64] text-sm font-semibold cursor-pointer hover:underline transition-all"
                            >
                                <Icon icon="ph:note-pencil-light" className="w-5 h-5" />
                                {__("Edit")}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#101928]">{__("Privacy Policy")}</span>
                        <div className="flex items-center gap-6">
                            <button
                                type="button"
                                onClick={() => setActiveExtension('privacy')}
                                className="flex items-center gap-2 text-[#667085] hover:text-[#338078] text-sm cursor-pointer hover:underline transition-all"
                            >
                                <Icon icon="ph:eye-light" className="w-5 h-5 text-gray-400" />
                                {__("View")}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveExtension('privacy')}
                                className="flex items-center gap-2 text-[#338078] hover:text-[#2a6b64] text-sm font-semibold cursor-pointer hover:underline transition-all"
                            >
                                <Icon icon="ph:note-pencil-light" className="w-5 h-5" />
                                {__("Edit")}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#101928]">{__("FAQ")}</span>
                        <div className="flex items-center gap-6">
                            <button
                                type="button"
                                onClick={() => setActiveExtension('faq')}
                                className="flex items-center gap-2 text-[#667085] hover:text-[#338078] text-sm cursor-pointer hover:underline transition-all"
                            >
                                <Icon icon="ph:eye-light" className="w-5 h-5 text-gray-400" />
                                {__("View")}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveExtension('faq')}
                                className="flex items-center gap-2 text-[#338078] hover:text-[#2a6b64] text-sm font-semibold cursor-pointer hover:underline transition-all"
                            >
                                <Icon icon="ph:note-pencil-light" className="w-5 h-5" />
                                {__("Edit")}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-10">
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-[#338078] text-white px-10 py-3 rounded-[35px] font-semibold hover:bg-[#2a6b64] transition-all shadow-lg tracking-wider cursor-pointer"
                    >
                        {processing ? __("Saving...") : __("Save Changes")}
                    </button>
                </div>
            </div>
        </form>
    );
}
