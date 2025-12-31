<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Teacher Recommendations</title>
    <style>
        body {
            font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1F2A37;
            background-color: #F9FAFB;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #338078 0%, #2a6b64 100%);
            padding: 30px;
            text-align: center;
            border-radius: 16px 16px 0 0;
        }
        .header h1 {
            color: white;
            margin: 0;
            font-size: 24px;
        }
        .header p {
            color: rgba(255, 255, 255, 0.9);
            margin: 10px 0 0;
        }
        .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 16px 16px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .preferences {
            background: #F0FDF9;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
        }
        .preferences p {
            margin: 5px 0;
            color: #6B7280;
        }
        .preferences strong {
            color: #338078;
        }
        .teacher-card {
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            position: relative;
        }
        .match-score {
            position: absolute;
            top: 15px;
            right: 15px;
            background: #338078;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }
        .teacher-name {
            font-size: 18px;
            font-weight: bold;
            color: #1F2A37;
            margin: 0 0 8px;
        }
        .teacher-meta {
            color: #6B7280;
            font-size: 14px;
            margin-bottom: 10px;
        }
        .teacher-reason {
            background: #FFF7E4;
            padding: 12px;
            border-radius: 8px;
            font-size: 14px;
            color: #1F2A37;
        }
        .teacher-reason strong {
            color: #338078;
        }
        .rating {
            color: #F59E0B;
        }
        .cta-button {
            display: inline-block;
            background: #338078;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 30px;
            font-weight: 600;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #9CA3AF;
            font-size: 12px;
        }
        .divider {
            height: 1px;
            background: #E5E7EB;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 Your Teacher Recommendations</h1>
            <p>Personalized matches based on your preferences</p>
        </div>
        
        <div class="content">
            <p class="greeting">Assalamu Alaikum <strong>{{ $name }}</strong>,</p>
            
            <p>Great news! We've found the perfect Quran teachers for you based on your preferences:</p>
            
            <div class="preferences">
                <p><strong>Subject:</strong> {{ $subjectName }}</p>
                <p><strong>Preferred Time:</strong> {{ $timePreference }}</p>
            </div>

            <h2 style="color: #338078; margin-bottom: 20px;">Top 3 Teacher Recommendations</h2>

            @foreach($recommendations as $index => $teacher)
            <div class="teacher-card">
                <span class="match-score">{{ $teacher['match_score'] }}% Match</span>
                
                <h3 class="teacher-name">{{ $index + 1 }}. {{ $teacher['name'] }}</h3>
                
                <p class="teacher-meta">
                    <span class="rating">★</span> {{ $teacher['rating'] }}/5 ({{ $teacher['reviews_count'] }} reviews) &bull; 
                    {{ $teacher['experience_years'] }} years experience &bull;
                    ${{ $teacher['hourly_rate'] }}/hour
                </p>
                
                <p class="teacher-meta">
                    <strong>Subjects:</strong> {{ implode(', ', $teacher['subjects']) }}
                </p>
                
                <div class="teacher-reason">
                    <strong>Why this teacher?</strong><br>
                    {{ $teacher['reason'] }}
                </div>
            </div>
            @endforeach

            <div class="divider"></div>

            <p style="text-align: center;">
                Ready to start your Quran learning journey?
            </p>
            
            <p style="text-align: center;">
                <a href="{{ url('/find-teacher') }}" class="cta-button">
                    View Teachers & Book a Session
                </a>
            </p>
        </div>

        <div class="footer">
            <p>This email was sent because you requested teacher recommendations on IqraQuest.</p>
            <p>© {{ date('Y') }} IqraQuest. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
