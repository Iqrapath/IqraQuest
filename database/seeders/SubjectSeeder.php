<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        
        DB::table('teacher_subjects')->truncate();
        DB::table('student_subjects')->truncate();
        DB::table('guardian_subjects')->truncate();
        DB::table('bookings')->truncate();
        DB::table('match_requests')->truncate();
        Subject::truncate();
        
        Schema::enableForeignKeyConstraints();

        $categories = [
            'Quran' => [
                [
                    'name' => 'Hifz',
                    'description' => 'Quran Memorization - Complete memorization of the Holy Quran',
                    'icon' => 'solar:book-bookmark-bold',
                ],
                [
                    'name' => 'Tajweed',
                    'description' => 'Quran Recitation Rules - Proper pronunciation and recitation rules',
                    'icon' => 'solar:microphone-large-bold',
                ],
                [
                    'name' => 'Tafsir',
                    'description' => 'Quran Interpretation - Explanation and commentary of Quranic verses',
                    'icon' => 'solar:document-text-bold',
                ],
                [
                    'name' => 'Qira\'at',
                    'description' => 'Quranic Recitation Styles - Different authentic methods of Quran recitation',
                    'icon' => 'solar:music-note-bold',
                ],
                [
                    'name' => 'Quranic Arabic',
                    'description' => 'Vocabulary and grammar specifically for understanding the Quran',
                    'icon' => 'solar:translation-bold',
                ],
            ],
            'Arabic' => [
                [
                    'name' => 'Classical Arabic (Fusha)',
                    'description' => 'Standard modern and classical Arabic language studies',
                    'icon' => 'solar:chat-round-line-bold',
                ],
                [
                    'name' => 'Conversational Arabic (Ammiya)',
                    'description' => 'Dialects and spoken Arabic for daily conversation',
                    'icon' => 'solar:dialog-bold',
                ],
                [
                    'name' => 'Arabic Grammar (Nahw)',
                    'description' => 'Arabic syntax and structure rules',
                    'icon' => 'solar:tuning-bold-duotone',
                ],
                [
                    'name' => 'Arabic Morphology (Sarf)',
                    'description' => 'Arabic word formation and verb conjugation patterns',
                    'icon' => 'solar:square-share-line-bold',
                ],
            ],
            'Tech' => [
                [
                    'name' => 'Web Development',
                    'description' => 'Building websites and web applications using HTML, CSS, JavaScript, React, etc.',
                    'icon' => 'solar:code-bold',
                ],
                [
                    'name' => 'Python Programming',
                    'description' => 'General purpose programming, scripts, automation, and basics',
                    'icon' => 'solar:programming-bold',
                ],
                [
                    'name' => 'Mobile App Development',
                    'description' => 'Building apps for iOS and Android using Flutter, React Native, or native Swift/Kotlin',
                    'icon' => 'solar:smartphone-bold',
                ],
                [
                    'name' => 'UI/UX Design',
                    'description' => 'User interface and experience design using Figma, wireframing, and prototyping',
                    'icon' => 'solar:palette-bold',
                ],
                [
                    'name' => 'Data Science & AI',
                    'description' => 'Data analysis, statistics, machine learning, and AI applications',
                    'icon' => 'solar:cpu-bold',
                ],
                [
                    'name' => 'Cybersecurity',
                    'description' => 'Network security, ethical hacking, defense strategies, and online protection',
                    'icon' => 'solar:shield-keyhole-bold',
                ],
            ],
            'Marketing' => [
                [
                    'name' => 'Digital Marketing',
                    'description' => 'Overview of online advertising, funnel design, and online presence',
                    'icon' => 'solar:globus-bold',
                ],
                [
                    'name' => 'Search Engine Optimization (SEO)',
                    'description' => 'Optimizing search engine visibility, keyword research, and on-page/off-page tuning',
                    'icon' => 'solar:ranking-bold',
                ],
                [
                    'name' => 'Social Media Marketing',
                    'description' => 'Growing brands on platforms like Instagram, TikTok, LinkedIn, and Facebook',
                    'icon' => 'solar:share-circle-bold',
                ],
                [
                    'name' => 'Copywriting & Content Marketing',
                    'description' => 'Writing persuasive sales copy and high-value educational content',
                    'icon' => 'solar:pen-bold',
                ],
                [
                    'name' => 'Brand Strategy',
                    'description' => 'Developing unique brand identities, positioning, and target audience alignment',
                    'icon' => 'solar:crown-bold',
                ],
            ],
            'Education' => [
                [
                    'name' => 'Teaching Methods & Pedagogy',
                    'description' => 'Modern learning theories, classroom management, and teaching methodologies',
                    'icon' => 'solar:diploma-bold',
                ],
                [
                    'name' => 'Special Education',
                    'description' => 'Methods for teaching students with diverse learning needs and abilities',
                    'icon' => 'solar:accessibility-bold',
                ],
                [
                    'name' => 'Early Childhood Education',
                    'description' => 'Teaching and nurturing young children (ages 2 to 8)',
                    'icon' => 'solar:smile-circle-bold',
                ],
                [
                    'name' => 'Curriculum Development',
                    'description' => 'Designing educational courses, syllabus planning, and assessments',
                    'icon' => 'solar:notebook-bold',
                ],
                [
                    'name' => 'Educational Leadership',
                    'description' => 'School administration, principal/leadership training, and educational policy',
                    'icon' => 'solar:users-group-rounded-bold',
                ],
            ],
            'Crypto' => [
                [
                    'name' => 'Blockchain Fundamentals',
                    'description' => 'Core concepts of distributed ledgers, cryptography, and consensus mechanisms',
                    'icon' => 'solar:link-bold',
                ],
                [
                    'name' => 'Smart Contract Development',
                    'description' => 'Programming on-chain logic using Solidity or Rust (Ethereum, Solana, etc.)',
                    'icon' => 'solar:code-file-bold',
                ],
                [
                    'name' => 'Decentralized Finance (DeFi)',
                    'description' => 'Understanding automated market makers, lending pools, yield farming, and decentralized exchanges',
                    'icon' => 'solar:card-transfer-bold',
                ],
                [
                    'name' => 'Cryptocurrency Trading',
                    'description' => 'Technical analysis, risk management, order types, and trading strategies',
                    'icon' => 'solar:graph-up-bold',
                ],
                [
                    'name' => 'Web3 Development',
                    'description' => 'Integrating frontend interfaces with smart contracts using Ethers.js, Wagmi, or Web3.js',
                    'icon' => 'solar:server-bold',
                ],
            ],
        ];

        $order = 1;
        foreach ($categories as $categoryName => $subjects) {
            foreach ($subjects as $subject) {
                Subject::create([
                    'name' => $subject['name'],
                    'slug' => Str::slug($subject['name']),
                    'category' => $categoryName,
                    'description' => $subject['description'],
                    'icon' => $subject['icon'],
                    'is_active' => true,
                    'display_order' => $order++,
                ]);
            }
        }
    }
}
