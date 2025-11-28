import HeroSection from './HeroSection';
import FeaturesBar from './FeaturesBar';

export default function HeroContainer() {
    return (
        <div className="flex flex-col items-center h-auto w-full overflow-hidden">
            {/* Combined Hero Background Image */}
            <div className="absolute inset-0 h-100% w-full">
                <img 
                    src="/images/hero-bg.png" 
                    alt="" 
                    className="h-auto w-full object-cover"
                />
            </div>
            
            {/* Hero content */}
            <HeroSection />
            
            {/* Features bar - overlaps hero */}
            <div className="md:-mt-8 lg:mt-20 mt-30">
                <FeaturesBar />
            </div>
        </div>
    );
}
