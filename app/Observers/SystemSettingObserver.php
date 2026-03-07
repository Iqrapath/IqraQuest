<?php

namespace App\Observers;

use App\Models\SystemSetting;

class SystemSettingObserver
{
    /**
     * Handle the SystemSetting "saved" event.
     */
    public function saved(SystemSetting $systemSetting): void
    {
        SystemSetting::clearInternalCache();
    }

    /**
     * Handle the SystemSetting "deleted" event.
     */
    public function deleted(SystemSetting $systemSetting): void
    {
        SystemSetting::clearInternalCache();
    }
}
