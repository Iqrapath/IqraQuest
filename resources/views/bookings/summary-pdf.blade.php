<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Session Summary #{{ $booking->id }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #333;
            margin: 40px;
        }
        
        .header {
            border-bottom: 2px solid #338078;
            padding-bottom: 15px;
            margin-bottom: 25px;
        }
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #338078;
        }
        
        .logo span {
            color: #f5ad7e;
        }
        
        .title {
            font-size: 18px;
            color: #333;
            margin-top: 10px;
        }
        
        .meta {
            color: #666;
            font-size: 11px;
        }
        
        h2 {
            font-size: 14px;
            color: #338078;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin: 20px 0 10px 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        
        table.details td {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        
        table.details td:first-child {
            color: #666;
            width: 40%;
        }
        
        table.details td:last-child {
            font-weight: 500;
        }
        
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
        }
        
        .status-completed {
            background: #def7e4;
            color: #014737;
        }
        
        .status-cancelled {
            background: #fde8e8;
            color: #771d1d;
        }
        
        .review-box {
            background: #fffbeb;
            border: 1px solid #f5ad7e;
            padding: 15px;
            margin: 10px 0;
        }
        
        .stars {
            color: #f5ad7e;
            font-size: 16px;
        }
        
        .comment {
            font-style: italic;
            color: #555;
            margin-top: 8px;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #999;
            font-size: 10px;
        }
        
        .total-row td {
            font-weight: bold;
            font-size: 14px;
            color: #338078;
            border-top: 2px solid #338078;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="logo">Iqra<span>Quest</span></div>
        <div class="title">Session Summary</div>
        <div class="meta">
            Booking #{{ $booking->id }} | Generated: {{ now()->format('M j, Y') }}
        </div>
    </div>

    <!-- Session Details -->
    <h2>Session Details</h2>
    <table class="details">
        <tr>
            <td>Subject</td>
            <td>{{ $booking->subject->name }}</td>
        </tr>
        <tr>
            <td>Teacher</td>
            <td>Ustadh {{ $booking->teacher->user->name }}</td>
        </tr>
        <tr>
            <td>Student</td>
            <td>{{ $booking->student->name }}</td>
        </tr>
        <tr>
            <td>Date</td>
            <td>{{ $booking->start_time->format('l, F j, Y') }}</td>
        </tr>
        <tr>
            <td>Time</td>
            <td>{{ $booking->start_time->format('g:i A') }} - {{ $booking->end_time->format('g:i A') }}</td>
        </tr>
        <tr>
            <td>Duration</td>
            <td>{{ $booking->start_time->diffInMinutes($booking->end_time) }} minutes</td>
        </tr>
        <tr>
            <td>Status</td>
            <td><span class="status status-{{ $displayStatus }}">{{ ucfirst($displayStatus) }}</span></td>
        </tr>
    </table>

    <!-- Review -->
    @if($review)
    <h2>Your Review</h2>
    <div class="review-box">
        <div class="stars">
            @for($i = 1; $i <= 5; $i++)
                {{ $i <= $review->rating ? '★' : '☆' }}
            @endfor
            ({{ $review->rating }}/5)
        </div>
        @if($review->comment)
        <div class="comment">"{{ $review->comment }}"</div>
        @endif
    </div>
    @endif

    <!-- Payment -->
    <h2>Payment Summary</h2>
    <table class="details">
        <tr>
            <td>Session Fee</td>
            <td>{{ $booking->currency }} {{ number_format($booking->total_price, 2) }}</td>
        </tr>
        <tr>
            <td>Payment Status</td>
            <td>{{ ucfirst(str_replace('_', ' ', $booking->payment_status)) }}</td>
        </tr>
        <tr class="total-row">
            <td>Total</td>
            <td>{{ $booking->currency }} {{ number_format($booking->total_price, 2) }}</td>
        </tr>
    </table>

    <!-- Footer -->
    <div class="footer">
        Thank you for learning with IqraQuest!<br>
        support@iqraquest.com
    </div>
</body>
</html>
