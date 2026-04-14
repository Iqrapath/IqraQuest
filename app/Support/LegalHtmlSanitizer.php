<?php

namespace App\Support;

/**
 * Reduces stored XSS risk for HTML stored by admins (legal copy, FAQ bodies)
 * before it is rendered via dangerouslySetInnerHTML on the frontend.
 */
class LegalHtmlSanitizer
{
    /**
     * Allow a conservative tag set and strip inline event handlers / javascript: URLs.
     */
    public static function sanitize(?string $html): string
    {
        if ($html === null || $html === '') {
            return '';
        }

        $allowed = '<p><br><strong><b><em><i><u><h1><h2><h3><h4><ul><ol><li><a><blockquote><hr><div><span><table><thead><tbody><tr><th><td>';
        $clean = strip_tags($html, $allowed);

        $clean = preg_replace('/\s+on\w+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)/iu', '', $clean) ?? '';
        $clean = preg_replace('/\s+href\s*=\s*("\s*javascript:[^"]*"|\'\s*javascript:[^\']*\'|javascript:[^\s>]+)/iu', ' href="#"', $clean) ?? '';

        return $clean;
    }
}
