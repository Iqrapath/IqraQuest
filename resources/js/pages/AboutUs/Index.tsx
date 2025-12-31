import React from 'react';
import { Head } from '@inertiajs/react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import HeroSection from '@/components/AboutUs/HeroSection';
import ContentSection from '@/components/AboutUs/ContentSection';
import MissionValuesSection from '@/components/AboutUs/MissionValuesSection';
import TeamSection from '@/components/AboutUs/TeamSection';
import BecomeTeacherCTA from '@/components/FindTeacher/BecomeTeacherCTA';

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-[#fff7e4]">
            <Head title="About Us" />

            <Navbar />

            <main>
                {/* Hero Section */}
                <HeroSection />

                {/* Main Content Section */}
                <ContentSection />

                {/* Mission & Values Section */}
                <MissionValuesSection />

                {/* Leadership Team Section */}
                <TeamSection />

                {/* Final CTA Section (Reusing existing component) */}
                <BecomeTeacherCTA />
            </main>

            <Footer />
        </div>
    );
}
