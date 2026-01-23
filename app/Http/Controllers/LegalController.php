<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use Inertia\Inertia;

class LegalController extends Controller
{
    public function terms()
    {
        return Inertia::render('Legal/Terms', [
            'content' => SystemSetting::get('terms_conditions', 'Terms & Conditions content coming soon.'),
        ]);
    }

    public function privacy()
    {
        return Inertia::render('Legal/Privacy', [
            'content' => SystemSetting::get('privacy_policy', 'Privacy Policy content coming soon.'),
        ]);
    }
}
