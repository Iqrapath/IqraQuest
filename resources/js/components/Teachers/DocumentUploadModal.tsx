import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface DocumentUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacherId: number;
    type: 'id_card_front' | 'id_card_back' | 'cv' | 'certificate';
    title?: string; // Optional override for modal title
}

export default function DocumentUploadModal({ isOpen, onClose, teacherId, type, title }: DocumentUploadModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        file: null as File | null,
        type: type,
        title: '', // Only used for 'certificate' type
        description: '',
        issuing_organization: '',
        issue_date: '',
        expiry_date: '',
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Reset form when modal opens/closes or type changes
    useEffect(() => {
        if (isOpen) {
            setData('type', type);
            clearErrors();
        } else {
            handleClose();
        }
    }, [isOpen, type]);

    const handleClose = () => {
        reset();
        setPreviewUrl(null);
        clearErrors();
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('file', file);
            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/teachers/${teacherId}/documents/upload`, {
            onSuccess: () => {
                handleClose();
                // Success toast is handled globally by AppProvider
            },
            onError: (errors) => {
                console.error('Upload errors:', errors);
                toast.error('Upload failed. Please check the form for errors.');
            },
            preserveScroll: true,
        });
    };

    const getModalTitle = () => {
        if (title) return title;
        switch (type) {
            case 'id_card_front': return 'Upload ID Card (Front)';
            case 'id_card_back': return 'Upload ID Card (Back)';
            case 'cv': return 'Upload CV/Resume';
            case 'certificate': return 'Upload Certificate';
            default: return 'Upload Document';
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all font-['Outfit']">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center mb-4"
                                >
                                    {getModalTitle()}
                                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-500">
                                        <Icon icon="mdi:close" className="w-6 h-6" />
                                    </button>
                                </Dialog.Title>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* File Input */}
                                    <div>
                                        <Label className="mb-1">Select File</Label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-[#338078] transition-colors cursor-pointer relative">
                                            <div className="space-y-1 text-center">
                                                {previewUrl ? (
                                                    <img src={previewUrl} alt="Preview" className="mx-auto h-32 object-contain" />
                                                ) : (
                                                    <Icon icon="mdi:cloud-upload-outline" className="mx-auto h-12 w-12 text-gray-400" />
                                                )}
                                                <div className="flex text-sm text-gray-600 justify-center">
                                                    <label
                                                        htmlFor={`file-upload-${type}`}
                                                        className="relative cursor-pointer bg-white rounded-md font-medium text-[#338078] hover:text-[#2a6a63] focus-within:outline-none"
                                                    >
                                                        <span>Upload a file</span>
                                                        <input
                                                            id={`file-upload-${type}`}
                                                            name="file"
                                                            type="file"
                                                            className="sr-only"
                                                            onChange={handleFileChange}
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                        />
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                                                {data.file && (
                                                    <p className="text-sm text-gray-900 font-medium mt-2">
                                                        Selected: {data.file.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
                                    </div>

                                    {/* Additional Fields for Certificates */}
                                    {type === 'certificate' && (
                                        <>
                                            <div>
                                                <Label htmlFor="title">Title</Label>
                                                <Input
                                                    id="title"
                                                    type="text"
                                                    value={data.title}
                                                    onChange={e => setData('title', e.target.value)}
                                                    className="mt-1"
                                                    placeholder="e.g. Quran Memorization Certificate"
                                                    required
                                                />
                                                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="issuing_organization">Issuing Organization</Label>
                                                <Input
                                                    id="issuing_organization"
                                                    type="text"
                                                    value={data.issuing_organization}
                                                    onChange={e => setData('issuing_organization', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="issue_date">Issue Date</Label>
                                                    <Input
                                                        id="issue_date"
                                                        type="date"
                                                        value={data.issue_date}
                                                        onChange={e => setData('issue_date', e.target.value)}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="expiry_date">Expiry Date</Label>
                                                    <Input
                                                        id="expiry_date"
                                                        type="date"
                                                        value={data.expiry_date}
                                                        onChange={e => setData('expiry_date', e.target.value)}
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                            onClick={handleClose}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-[#338078] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a6a63] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#338078] focus-visible:ring-offset-2 disabled:opacity-50"
                                            disabled={processing || !data.file}
                                        >
                                            {processing ? 'Uploading...' : 'Upload'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
