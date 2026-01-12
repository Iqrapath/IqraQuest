<x-mail::message>
# Hello {{ $user->name }},

We have received your request for your wallet activity report.

Please find the attached CSV file containing your complete transaction history.

If you did not request this report, please contact our support team immediately.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
