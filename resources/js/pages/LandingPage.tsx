import { Head, usePage } from '@inertiajs/react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
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

interface Props {
    teachers: any[];
    faqs: any[];
}

export default function LandingPage({ teachers, faqs }: Props) {
    const { translations } = usePage<any>().props;
    const __ = (key: string) => (translations && translations[key]) ? translations[key] : key;

    return (
        <>
            <Head title={__("IqraQuest - Connect with Expert Quran Teachers")}>
                <meta
                    name="description"
                    content={__("Find expert Quran tutors for kids and adults. Learn at your own pace, anytime, anywhere with certified teachers.")}
                />
                <meta name="keywords" content={__("Quran teacher, online Quran classes, Quran tutor, learn Quran online, Islamic education")} />
                <meta property="og:title" content={__("IqraQuest - Connect with Expert Quran Teachers")} />
                <meta property="og:description" content={__("Find expert Quran tutors for kids and adults. Learn at your own pace, anytime, anywhere.")} />
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
                <section>
                    <HeroSection />
                </section>

                <div className="flex items-center justify-center md:-mt-20 sm:-mt-20 lg:-mt-20 -mt-10">
                    <FeaturesBar />
                </div>

                {/* How It Works Section */}
                <section>
                    <HowItWorksSection />
                </section>

                {/* Teachers Section */}
                <section>
                    <TeachersSection teachers={teachers} />
                </section>

                {/* Memorization Plans Section */}
                <section>
                    <MemorizationSection />
                </section>

                {/* Testimonials Section */}
                <section>
                    <TestimonialsSection />
                </section>

                {/* Become a Teacher Section */}
                <section>
                    <BecomeTeacherSection />
                </section>

                {/* FAQ Section */}
                <section>
                    <FAQSection faqs={faqs} />
                </section>

                {/* App Download Section */}
                <section>
                    <AppDownloadSection />
                </section>

                {/* CTA Section */}
                <section>
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
