<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FAQ extends Model
{
    protected $table = 'faqs';

    protected $fillable = [
        'question',
        'answer',
        'status',
        'order',
    ];

    public const STATUS_PUBLISHED = 'published';
    public const STATUS_DRAFT = 'draft';
}
