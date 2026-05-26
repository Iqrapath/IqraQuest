<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\SystemSetting;
use App\Models\PaymentSetting;
use App\Models\FAQ;
use App\Models\User;
use App\Models\Subject;
use App\Enums\UserRole;
use App\Constants\Permissions;
use App\Support\LegalHtmlSanitizer;
use App\Notifications\TermsUpdatedNotification;
use App\Notifications\AdminCredentialsNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification as NotificationFacade;
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
            'faqs' => FAQ::orderBy('order')->get(),
            'subjects' => Subject::ordered()->paginate(10)->withQueryString(),
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
            'show_support_email' => 'boolean',
            'show_office_address' => 'boolean',
            'show_contact_number' => 'boolean',
            'show_whatsapp_number' => 'boolean',
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
            $group = in_array($key, [
                'site_name',
                'support_email',
                'office_address',
                'contact_number',
                'whatsapp_number',
                'show_support_email',
                'show_office_address',
                'show_contact_number',
                'show_whatsapp_number'
            ]) ? 'general' : 'localization';

            $type = is_bool($value) || $value === 'true' || $value === 'false' || in_array($key, ['show_support_email', 'show_office_address', 'show_contact_number', 'show_whatsapp_number']) ? 'boolean' : 'string';
            $valueToSave = $type === 'boolean' ? filter_var($value, FILTER_VALIDATE_BOOLEAN) : $value;

            SystemSetting::set($key, $valueToSave, $group, $type);
        }

        return back()->with('success', 'General settings updated successfully.');
    }

    /**
     * Update Legal Settings (T&C, Privacy Policy).
     */
    public function updateLegal(Request $request)
    {
        $validated = $request->validate([
            'terms_conditions' => 'nullable|string',
            'privacy_policy' => 'nullable|string',
            'tc_send_email' => 'nullable|boolean',
            'tc_send_dashboard' => 'nullable|boolean',
        ]);

        foreach ($validated as $key => $value) {
            $type = is_bool($value) ? 'boolean' : 'string';
            if ($type === 'string' && in_array($key, ['terms_conditions', 'privacy_policy'], true)) {
                $value = LegalHtmlSanitizer::sanitize($value);
            }
            SystemSetting::set($key, $value, 'legal', $type);
        }

        // Handle Notifications if requested
        if ($request->tc_send_email || $request->tc_send_dashboard) {
            $users = User::all();
            NotificationFacade::send(
                $users,
                new TermsUpdatedNotification(
                    (bool) $request->tc_send_email,
                    (bool) $request->tc_send_dashboard
                )
            );

            // Reset flags to avoid double sending on next save
            SystemSetting::set('tc_send_email', false, 'legal', 'boolean');
            SystemSetting::set('tc_send_dashboard', false, 'legal', 'boolean');
        }

        return back()->with('success', 'Legal settings updated successfully.');
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
            'phone' => 'nullable|string|max:20',
            'role_id' => 'required|exists:roles,id',
            'password' => $id ? 'nullable|min:8' : 'required|min:8',
            'avatar' => 'nullable|image|max:2048',
            'full_access' => 'nullable|boolean',
            'permissions' => 'nullable|string', // JSON string
            'send_via_email' => 'nullable|boolean',
            'send_via_sms' => 'nullable|boolean',
        ]);

        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role_id' => $validated['role_id'],
            'role' => UserRole::ADMIN,
            'email_verified_at' => now(), // Auto-verify admin accounts
        ];

        if (!empty($validated['password'])) {
            $userData['password'] = Hash::make($validated['password']);
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $userData['avatar'] = $avatarPath;
        }

        $user = User::updateOrCreate(['id' => $id], $userData);

        // Store custom permissions if provided
        if (isset($validated['permissions'])) {
            $permissions = json_decode($validated['permissions'], true) ?? [];
            // TODO: Store permissions in a pivot table or JSON column if needed
        }

        // Send credentials via email if requested
        if ($request->boolean('send_via_email') && !$id && !empty($validated['password'])) {
            $user->notify(new AdminCredentialsNotification($validated['password']));
        }

        return back()->with('success', $id ? 'Admin updated.' : 'Admin created.');
    }

    protected function getGroupedSettings()
    {
        return SystemSetting::all()->groupBy('group')->map(function ($group) {
            return $group->pluck('value', 'key');
        });
    }

    /**
     * Delete Admin.
     */
    public function deleteAdmin($id)
    {
        $user = User::where('id', $id)->where('role', UserRole::ADMIN)->firstOrFail();

        // Prevent deleting self or Super Admin
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete yourself.');
        }

        if ($user->isSuperAdmin()) {
            return back()->with('error', 'Cannot delete a Super Admin.');
        }

        $user->delete();

        return back()->with('success', 'Admin deleted successfully.');
    }

    /**
     * Toggle Admin Status (Active/Suspended).
     */
    public function toggleAdminStatus($id)
    {
        $user = User::where('id', $id)->where('role', UserRole::ADMIN)->firstOrFail();

        // Prevent suspending self or Super Admin
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot suspend yourself.');
        }

        if ($user->isSuperAdmin()) {
            return back()->with('error', 'Cannot suspend a Super Admin.');
        }

        $user->status = $user->status === 'active' ? 'suspended' : 'active';
        $user->save();

        return back()->with('success', 'Admin status updated to ' . $user->status . '.');
    }

    /**
     * Save/Create a Subject
     */
    public function saveSubject(Request $request)
    {
        $validated = $request->validate([
            'id' => 'nullable|exists:subjects,id',
            'name' => 'required|string|max:100',
            'category' => 'nullable|string|in:Quran,Arabic,Tech,Marketing,Education,Crypto',
            'description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:50',
            'display_order' => 'required|integer',
            'is_active' => 'boolean',
        ]);

        $subjectData = [
            'name' => $validated['name'],
            'slug' => \Illuminate\Support\Str::slug($validated['name']),
            'category' => $validated['category'] ?? null,
            'description' => $validated['description'] ?? null,
            'icon' => $validated['icon'] ?? null,
            'display_order' => $validated['display_order'],
            'is_active' => $request->boolean('is_active', true),
        ];

        if (isset($validated['id'])) {
            $subject = Subject::findOrFail($validated['id']);
            $subject->update($subjectData);
            $message = 'Subject updated successfully.';
        } else {
            Subject::create($subjectData);
            $message = 'Subject created successfully.';
        }

        return back()->with('success', $message);
    }

    /**
     * Delete a Subject
     */
    public function deleteSubject($id)
    {
        $subject = Subject::findOrFail($id);

        // Prevent deletion if teachers are already linked
        if ($subject->teachers()->exists()) {
            return back()->with('error', 'Cannot delete a subject that is currently assigned to teachers.');
        }

        $subject->delete();

        return back()->with('success', 'Subject deleted successfully.');
    }

    /**
     * Toggle Subject Status
     */
    public function toggleSubjectStatus($id)
    {
        $subject = Subject::findOrFail($id);
        $subject->is_active = !$subject->is_active;
        $subject->save();

        $statusName = $subject->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Subject $statusName successfully.");
    }
}
