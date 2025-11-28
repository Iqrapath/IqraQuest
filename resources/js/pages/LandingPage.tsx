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
import ScrollToTop from '@/components/landing/ScrollToTop';

export default function LandingPage() {
    return (
        <>
            <Head title="IqraQuest - Connect with Expert Quran Teachers">
                <meta 
                    name="description" 
                    content="Find expert Quran tutors for kids and adults. Learn at your own pace, anytime, anywhere with certified teachers." 
                />
                <meta name="keywords" content="Quran teacher, online Quran classes, Quran tutor, learn Quran online, Islamic education" />
                <meta property="og:title" content="IqraQuest - Connect with Expert Quran Teachers" />
                <meta property="og:description" content="Find expert Quran tutors for kids and adults. Learn at your own pace, anytime, anywhere." />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="/images/og-image.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <link 
                    href="https://fonts.bunny.net/css?family=poppins:300,400,500,600,700|inter:400,500,600,700|nunito:400,500,600,700,800" 
                    rel="stylesheet" 
                />
            </Head>

            <div className="relative min-h-screen w-full scroll-smooth">
                {/* Navigation */}
                <Navbar />

                {/* Hero Section with Features Bar (Overlapping) */}
                <section id="home">
                    <HeroSection />
                </section>

                <div className="flex items-center justify-center md:-mt-20 sm:-mt-20 lg:-mt-20 -mt-10">
                    <FeaturesBar />
                </div>

                {/* How It Works Section */}
                <section id="how-it-works">
                    <HowItWorksSection />
                </section>

                {/* Teachers Section */}
                <section id="find-teacher">
                    <TeachersSection />
                </section>

                {/* Memorization Plans Section */}
                <section id="features">
                    <MemorizationSection />
                </section>

                {/* Testimonials Section */}
                <section id="testimonials">
                    <TestimonialsSection />
                </section>
                
                {/* Become a Teacher Section */}
                <section id="become-teacher">
                    <BecomeTeacherSection />
                </section>

                {/* FAQ Section */}
                <section id="faq">
                    <FAQSection />
                </section>

                {/* App Download Section */}
                <section id="download">
                    <AppDownloadSection />
                </section>

                {/* CTA Section */}
                <section id="contact">
                    <CTASection />
                </section>

                {/* Footer */}
                <Footer />

                {/* Scroll to Top Button */}
                <ScrollToTop />
            </div>
        </>
    );
}
