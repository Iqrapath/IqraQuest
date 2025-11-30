<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CertificateUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === 'teacher';
    }

    public function rules(): array
    {
        return [
            'certificate_type' => ['required', 'string', 'in:degree,diploma,certification,license,other'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'], // 5MB max
            'issue_date' => ['nullable', 'date', 'before_or_equal:today'],
            'expiry_date' => ['nullable', 'date', 'after:issue_date'],
            'issuing_organization' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'certificate_type.required' => 'Please select a certificate type.',
            'title.required' => 'Please enter a certificate title.',
            'file.required' => 'Please upload a certificate file.',
            'file.mimes' => 'Certificate must be a PDF or image file (JPG, PNG).',
            'file.max' => 'Certificate file size must not exceed 5MB.',
            'issue_date.before_or_equal' => 'Issue date cannot be in the future.',
            'expiry_date.after' => 'Expiry date must be after issue date.',
        ];
    }
}
