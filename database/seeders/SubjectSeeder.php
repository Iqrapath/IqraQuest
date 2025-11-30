<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjects = [
            // Quran Studies
            [
                'name' => 'Hifz',
                'description' => 'Quran Memorization - Complete memorization of the Holy Quran',
                'display_order' => 1,
            ],
            [
                'name' => 'Tajweed',
                'description' => 'Quran Recitation Rules - Proper pronunciation and recitation of the Quran',
                'display_order' => 2,
            ],
            [
                'name' => 'Tafsir',
                'description' => 'Quran Interpretation - Explanation and commentary of Quranic verses',
                'display_order' => 3,
            ],
            [
                'name' => 'Qira\'at',
                'description' => 'Quranic Recitation Styles - Different authentic methods of Quran recitation',
                'display_order' => 4,
            ],
            [
                'name' => 'Uloom al-Quran',
                'description' => 'Sciences of the Quran - Study of Quranic sciences and methodology',
                'display_order' => 5,
            ],
            
            // Hadith Studies
            [
                'name' => 'Hadith',
                'description' => 'Prophetic Traditions - Study of the sayings and actions of Prophet Muhammad (PBUH)',
                'display_order' => 6,
            ],
            [
                'name' => 'Mustalah al-Hadith',
                'description' => 'Hadith Terminology - Science of hadith authentication and classification',
                'display_order' => 7,
            ],
            [
                'name' => 'Hadith Memorization',
                'description' => 'Memorization of authentic hadiths from major collections',
                'display_order' => 8,
            ],
            
            // Islamic Jurisprudence
            [
                'name' => 'Fiqh',
                'description' => 'Islamic Jurisprudence - Understanding Islamic law and rulings',
                'display_order' => 9,
            ],
            [
                'name' => 'Usul al-Fiqh',
                'description' => 'Principles of Islamic Jurisprudence - Methodology of deriving Islamic rulings',
                'display_order' => 10,
            ],
            [
                'name' => 'Fiqh al-Ibadat',
                'description' => 'Jurisprudence of Worship - Rulings related to prayer, fasting, hajj, etc.',
                'display_order' => 11,
            ],
            [
                'name' => 'Fiqh al-Muamalat',
                'description' => 'Jurisprudence of Transactions - Islamic rulings on business and contracts',
                'display_order' => 12,
            ],
            [
                'name' => 'Fiqh al-Usrah',
                'description' => 'Family Jurisprudence - Islamic rulings on marriage, divorce, inheritance',
                'display_order' => 13,
            ],
            
            // Islamic Creed
            [
                'name' => 'Tawheed',
                'description' => 'Islamic Monotheism - The oneness of Allah and core Islamic beliefs',
                'display_order' => 14,
            ],
            [
                'name' => 'Aqeedah',
                'description' => 'Islamic Creed - Core beliefs and theology in Islam',
                'display_order' => 15,
            ],
            
            // Prophet\'s Biography
            [
                'name' => 'Seerah',
                'description' => 'Biography of the Prophet - Life and teachings of Prophet Muhammad (PBUH)',
                'display_order' => 16,
            ],
            [
                'name' => 'Shama\'il',
                'description' => 'Prophetic Characteristics - Physical and moral attributes of the Prophet',
                'display_order' => 17,
            ],
            
            // Islamic History
            [
                'name' => 'Islamic History',
                'description' => 'History of Islam - From the time of Prophet Muhammad to modern era',
                'display_order' => 18,
            ],
            [
                'name' => 'History of Khulafa',
                'description' => 'History of the Rightly Guided Caliphs and Islamic leadership',
                'display_order' => 19,
            ],
            [
                'name' => 'Islamic Civilization',
                'description' => 'Contributions of Islamic civilization to science, arts, and culture',
                'display_order' => 20,
            ],
            
            // Arabic Language
            [
                'name' => 'Arabic Language',
                'description' => 'Classical and Modern Arabic - Reading, writing, and speaking Arabic',
                'display_order' => 21,
            ],
            [
                'name' => 'Arabic Grammar (Nahw)',
                'description' => 'Arabic Syntax - Study of sentence structure and grammar rules',
                'display_order' => 22,
            ],
            [
                'name' => 'Arabic Morphology (Sarf)',
                'description' => 'Arabic word formation and conjugation patterns',
                'display_order' => 23,
            ],
            [
                'name' => 'Arabic Literature',
                'description' => 'Classical and modern Arabic poetry and prose',
                'display_order' => 24,
            ],
            [
                'name' => 'Balagha',
                'description' => 'Arabic Rhetoric - Eloquence and literary beauty in Arabic',
                'display_order' => 25,
            ],
            
            // Islamic Ethics & Spirituality
            [
                'name' => 'Akhlaq',
                'description' => 'Islamic Ethics - Moral character and behavior in Islam',
                'display_order' => 26,
            ],
            [
                'name' => 'Tasawwuf',
                'description' => 'Islamic Spirituality - Purification of the heart and soul',
                'display_order' => 27,
            ],
            [
                'name' => 'Adab',
                'description' => 'Islamic Manners - Proper etiquette and conduct in Islam',
                'display_order' => 28,
            ],
            
            // Contemporary Islamic Studies
            [
                'name' => 'Islamic Finance',
                'description' => 'Shariah-compliant financial systems and transactions',
                'display_order' => 29,
            ],
            [
                'name' => 'Islamic Economics',
                'description' => 'Economic principles and systems in Islam',
                'display_order' => 30,
            ],
            [
                'name' => 'Comparative Religion',
                'description' => 'Study of Islam in relation to other religions',
                'display_order' => 31,
            ],
            [
                'name' => 'Da\'wah',
                'description' => 'Islamic Propagation - Methods of calling people to Islam',
                'display_order' => 32,
            ],
            [
                'name' => 'Islamic Psychology',
                'description' => 'Mental health and counseling from Islamic perspective',
                'display_order' => 33,
            ],
            
            // Specialized Studies
            [
                'name' => 'Maqasid al-Shariah',
                'description' => 'Objectives of Islamic Law - Higher purposes of Shariah',
                'display_order' => 34,
            ],
            [
                'name' => 'Islamic Inheritance',
                'description' => 'Laws of inheritance and estate distribution in Islam',
                'display_order' => 35,
            ],
            [
                'name' => 'Islamic Astronomy',
                'description' => 'Determining prayer times, Qibla direction, and Islamic calendar',
                'display_order' => 36,
            ],
            [
                'name' => 'Waqf Studies',
                'description' => 'Islamic endowments and charitable trusts',
                'display_order' => 37,
            ],
            
            // Children & Youth
            [
                'name' => 'Islamic Studies for Kids',
                'description' => 'Age-appropriate Islamic education for children',
                'display_order' => 38,
            ],
            [
                'name' => 'Quran for Beginners',
                'description' => 'Basic Quran reading and recitation for beginners',
                'display_order' => 39,
            ],
            [
                'name' => 'Islamic Stories',
                'description' => 'Stories from Quran and Islamic history for children',
                'display_order' => 40,
            ],
        ];

        foreach ($subjects as $subject) {
            Subject::create([
                'name' => $subject['name'],
                'slug' => Str::slug($subject['name']),
                'description' => $subject['description'],
                'is_active' => true,
                'display_order' => $subject['display_order'],
            ]);
        }
    }
}
