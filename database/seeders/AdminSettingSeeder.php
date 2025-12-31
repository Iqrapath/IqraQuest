<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\SystemSetting;
use App\Constants\Permissions;

class AdminSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Default Roles
        $roles = [
            [
                'name' => 'Super Admin',
                'slug' => 'super-admin',
                'is_system' => true,
                'permissions' => array_keys(array_merge(...array_values(Permissions::getAllGrouped()))),
            ],
            [
                'name' => 'Support Staff',
                'slug' => 'support-staff',
                'is_system' => false,
                'permissions' => [
                    Permissions::TEACHERS_VIEW,
                    Permissions::STUDENTS_VIEW,
                    Permissions::CMS_MANAGE,
                    Permissions::FAQ_MANAGE,
                ],
            ],
            [
                'name' => 'Financial Officer',
                'slug' => 'financial-officer',
                'is_system' => false,
                'permissions' => [
                    Permissions::PAYMENTS_VIEW,
                    Permissions::PAYMENTS_MANAGE,
                    Permissions::PAYOUTS_APPROVE,
                ],
            ],
        ];

        foreach ($roles as $roleData) {
            Role::updateOrCreate(['slug' => $roleData['slug']], $roleData);
        }

        // 2. Create Initial System Settings
        $settings = [
            ['group' => 'general', 'key' => 'site_name', 'value' => 'IQRAQUEST', 'type' => 'string'],
            ['group' => 'general', 'key' => 'support_email', 'value' => 'support@iqrapath.com', 'type' => 'string'],
            ['group' => 'general', 'key' => 'office_address', 'value' => 'Iqrapath Headquarters, Lagos, Nigeria', 'type' => 'string'],
            ['group' => 'general', 'key' => 'contact_number', 'value' => '+2347069731575', 'type' => 'string'],
            ['group' => 'general', 'key' => 'whatsapp_number', 'value' => '+2347069731575', 'type' => 'string'],
            ['group' => 'localization', 'key' => 'language', 'value' => 'en', 'type' => 'string'],
            ['group' => 'localization', 'key' => 'timezone', 'value' => 'Africa/Lagos', 'type' => 'string'],
            ['group' => 'localization', 'key' => 'date_format', 'value' => 'DD/MM/YYYY', 'type' => 'string'],
            ['group' => 'feature_controls', 'key' => 'enable_referral_program', 'value' => '1', 'type' => 'boolean'],
            ['group' => 'feature_controls', 'key' => 'email_verification_on_signup', 'value' => '1', 'type' => 'boolean'],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
