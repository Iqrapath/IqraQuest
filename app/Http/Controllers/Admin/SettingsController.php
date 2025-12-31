<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\SystemSetting;
use App\Models\PaymentSetting;
use App\Models\User;
use App\Enums\UserRole;
use App\Constants\Permissions;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    /**
     * Display settings and security page.
     */
    public function index(Request $request)
    {
        $activeTab = $request->input('tab', 'general');

        // Check if user has permission for the tab (Super Admin can see all)
        if (!auth()->user()->isSuperAdmin() && !auth()->user()->hasPermission('settings.view')) {
            abort(403);
        }

        return Inertia::render('Admin/Settings/Index', [
            'activeTab' => $activeTab,
            'settings' => $this->getGroupedSettings(),
            'paymentSettings' => PaymentSetting::first(),
            'roles' => Role::withCount('users')->get(),
            'admins' => User::where('role', UserRole::ADMIN)->with('roleDetail')->get(),
            'availablePermissions' => Permissions::getAllGrouped(),
        ]);
    }

    /**
     * Update General/Localization Settings.
     */
    public function updateGeneral(Request $request)
    {
        $validated = $request->validate([
            'site_name' => 'nullable|string|max:255',
            'support_email' => 'nullable|email|max:255',
            'office_address' => 'nullable|string|max:500',
            'contact_number' => 'nullable|string|max:20',
            'whatsapp_number' => 'nullable|string|max:20',
            'language' => 'nullable|string|max:10',
            'timezone' => 'nullable|string|max:50',
            'date_format' => 'nullable|string|max:20',
            'default_landing_page' => 'nullable|string|max:50',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        // Handle Logo Upload
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('branding', 'public');
            SystemSetting::set('site_logo', $path, 'general');
        }

        // Save individual settings
        $settings = array_filter($validated, fn($key) => $key !== 'logo', ARRAY_FILTER_USE_KEY);

        foreach ($settings as $key => $value) {
            $group = in_array($key, ['site_name', 'support_email', 'office_address', 'contact_number', 'whatsapp_number']) 
                ? 'general' 
                : 'localization';
            
            SystemSetting::set($key, $value, $group);
        }

        return back()->with('success', 'General settings updated successfully.');
    }

    /**
     * Update Feature Toggles.
     */
    public function updateFeatures(Request $request)
    {
        $request->validate([
            'toggles' => 'required|array',
        ]);

        foreach ($request->toggles as $key => $value) {
            SystemSetting::set($key, $value, 'feature_controls', 'boolean');
        }

        return back()->with('success', 'Feature controls updated successfully.');
    }

    /**
     * Role Management: Create/Update Role.
     */
    public function saveRole(Request $request)
    {
        $id = $request->input('id');
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', Rule::unique('roles', 'slug')->ignore($id)],
            'permissions' => 'nullable|array',
        ]);

        Role::updateOrCreate(
            ['id' => $id],
            [
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'permissions' => $validated['permissions'] ?? [],
            ]
        );

        return back()->with('success', $id ? 'Role updated.' : 'Role created.');
    }

    /**
     * Manage Admin Staff.
     */
    public function saveAdmin(Request $request)
    {
        $id = $request->input('id');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($id)],
            'role_id' => 'required|exists:roles,id',
            'password' => $id ? 'nullable|min:8' : 'required|min:8',
        ]);

        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role_id' => $validated['role_id'],
            'role' => UserRole::ADMIN,
        ];

        if ($validated['password']) {
            $userData['password'] = Hash::make($validated['password']);
        }

        User::updateOrCreate(['id' => $id], $userData);

        return back()->with('success', $id ? 'Admin updated.' : 'Admin created.');
    }

    protected function getGroupedSettings()
    {
        return SystemSetting::all()->groupBy('group')->map(function ($group) {
            return $group->pluck('value', 'key');
        });
    }
}
