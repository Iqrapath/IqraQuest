<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Teacher;
use App\Models\Subject;
use App\Models\Review;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TeacherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all available subjects
        $subjects = Subject::all();

        if ($subjects->isEmpty()) {
            $this->command->warn('No subjects found. Please run SubjectSeeder first.');
            return;
        }

        // Ensure we have a student for reviews AND bookings
        $studentUser = User::find(4);
        if (!$studentUser) {
             $studentUser = User::factory()->create([
                 'id' => 4, // Force ID 4 to match existing logic if safely possible
                 'name' => 'Demo Student',
                 'email' => 'student@iqraquest.com',
                 'role' => \App\Enums\UserRole::STUDENT,
             ]);
        }

        // SEED WALLET FOR STUDENT (Payment Method)
        // Check if wallet exists, if not create with balance
        $wallet = DB::table('wallets')->where('user_id', 4)->first();
        if (!$wallet) {
            DB::table('wallets')->insert([
                'user_id' => 4,
                'balance' => 500000.00, // 500k Demo Funds
                'currency' => 'NGN',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->command->info('Seeded wallet for Demo Student with 500,000 NGN');
        }

        // Create 15 demo teachers with comprehensive data
        $teachers = [
            [
                'name' => 'Dr. Ahmed Hassan',
                'email' => 'ahmed.hassan@iqraquest.com',
                'bio' => 'Ph.D. in Islamic Studies with 15 years of teaching experience. Specialized in Quranic interpretation and Arabic linguistics.',
                'experience_years' => 15,
                'hourly_rate' => 25000,
                'subjects' => ['Hifz', 'Arabic Language', 'Tafsir'],
                'proficiency' => 'expert',
                'city' => 'Cairo',
                'country' => 'Egypt',
                'qualifications' => 'Ph.D. Islamic Studies, Al-Azhar University',
                'specializations' => ['Tafseer', 'Linguistics'],
                'languages' => 'Arabic, English',
            ],
            [
                'name' => 'Ustadha Fatima Al-Zahra',
                'email' => 'fatima.zahra@iqraquest.com',
                'bio' => 'Certified Quranic instructor with Ijazah in multiple Qiraat. Expert in Tajweed and memorization techniques.',
                'experience_years' => 10,
                'hourly_rate' => 20000,
                'subjects' => ['Hifz', 'Tajweed'],
                'proficiency' => 'expert',
                'city' => 'Madinah',
                'country' => 'Saudi Arabia',
                'qualifications' => 'Ijazah in Hafs and Warsh',
                'specializations' => ['Tajweed', 'Hifz'],
                'languages' => 'Arabic, English',
            ],
            [
                'name' => 'Sheikh Ibrahim Malik',
                'email' => 'ibrahim.malik@iqraquest.com',
                'bio' => 'Islamic scholar with extensive knowledge in Fiqh and Hadith. Teaching for over 12 years.',
                'experience_years' => 12,
                'hourly_rate' => 22000,
                'subjects' => ['Fiqh', 'Hadith', 'Islamic History'],
                'proficiency' => 'expert',
                'city' => 'Amman',
                'country' => 'Jordan',
                'qualifications' => 'Masters in Fiqh',
                'specializations' => ['Fiqh', 'Hadith'],
                'languages' => 'Arabic, English',
            ],
            [
                'name' => 'Ustadha Aisha Rahman',
                'email' => 'aisha.rahman@iqraquest.com',
                'bio' => 'Specialist in teaching children Quran and Islamic values. Patient and experienced with young learners.',
                'experience_years' => 8,
                'hourly_rate' => 15000,
                'subjects' => ['Quran for Beginners', 'Islamic Studies for Kids'],
                'proficiency' => 'advanced',
                'city' => 'London',
                'country' => 'UK',
                'qualifications' => 'Bachelor in Education',
                'specializations' => ['Kids Education', 'Basics'],
                'languages' => 'English, Urdu',
            ],
            [
                'name' => 'Ustadh Omar Abdullah',
                'email' => 'omar.abdullah@iqraquest.com',
                'bio' => 'Arabic language expert and Quran teacher. Fluent in English, Arabic, and Urdu.',
                'experience_years' => 7,
                'hourly_rate' => 18000,
                'subjects' => ['Arabic Language', 'Tajweed'],
                'proficiency' => 'advanced',
                'city' => 'Dubai',
                'country' => 'UAE',
                'qualifications' => 'BA Arabic Literature',
                'specializations' => ['Arabic Grammar', 'Conversation'],
                'languages' => 'Arabic, English, Urdu',
            ],
            [
                'name' => 'Dr. Khadija Noor',
                'email' => 'khadija.noor@iqraquest.com',
                'bio' => 'Ph.D. in Islamic History. Passionate about teaching Islamic civilization and culture.',
                'experience_years' => 11,
                'hourly_rate' => 21000,
                'subjects' => ['Islamic History', 'Seerah'],
                'proficiency' => 'expert',
                'city' => 'Istanbul',
                'country' => 'Turkey',
                'qualifications' => 'Ph.D. History',
                'specializations' => ['History', 'Culture'],
                'languages' => 'Turkish, English, Arabic',
            ],
            [
                'name' => 'Ustadh Yusuf Ali',
                'email' => 'yusuf.ali@iqraquest.com',
                'bio' => 'Tajweed specialist with certification from Al-Azhar University. Helping students perfect their recitation.',
                'experience_years' => 9,
                'hourly_rate' => 19000,
                'subjects' => ['Tajweed', 'Qira\'at'],
                'proficiency' => 'expert',
                'city' => 'Cairo',
                'country' => 'Egypt',
                'qualifications' => 'Al-Azhar Certification',
                'specializations' => ['Tajweed Rules'],
                'languages' => 'Arabic, English',
            ],
            [
                'name' => 'Ustadha Maryam Saleh',
                'email' => 'maryam.saleh@iqraquest.com',
                'bio' => 'Passionate about teaching Islamic ethics and character building. Expert in Adab and Akhlaq.',
                'experience_years' => 6,
                'hourly_rate' => 16000,
                'subjects' => ['Akhlaq', 'Adab'],
                'proficiency' => 'advanced',
                'city' => 'Kuala Lumpur',
                'country' => 'Malaysia',
                'qualifications' => 'BA Islamic Studies',
                'specializations' => ['Ethics', 'Character Building'],
                'languages' => 'Malay, English',
            ],
            [
                'name' => 'Sheikh Hassan Farooq',
                'email' => 'hassan.farooq@iqraquest.com',
                'bio' => 'Hadith scholar graduated from Islamic University of Madinah. Teaching authentic Islamic knowledge.',
                'experience_years' => 14,
                'hourly_rate' => 24000,
                'subjects' => ['Hadith', 'Fiqh'],
                'proficiency' => 'expert',
                'city' => 'Madinah',
                'country' => 'Saudi Arabia',
                'qualifications' => 'Madinah University Graduate',
                'specializations' => ['Hadith Studies'],
                'languages' => 'Arabic, Urdu, English',
            ],
            [
                'name' => 'Ustadha Zaynab Ahmed',
                'email' => 'zaynab.ahmed@iqraquest.com',
                'bio' => 'Quran teacher for sisters with special focus on Hifz programs and memorization.',
                'experience_years' => 5,
                'hourly_rate' => 14000,
                'subjects' => ['Hifz', 'Tajweed'],
                'proficiency' => 'advanced',
                'city' => 'Toronto',
                'country' => 'Canada',
                'qualifications' => 'Hifz Certificate',
                'specializations' => ['Hifz', 'Memorization'],
                'languages' => 'English, Somali',
            ],
            [
                'name' => 'Ustadh Bilal Khan',
                'email' => 'bilal.khan@iqraquest.com',
                'bio' => 'Islamic studies teacher with modern teaching methods. Making learning engaging and fun.',
                'experience_years' => 4,
                'hourly_rate' => 12000,
                'subjects' => ['Islamic Stories', 'Quran for Beginners'],
                'proficiency' => 'intermediate',
                'city' => 'Manchester',
                'country' => 'UK',
                'qualifications' => 'Diploma in Education',
                'specializations' => ['Youth Education'],
                'languages' => 'English',
            ],
            [
                'name' => 'Dr. Amina Bashir',
                'email' => 'amina.bashir@iqraquest.com',
                'bio' => 'Ph.D. in Quranic Sciences. Research focused on Tafseer and Quranic exegesis.',
                'experience_years' => 13,
                'hourly_rate' => 23000,
                'subjects' => ['Tafsir', 'Uloom al-Quran', 'Islamic History'],
                'proficiency' => 'expert',
                'city' => 'Islamabad',
                'country' => 'Pakistan',
                'qualifications' => 'Ph.D. Quranic Sciences',
                'specializations' => ['Tafseer'],
                'languages' => 'Urdu, English, Arabic',
            ],
            [
                'name' => 'Ustadh Hamza Idris',
                'email' => 'hamza.idris@iqraquest.com',
                'bio' => 'Arabic language instructor with focus on classical Arabic and Quranic vocabulary.',
                'experience_years' => 6,
                'hourly_rate' => 17000,
                'subjects' => ['Arabic Language', 'Arabic Grammar (Nahw)'],
                'proficiency' => 'advanced',
                'city' => 'Riyadh',
                'country' => 'Saudi Arabia',
                'qualifications' => 'BA Arabic',
                'specializations' => ['Classical Arabic'],
                'languages' => 'Arabic, English, Hausa',
            ],
            [
                'name' => 'Ustadha Hafsa Usman',
                'email' => 'hafsa.usman@iqraquest.com',
                'bio' => 'Dedicated teacher for beginners and children. Patient and encouraging teaching style.',
                'experience_years' => 3,
                'hourly_rate' => 10000,
                'subjects' => ['Quran for Beginners', 'Islamic Studies for Kids'],
                'proficiency' => 'intermediate',
                'city' => 'Lagos',
                'country' => 'Nigeria',
                'qualifications' => 'Certificate in Child Education',
                'specializations' => ['Kids', 'Beginners'],
                'languages' => 'English, Hausa',
            ],
            [
                'name' => 'Sheikh Abdullah Mahmoud',
                'email' => 'abdullah.mahmoud@iqraquest.com',
                'bio' => 'Senior Islamic scholar with expertise in comparative Fiqh and Islamic jurisprudence.',
                'experience_years' => 20,
                'hourly_rate' => 30000,
                'subjects' => ['Fiqh', 'Usul al-Fiqh', 'Hadith'],
                'proficiency' => 'expert',
                'city' => 'Cairo',
                'country' => 'Egypt',
                'qualifications' => 'Senior Scholar Al-Azhar',
                'specializations' => ['Comparative Fiqh'],
                'languages' => 'Arabic',
            ],
        ];

        foreach ($teachers as $teacherData) {
            // Create user
            $user = User::create([
                'name' => $teacherData['name'],
                'email' => $teacherData['email'],
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'role' => \App\Enums\UserRole::TEACHER,
                'status' => 'active',
            ]);

            // Create teacher profile
            $teacher = Teacher::create([
                'user_id' => $user->id,
                'bio' => $teacherData['bio'],
                'experience_years' => $teacherData['experience_years'],
                'hourly_rate' => $teacherData['hourly_rate'],
                'status' => 'approved',
                'approved_by' => 1, // Admin user
                'approved_at' => now(),
                'city' => $teacherData['city'],
                'country' => $teacherData['country'],
                'qualifications' => $teacherData['qualifications'],
                'specializations' => $teacherData['specializations'],
                'preferred_language' => $teacherData['languages'] ?? 'English',
                'teaching_mode' => 'both',
                'teaching_type' => 'online',
                'timezone' => 'UTC',
            ]);

            // Assign subjects to teacher
            foreach ($teacherData['subjects'] as $subjectName) {
                $subject = $subjects->firstWhere('name', $subjectName);
                if ($subject) {
                    DB::table('teacher_subjects')->insert([
                        'teacher_id' => $teacher->id,
                        'subject_id' => $subject->id,
                        'proficiency_level' => $teacherData['proficiency'],
                        'years_teaching' => $teacherData['experience_years'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // Create availability schedule
            $this->createAvailability($teacher->id);

            // Create payment methods (Dynamic)
            $this->createPaymentMethods($teacher->id);

            // Create reviews for teacher (now enabled)
            if ($studentUser) {
                $this->createReviews($teacher->id, $studentUser->id);
            }

            $this->command->info("Created teacher: {$teacherData['name']} in {$teacherData['city']}");
        }

        $this->command->info('Teacher seeding completed successfully!');
    }

    /**
     * Create availability schedule for teacher
     */
    private function createAvailability(int $teacherId): void
    {
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        $timeSlots = [
            ['start' => '08:00:00', 'end' => '12:00:00'], // Morning
            ['start' => '14:00:00', 'end' => '18:00:00'], // Afternoon
            ['start' => '19:00:00', 'end' => '22:00:00'], // Evening
        ];

        // Randomly make teacher available on 4-6 days
        $availableDays = fake()->randomElements($days, rand(4, 6));

        foreach ($days as $day) {
            $isAvailable = in_array($day, $availableDays);
            $timeSlot = $isAvailable ? fake()->randomElement($timeSlots) : null;

            DB::table('teacher_availability')->insert([
                'teacher_id' => $teacherId,
                'day_of_week' => $day,
                'is_available' => $isAvailable,
                'start_time' => $timeSlot ? $timeSlot['start'] : null,
                'end_time' => $timeSlot ? $timeSlot['end'] : null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Create payment methods for teacher
     */
    private function createPaymentMethods(int $teacherId): void
    {
        // Define possible payment types from migration
        // 'bank_transfer', 'paypal', 'stripe', 'flutterwave', 'paystack'
        
        // Randomly assign 1-3 payment methods
        $methods = fake()->randomElements(['bank_transfer', 'paypal', 'stripe'], rand(1, 3));
        
        foreach ($methods as $method) {
            DB::table('teacher_payment_methods')->insert([
                'teacher_id' => $teacherId,
                'payment_type' => $method,
                'is_primary' => $method === $methods[0], // First one is primary
                'is_verified' => true,
                'verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Create reviews for teacher
     */
    private function createReviews(int $teacherId, int $studentId): void
    {
        $reviewCount = rand(3, 8);

        for ($i = 0; $i < $reviewCount; $i++) {
            Review::create([
                'teacher_id' => $teacherId,
                'user_id' => $studentId,
                'rating' => fake()->randomFloat(1, 3.5, 5.0),
                'comment' => fake()->randomElement([
                    'Excellent teacher! Very patient and knowledgeable.',
                    'Great experience learning with this teacher.',
                    'Very professional and helpful. Highly recommended!',
                    'The lessons were clear and easy to understand.',
                    'Amazing teacher with deep knowledge of the subject.',
                    'Patient and encouraging. My Quran recitation has improved significantly.',
                    'Wonderful teaching style. Makes complex topics simple.',
                    'Very dedicated and punctual teacher.',
                ]),
                'is_approved' => true,
                'created_at' => now()->subDays(rand(1, 90)),
                'updated_at' => now()->subDays(rand(1, 90)),
            ]);
        }
    }
}
