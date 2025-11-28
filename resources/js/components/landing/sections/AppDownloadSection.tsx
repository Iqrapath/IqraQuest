import { Icon } from '@iconify/react';

export default function AppDownloadSection() {
    return (
        <div className="relative h-[407px] w-full overflow-hidden bg-white">
            {/* Background Blur Effects */}
            <div className="absolute left-0 top-0 h-[407px] w-[236px] bg-[rgba(51,128,120,0.5)] blur-[277px]" />
            <div className="absolute right-0 top-0 h-[407px] w-[310.414px] bg-[rgba(255,198,51,0.5)] blur-[277px]" />

            {/* Content */}
            <div className="absolute left-1/2 top-1/2 flex w-[978.382px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-[clamp(2rem,3.61vw,3.25rem)]">
                {/* Text Content */}
                <div className="flex flex-col items-center gap-[clamp(1rem,1.67vw,1.5rem)]">
                    <div className="flex flex-col items-center gap-[clamp(0.75rem,1.11vw,1rem)] leading-normal">
                        <p className="bg-gradient-to-l from-[#0a1a18] to-[#338078] bg-clip-text text-center font-['Nunito'] text-[clamp(2rem,3.61vw,3.25rem)] font-bold text-transparent">
                            Download Our Mobile App
                        </p>
                        <p className="w-[936px] text-center font-['Nunito'] text-[clamp(1rem,1.67vw,1.5rem)] font-normal text-gray-600">
                            Book trusted local services anytime, anywhere. With our mobile app, you can search, compare, and book providers on the go — all from the palm of your hand.
                        </p>
                    </div>
                </div>

                {/* App Store Buttons */}
                <div className="flex items-center gap-[clamp(1.5rem,2.22vw,2rem)]">
                    {/* Google Play Button */}
                    <a 
                        href="#google-play"
                        className="flex h-[78px] w-[234px] items-center gap-[clamp(0.75rem,1.11vw,1rem)] rounded-[16px] border border-[#a6a6a6] bg-black px-[10px] py-[4px] transition-transform hover:scale-105"
                    >
                        <Icon 
                        icon="logos:google-play-icon" 
                        className="h-[46.8px] w-[40.95px] text-white" 
                        />
                        <div className="flex flex-col">
                            <p className="font-['Product_Sans'] text-[19.5px] uppercase leading-normal text-white">
                                GET IT ON
                            </p>
                            <p className="font-['Product_Sans'] text-[29.25px] font-bold leading-none text-white">
                                Google Play
                            </p>
                        </div>
                    </a>

                    {/* App Store Button */}
                    <a 
                        href="#app-store"
                        className="flex h-[78px] w-[234px] items-center gap-[clamp(0.75rem,1.11vw,1rem)] rounded-[16px] border border-[#a6a6a6] bg-black px-[10px] py-[4px] transition-transform hover:scale-105"
                    >
                        <Icon icon="mdi:apple" className="h-[46.8px] w-[39px] text-white" />
                        <div className="flex flex-col">
                            <p className="font-['SF_Compact_Text'] text-[17.55px] leading-[17.55px] text-white">
                                Download on the
                            </p>
                            <p className="font-['SF_Compact_Display'] text-[35.1px] font-medium leading-none tracking-[-0.47px] text-white">
                                App Store
                            </p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}

