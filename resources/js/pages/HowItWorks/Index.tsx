import React from 'react';
import { Head } from '@inertiajs/react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import HeroSection from '@/components/HowItWorks/HeroSection';
import StudentStepSection from '@/components/HowItWorks/StudentStepSection';
import TeacherStepSection from '@/components/HowItWorks/TeacherStepSection';
import AppDownloadSection from '@/components/landing/sections/AppDownloadSection';
import FinalCTASection from '@/components/HowItWorks/FinalCTASection';

export default function HowItWorks() {
    return (
        <div className="min-h-screen bg-white">
            <Head title="How It Works" />

            <Navbar />

            <main>
                {/* Hero Section */}
                <HeroSection />

                {/* For Student Section (Redesigned) */}
                <StudentStepSection />

                {/* For Teacher Section (Redesigned) */}
                <TeacherStepSection />

                {/* App Download Section (Reused) */}
                <AppDownloadSection />

                {/* Final CTA Section */}
                <FinalCTASection />
            </main>

            <Footer />
        </div>
    );
}
