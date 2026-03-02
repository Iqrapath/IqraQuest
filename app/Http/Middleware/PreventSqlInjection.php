<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PreventSqlInjection
{
    /**
     * Suspicious SQL patterns to detect
     */
    protected array $sqlPatterns = [
        '/(\bUNION\b.*\bSELECT\b)/i',
        '/(\bSELECT\b.*\bFROM\b.*\bWHERE\b)/i',
        '/(\bINSERT\b.*\bINTO\b.*\bVALUES\b)/i',
        '/(\bUPDATE\b.*\bSET\b)/i',
        '/(\bDELETE\b.*\bFROM\b)/i',
        '/(\bDROP\b.*\bTABLE\b)/i',
        '/(\bEXEC\b|\bEXECUTE\b)/i',
        '/(;|\-\-|\/\*|\*\/|xp_|sp_)/i',
    ];

    /**
     * The names of the attributes that should not be validated for SQL injection.
     *
     * @var array<int, string>
     */
    protected array $except = [
        'terms_conditions',
        'privacy_policy',
        'answer',
        'notes',
        'comment',
        'description',
        'bio',
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $inputs = $request->all();

        foreach ($inputs as $key => $input) {
            // Skip excepted fields
            if (in_array($key, $this->except)) {
                continue;
            }

            if (is_string($input) && $this->containsSqlInjection($input)) {
                abort(403, 'Suspicious activity detected');
            }
        }

        return $next($request);
    }

    /**
     * Check if input contains SQL injection patterns
     */
    protected function containsSqlInjection(string $input): bool
    {
        foreach ($this->sqlPatterns as $pattern) {
            if (preg_match($pattern, $input)) {
                return true;
            }
        }

        return false;
    }
}
