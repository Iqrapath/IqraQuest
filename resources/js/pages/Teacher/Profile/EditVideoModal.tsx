import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Icon } from '@iconify/react';
import { useRef, useState } from 'react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teacher: any;
}

export default function EditVideoModal({ open, onOpenChange, teacher }: Props) {
    // We can handle both URL update or file upload. 
    // For now simple URL input as per simple requirement, or upload if backend supports it.
    // Backend `uploadVideo` supports file upload. Let's do file upload.

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(teacher.intro_video_url);

    const { data, setData, post, processing, progress } = useForm({
        video: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('video', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/teacher/profile/video', {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setData('video', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1000px] w-[95vw] p-0 overflow-hidden bg-white rounded-[20px] max-h-[90vh] flex flex-col">
                <div className="p-5 md:p-12 overflow-y-auto custom-scrollbar">
                    <DialogHeader className="mb-6 md:mb-8 text-left">
                        <DialogTitle className="font-['Nunito'] font-bold text-[24px] md:text-[32px] text-[#1a1d56]">
                            Intro Video
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
                            {/* Left Column: Guidelines */}
                            <div className="lg:col-span-5 flex flex-col gap-6">
                                <div>
                                    <h3 className="font-['Nunito'] font-bold text-[18px] md:text-[20px] text-[#333] mb-2">
                                        Upload your intro video
                                    </h3>
                                    <p className="font-['Nunito'] text-[14px] text-[#666] leading-relaxed">
                                        Connecting over video is a great way to build credibility, gain trust, and increase student conversion rate.
                                    </p>
                                </div>

                                {/* Alert Box */}
                                <div className="bg-[#e0fbf6] rounded-[8px] p-4 flex gap-3 items-start">
                                    <Icon icon="mdi:information-outline" className="text-[#338078] w-5 h-5 mt-0.5 flex-shrink-0" />
                                    <div className="flex flex-col gap-1">
                                        <p className="font-['Nunito'] font-bold text-[14px] text-[#338078]">
                                            Review our guidelines before uploading your file
                                        </p>
                                        <p className="font-['Nunito'] text-[13px] text-[#338078]/80 leading-tight">
                                            Videos that don't follow these guidelines or have poor audio or video quality can hurt sales and won't be approved.
                                        </p>
                                    </div>
                                </div>

                                {/* Requirements List */}
                                <div className="mt-2">
                                    <h4 className="font-['Nunito'] font-bold text-[16px] text-[#333] mb-3">
                                        Video requirements:
                                    </h4>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li className="font-['Nunito'] text-[14px] text-[#666]">Length: 20 - 60 seconds</li>
                                        <li className="font-['Nunito'] text-[14px] text-[#666]">Minimum resolution: 1280x720</li>
                                        <li className="font-['Nunito'] text-[14px] text-[#666]">Aspect ratio: 16:9 (Landscape)</li>
                                        <li className="font-['Nunito'] text-[14px] text-[#666]">File size: Up to 5 GB</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Right Column: Upload Area */}
                            <div className="lg:col-span-7">
                                <div
                                    className={`w-full aspect-video bg-[#f8f9fa] rounded-[16px] border-2 border-dashed ${data.video ? 'border-[#338078]' : 'border-[#e0e0e0]'} flex flex-col items-center justify-center cursor-pointer hover:border-[#338078] transition-all relative overflow-hidden group`}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                >
                                    {previewUrl ? (
                                        <video src={previewUrl} controls className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-4 text-center p-6">
                                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
                                                <Icon icon="solar:upload-minimalistic-linear" className="w-6 h-6 text-[#666]" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <h4 className="font-['Nunito'] font-bold text-[20px] text-[#333]">
                                                    Upload your video
                                                </h4>
                                                <p className="font-['Nunito'] text-[14px] text-[#338078] font-medium">
                                                    Choose <span className="text-[#999] font-normal">a file or drop it here</span>
                                                </p>
                                            </div>
                                            <p className="font-['Nunito'] text-[12px] text-[#999] mt-2">
                                                You can upload the following formats:<br />
                                                .mp4, .mov, .avi, 5MB
                                            </p>
                                        </div>
                                    )}

                                    {previewUrl && (
                                        <div className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Icon icon="tabler:replace" className="w-5 h-5 text-[#338078]" />
                                        </div>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="video/mp4,video/quicktime,video/x-msvideo"
                                    className="hidden"
                                />

                                {progress && (
                                    <div className="w-full bg-gray-100 rounded-full h-2 mt-4 overflow-hidden">
                                        <div className="bg-[#338078] h-full rounded-full transition-all duration-300" style={{ width: `${progress.percentage}%` }}></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex justify-end mt-12">
                            <button
                                type="submit"
                                disabled={processing || !data.video}
                                className="bg-[#338078] text-white font-['Nunito'] font-bold text-[16px] py-3 px-12 rounded-[50px] hover:bg-[#2a6b64] transition-colors disabled:opacity-50 shadow-lg shadow-[#338078]/20"
                            >
                                {processing ? 'Uploading...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );

}
