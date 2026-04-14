<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemActivity;
use App\Services\SystemLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Console\Output\BufferedOutput;
use Illuminate\Support\Facades\File;

class SystemHubController extends Controller
{
    /** @var list<string> Safe maintenance-only Artisan commands (no user-supplied args). */
    private const ALLOWED_ARTISAN = [
        'optimize:clear',
        'cache:clear',
        'config:clear',
        'route:clear',
        'view:clear',
        'queue:restart',
        'migrate:status',
    ];

    /**
     * Display the System Hub dashboard.
     */
    public function index(Request $request)
    {
        $activeTab = $request->query('tab', 'history');
        $data = [
            'filters' => $request->only(['category', 'severity', 'search', 'view']),
            'activeTab' => $activeTab,
            'categories' => ['APP', 'AUTH', 'DB', 'ERROR', 'SEVERE', 'MANUAL'],
            'severities' => ['info', 'warning', 'error', 'critical'],
            'systemInfo' => [
                'php' => PHP_VERSION,
                'laravel' => app()->version(),
                'os' => PHP_OS_FAMILY,
                'environment' => app()->environment(),
                'database' => config('database.default'),
            ]
        ];

        switch ($activeTab) {
            case 'history':
                $data['activities'] = SystemActivity::with('user')
                    ->when($request->category, fn($q) => $q->where('category', $request->category))
                    ->when($request->severity, fn($q) => $q->where('severity', $request->severity))
                    ->when($request->search, function($q) use ($request) {
                        $q->where('description', 'like', "%{$request->search}%")
                          ->orWhere('event_type', 'like', "%{$request->search}%");
                    })
                    ->when($request->view === 'trashed', fn($q) => $q->onlyTrashed())
                    ->latest('id')
                    ->paginate(15)
                    ->withQueryString();
                break;

            case 'queues':
                $data['failedJobs'] = DB::table('failed_jobs')->latest('failed_at')->paginate(10);
                $data['queueStats'] = [
                    'pending' => DB::table('jobs')->count(),
                    'failed' => DB::table('failed_jobs')->count(),
                ];
                break;

            case 'schedules':
                Artisan::call('schedule:list', ['--json' => true], $output = new BufferedOutput());
                $data['scheduledTasks'] = json_decode($output->fetch(), true) ?? [];
                break;

            case 'logs':
                $logPath = storage_path('logs');
                $files = File::files($logPath);
                $data['logFiles'] = collect($files)->map(fn($f) => [
                    'name' => $f->getFilename(),
                    'size' => round($f->getSize() / 1024, 2) . ' KB',
                    'modified' => date('Y-m-d H:i:s', $f->getMTime()),
                ])->sortByDesc('modified')->values();

                $resolvedLog = $this->resolveSafeLogPath($request->query('log_file'));
                if ($resolvedLog !== null) {
                    $data['logContent'] = $this->readLastLines($resolvedLog, 200);
                    $data['currentLogFile'] = basename($resolvedLog);
                }
                break;

            case 'terminal':
                // Initial data for terminal could be previous command logs or stats
                $data['terminalHistory'] = SystemActivity::where('event_type', 'TERMINAL_EXECUTION')
                    ->latest()
                    ->take(5)
                    ->get();
                break;
        }

        return Inertia::render('Admin/System/Hub', $data);
    }

    /**
     * Show form to add a manual note.
     */
    public function create()
    {
        return Inertia::render('Admin/System/ActivityCreate', [
            'severities' => ['info', 'warning', 'error', 'critical']
        ]);
    }

    /**
     * Show detailed view for a specific log.
     */
    public function show($id)
    {
        $activity = SystemActivity::with('user')->withTrashed()->findOrFail($id);
        
        return Inertia::render('Admin/System/Show', [
            'activity' => $activity
        ]);
    }

    /**
     * Create manual log entry.
     */
    public function store(Request $request)
    {
        $request->validate([
            'event_type' => 'required|string|max:100',
            'description' => 'required|string',
            'severity' => 'required|in:info,warning,error,critical',
        ]);

        SystemLogService::log(
            'MANUAL',
            $request->event_type,
            $request->description,
            null,
            $request->severity,
            ['manual_entry' => true, 'admin_id' => Auth::id()]
        );

        return redirect()->route('admin.system.hub')->with('success', 'Manual note added to system log.');
    }

    /**
     * Add a comment/correction to a log instead of editing original.
     */
    public function update(Request $request, $id)
    {
        $request->validate(['correction' => 'required|string']);
        
        $activity = SystemActivity::findOrFail($id);
        $metadata = $activity->metadata ?? [];
        $metadata['corrections'][] = [
            'admin' => Auth::user()->name,
            'note' => $request->correction,
            'at' => now()->toDateTimeString()
        ];
        
        $activity->update(['metadata' => $metadata]);

        return back()->with('success', 'Correction note appended to log.');
    }

    /**
     * Soft delete a log (Move to Trash).
     */
    public function destroy($id)
    {
        $activity = SystemActivity::findOrFail($id);
        $activity->delete();

        return back()->with('success', 'Log entry moved to trash.');
    }

    /**
     * Restore a log from trash.
     */
    public function restore($id)
    {
        $activity = SystemActivity::onlyTrashed()->findOrFail($id);
        $activity->restore();

        return back()->with('success', 'Log entry restored to active list.');
    }

    /**
     * Execute a server command from the web terminal.
     */
    public function executeCommand(Request $request)
    {
        // Disable timeout for long-running commands (migrations, deep audits, etc.)
        set_time_limit(0);
        ignore_user_abort(true);

        $request->validate([
            'command' => 'required|string',
        ]);

        $commandRaw = trim($request->command);
        $output = new BufferedOutput();
        
        // Custom "virtual" commands
        if ($commandRaw === 'help') {
            $artisanList = collect(self::ALLOWED_ARTISAN)
                ->map(fn (string $c) => "- php artisan {$c}")
                ->implode("\n");

            return response()->json([
                'output' => "AVAILABLE PROTOCOLS:\n" .
                           "Artisan (allowlist only):\n" .
                           $artisanList . "\n" .
                           "- ls / dir              : List directory contents (sandboxed)\n" .
                           "- whoami / date         : System identity and time\n" .
                           "- php -v                : Runtime version audit\n" .
                           "- health / cleanup      : Health snapshot / optimize:clear\n" .
                           "- clear                 : Reset pipeline buffer (client)\n" .
                           "- history               : Recent terminal commands (audit)\n" .
                           "Note: Arbitrary php artisan commands are not allowed from the web UI.",
                'status' => 'success'
            ]);
        }

        if ($commandRaw === 'clear') {
            return response()->json(['output' => '', 'status' => 'success']);
        }

        if ($commandRaw === 'history') {
            $logs = SystemActivity::where('event_type', 'TERMINAL_EXECUTION')
                ->latest()
                ->take(15)
                ->get()
                ->map(fn($log) => str_replace('Admin ' . Auth::user()->name . ' initiated: ', '', $log->description))
                ->reverse()
                ->implode("\n");
            
            return response()->json([
                'output' => "TERMINAL INSTRUCTION HISTORY:\n" . ($logs ?: "(No history found)"),
                'status' => 'success'
            ]);
        }

        if ($commandRaw === 'health') {
            $dbStatus = \DB::connection()->getPdo() ? 'ONLINE' : 'OFFLINE';
            $checkPath = base_path();
            $freeBytes = @disk_free_space($checkPath);
            $totalBytes = @disk_total_space($checkPath);
            $freeGb = $freeBytes !== false ? round($freeBytes / (1024 * 1024 * 1024), 2) : 'n/a';
            $totalGb = $totalBytes !== false ? round($totalBytes / (1024 * 1024 * 1024), 2) : 'n/a';
            return response()->json([
                'output' => "VITAL SIGNS:\n" .
                           "- Database  : $dbStatus\n" .
                           "- App Name  : " . config('app.name') . "\n" .
                           "- Timezone  : " . config('app.timezone') . "\n" .
                           "- Disk ({$checkPath})\n" .
                           "  Free : {$freeGb} GB\n" .
                           "  Total : {$totalGb} GB",
                'status' => 'success'
            ]);
        }

        if ($commandRaw === 'cleanup') {
            Artisan::call('optimize:clear', [], $output);
            return response()->json([
                'output' => "CLEANUP INITIATED:\n" . $output->fetch(),
                'status' => 'success'
            ]);
        }

        if ($commandRaw === 'whoami') {
            $user = Auth::user();
            return response()->json([
                'output' => "IDENTITY:\n" .
                           "- Name: " . $user->name . "\n" .
                           "- Rank: " . $user->role . "\n" .
                           "- Session ID: " . session()->getId(),
                'status' => 'success'
            ]);
        }

        // Logging the attempt
        SystemLogService::info('TERMINAL_EXECUTION', "Admin " . Auth::user()->name . " initiated: $commandRaw");

        try {
            // 1. Allowlisted Artisan only (no user-supplied arguments)
            if (str_starts_with($commandRaw, 'php artisan ')) {
                $artisanOutput = $this->runAllowlistedArtisan($commandRaw, $output);
                if ($artisanOutput === false) {
                    return response()->json([
                        'output' => "BLOCKAGE: That Artisan command is not allowed, or extra arguments are not permitted. Type 'help' for the allowlist.",
                        'status' => 'blocked',
                    ]);
                }
                $result = $artisanOutput;
            }
            // 2. Restricted Shell Commands (Whitelist)
            elseif (in_array($commandRaw, ['ls', 'dir', 'whoami', 'date', 'php -v'])) {
                if ($commandRaw === 'date' && PHP_OS_FAMILY === 'Windows') {
                    $result = shell_exec('date /t') . ' ' . shell_exec('time /t');
                } elseif ($commandRaw === 'ls' && PHP_OS_FAMILY === 'Windows') {
                    $result = shell_exec('dir');
                } else {
                    $result = shell_exec($commandRaw);
                }
            }
            else {
                return response()->json([
                    'output' => "BLOCKAGE: Command '$commandRaw' not authorized. Use 'help' for safe protocols.",
                    'status' => 'blocked'
                ]);
            }

            return response()->json([
                'output' => $result ?: "EXECUTION COMPLETE: (No return signal)",
                'status' => 'success'
            ]);

        } catch (\Exception $e) {
            SystemLogService::error('TERMINAL_EXEC_FAILURE', "Command error: $commandRaw", ['msg' => $e->getMessage()]);
            
            return response()->json([
                'output' => "FATAL ERROR: " . $e->getMessage(),
                'status' => 'error'
            ]);
        }
    }

    /**
     * Retry a specific failed job.
     */
    public function retryJob($id)
    {
        Artisan::call('queue:retry', ['id' => [$id]]);
        
        SystemLogService::warning('QUEUE_MANAGEMENT', "Admin " . Auth::user()->name . " retried failed job ID: $id");

        return back()->with('success', "Job #$id has been re-queued for execution.");
    }

    /**
     * Retry all failed jobs.
     */
    public function retryAllTasks()
    {
        Artisan::call('queue:retry', ['id' => ['all']]);
        
        SystemLogService::warning('QUEUE_MANAGEMENT', "Admin " . Auth::user()->name . " initiated mass job retry.");

        return back()->with('success', "All failed jobs have been re-queued.");
    }

    /**
     * Purge a specific failed job record.
     */
    public function deleteFailedJob($id)
    {
        DB::table('failed_jobs')->where('id', $id)->delete();
        
        SystemLogService::info('QUEUE_MANAGEMENT', "Admin " . Auth::user()->name . " purged failed job record ID: $id");

        return back()->with('success', "Failed job record #$id has been purged.");
    }

    /**
     * Export log files as a specialized download.
     */
    public function exportLogs(Request $request)
    {
        $resolved = $this->resolveSafeLogPath($request->query('log_file'));
        if ($resolved !== null) {
            return response()->download($resolved);
        }

        $fallback = $this->resolveSafeLogPath('laravel.log');
        if ($fallback !== null) {
            return response()->download($fallback);
        }

        abort(404, 'No log file available.');
    }

    /**
     * Run a single allowlisted Artisan command with no user-provided arguments.
     *
     * @return string|false Output on success, false if not allowlisted or malformed
     */
    private function runAllowlistedArtisan(string $commandRaw, BufferedOutput $output): string|false
    {
        $rest = trim(substr($commandRaw, strlen('php artisan ')));
        if ($rest === '' || preg_match('/[\r\n;|&`$<>]/', $rest)) {
            return false;
        }

        $parts = preg_split('/\s+/', $rest);
        $name = $parts[0] ?? '';
        if ($name === '' || count($parts) > 1) {
            return false;
        }

        if (! in_array($name, self::ALLOWED_ARTISAN, true)) {
            return false;
        }

        $options = $name === 'migrate:status' ? ['--no-interaction' => true] : [];

        Artisan::call($name, $options, $output);

        return $output->fetch();
    }

    /**
     * Resolve a log filename to a real path confined to storage/logs.
     */
    private function resolveSafeLogPath(?string $requested): ?string
    {
        if ($requested === null || $requested === '') {
            return null;
        }

        $name = basename($requested);
        if ($name === '' || $name === '.' || $name === '..') {
            return null;
        }

        if (! preg_match('/^[a-zA-Z0-9._-]+\.log$/', $name)) {
            return null;
        }

        $dir = storage_path('logs');
        if (! is_dir($dir)) {
            return null;
        }

        $realDir = realpath($dir);
        if ($realDir === false) {
            return null;
        }

        $fullPath = $realDir.DIRECTORY_SEPARATOR.$name;
        if (! is_file($fullPath)) {
            return null;
        }

        $realFile = realpath($fullPath);
        if ($realFile === false || ! str_starts_with($realFile, $realDir)) {
            return null;
        }

        return $realFile;
    }

    /**
     * Cross-platform log tailing using native PHP.
     */
    private function readLastLines($path, $lines)
    {
        if (!File::exists($path)) return "File not found.";
        
        $file = new \SplFileObject($path, 'r');
        $file->seek(PHP_INT_MAX);
        $totalLines = $file->key();
        
        $start = max(0, $totalLines - $lines);
        $file->seek($start);
        
        $content = "";
        while (!$file->eof()) {
            $content .= $file->fgets();
        }
        
        return $content ?: "No data found in protocol file.";
    }
}
