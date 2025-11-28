import { Head } from '@inertiajs/react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
// import HeroContainer from '@/components/landing/sections/HeroContainer';
import HeroSection from '@/components/landing/sections/HeroSection';
import FeaturesBar from '@/components/landing/sections/FeaturesBar';
import HowItWorksSection from '@/components/landing/sections/HowItWorksSection';
import TeachersSection from '@/components/landing/sections/TeachersSection';
import MemorizationSection from '@/components/landing/sections/MemorizationSection';
import BecomeTeacherSection from '@/components/landing/sections/BecomeTeacherSection';
import TestimonialsSection from '@/components/landing/sections/TestimonialsSection';
import FAQSection from '@/components/landing/sections/FAQSection';
import AppDownloadSection from '@/components/landing/sections/AppDownloadSection';
import CTASection from '@/components/landing/sections/CTASection';

export default function LandingPage() {
    return (
        <>
            <Head title="IqraQuest - Connect with Expert Quran Teachers">
                <meta 
                    name="description" 
                    content="Find expert Quran tutors for kids and adults. Learn at your own pace, anytime, anywhere with certified teachers." 
                />
                <link 
                    href="https://fonts.bunny.net/css?family=poppins:300,400,500,600,700|inter:400,500,600,700|nunito:400,500,600,700,800" 
                    rel="stylesheet" 
                />
            </Head>

            <div className="relative min-h-screen w-full">
                {/* Navigation */}
                <Navbar />

                {/* Hero Section with Features Bar (Overlapping) */}
                {/* <HeroContainer /> */}
                <HeroSection />

                <div className="flex items-center justify-center md:-mt-20 sm:-mt-20 lg:-mt-20 -mt-10">
                    <FeaturesBar />
                </div>

                {/* How It Works Section */}
                <HowItWorksSection />

                {/* Teachers Section */}
                <TeachersSection />

                {/* Memorization Plans Section */}
                <MemorizationSection />

                {/* Testimonials Section */}
                <TestimonialsSection />
                
                {/* Become a Teacher Section */}
                <BecomeTeacherSection />

                {/* FAQ Section */}
                <FAQSection />

                {/* App Download Section */}
                <AppDownloadSection />

                {/* CTA Section */}
                <CTASection />

                {/* Footer */}
                <Footer />
            </div>
        </>
    );
}
