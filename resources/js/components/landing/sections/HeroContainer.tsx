import HeroSection from './HeroSection';
import FeaturesBar from './FeaturesBar';

export default function HeroContainer() {
    return (
        <div className="relative h-[1280px] w-full overflow-hidden">
            {/* Combined Hero Background Image */}
            <div className="absolute inset-0 h-full w-full">
                <img 
                    src="/images/hero-bg.png" 
                    alt="" 
                    className="h-auto w-full object-cover object-center"
                />
            </div>
            
            {/* Hero content */}
            <HeroSection />
            
            {/* Features bar - overlaps hero */}
            <FeaturesBar />
        </div>
    );
}
