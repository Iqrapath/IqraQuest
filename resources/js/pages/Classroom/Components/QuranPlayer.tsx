import { useState, useEffect, useRef, useCallback } from 'react';
import { useDataChannel } from '@livekit/components-react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { Combobox } from '@/components/ui/combobox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Reciter {
    id: number;
    name: string;
    style: string;
}

interface Verse {
    id: number;
    verse_key: string;
    text_uthmani: string;
    translation?: string;
}

interface QuranPlayerProps {
    isTeacher: boolean;
    onClose: () => void;
}

// Reciters with their Quran.com recitation IDs
const RECITERS: Reciter[] = [
    { id: 7, name: 'Mishary Rashid Alafasy', style: '7' },
    { id: 1, name: 'Abdul Basit (Murattal)', style: '1' },
    { id: 2, name: 'Abdul Basit (Mujawwad)', style: '2' },
    { id: 3, name: 'Abdur-Rahman as-Sudais', style: '3' },
    { id: 4, name: 'Abu Bakr al-Shatri', style: '4' },
    { id: 5, name: 'Hani ar-Rifai', style: '5' },
];

// All 114 Surahs
const SURAHS = [
    { id: 1, name: 'Al-Fatihah', arabic: 'الفاتحة', verses: 7 },
    { id: 2, name: 'Al-Baqarah', arabic: 'البقرة', verses: 286 },
    { id: 3, name: "Ali 'Imran", arabic: 'آل عمران', verses: 200 },
    { id: 4, name: 'An-Nisa', arabic: 'النساء', verses: 176 },
    { id: 5, name: "Al-Ma'idah", arabic: 'المائدة', verses: 120 },
    { id: 6, name: "Al-An'am", arabic: 'الأنعام', verses: 165 },
    { id: 7, name: "Al-A'raf", arabic: 'الأعراف', verses: 206 },
    { id: 8, name: 'Al-Anfal', arabic: 'الأنفال', verses: 75 },
    { id: 9, name: 'At-Tawbah', arabic: 'التوبة', verses: 129 },
    { id: 10, name: 'Yunus', arabic: 'يونس', verses: 109 },
    { id: 11, name: 'Hud', arabic: 'هود', verses: 123 },
    { id: 12, name: 'Yusuf', arabic: 'يوسف', verses: 111 },
    { id: 13, name: "Ar-Ra'd", arabic: 'الرعد', verses: 43 },
    { id: 14, name: 'Ibrahim', arabic: 'إبراهيم', verses: 52 },
    { id: 15, name: 'Al-Hijr', arabic: 'الحجر', verses: 99 },
    { id: 16, name: 'An-Nahl', arabic: 'النحل', verses: 128 },
    { id: 17, name: "Al-Isra'", arabic: 'الإسراء', verses: 111 },
    { id: 18, name: 'Al-Kahf', arabic: 'الكهف', verses: 110 },
    { id: 19, name: 'Maryam', arabic: 'مريم', verses: 98 },
    { id: 20, name: 'Ta-Ha', arabic: 'طه', verses: 135 },
    { id: 21, name: "Al-Anbiya'", arabic: 'الأنبياء', verses: 112 },
    { id: 22, name: 'Al-Hajj', arabic: 'الحج', verses: 78 },
    { id: 23, name: "Al-Mu'minun", arabic: 'المؤمنون', verses: 118 },
    { id: 24, name: 'An-Nur', arabic: 'النور', verses: 64 },
    { id: 25, name: 'Al-Furqan', arabic: 'الفرقان', verses: 77 },
    { id: 26, name: "Ash-Shu'ara'", arabic: 'الشعراء', verses: 227 },
    { id: 27, name: 'An-Naml', arabic: 'النمل', verses: 93 },
    { id: 28, name: 'Al-Qasas', arabic: 'القصص', verses: 88 },
    { id: 29, name: "Al-'Ankabut", arabic: 'العنكبوت', verses: 69 },
    { id: 30, name: 'Ar-Rum', arabic: 'الروم', verses: 60 },
    { id: 31, name: 'Luqman', arabic: 'لقمان', verses: 34 },
    { id: 32, name: 'As-Sajdah', arabic: 'السجدة', verses: 30 },
    { id: 33, name: 'Al-Ahzab', arabic: 'الأحزاب', verses: 73 },
    { id: 34, name: "Saba'", arabic: 'سبأ', verses: 54 },
    { id: 35, name: 'Fatir', arabic: 'فاطر', verses: 45 },
    { id: 36, name: 'Ya-Sin', arabic: 'يس', verses: 83 },
    { id: 37, name: 'As-Saffat', arabic: 'الصافات', verses: 182 },
    { id: 38, name: 'Sad', arabic: 'ص', verses: 88 },
    { id: 39, name: 'Az-Zumar', arabic: 'الزمر', verses: 75 },
    { id: 40, name: 'Ghafir', arabic: 'غافر', verses: 85 },
    { id: 41, name: 'Fussilat', arabic: 'فصلت', verses: 54 },
    { id: 42, name: 'Ash-Shura', arabic: 'الشورى', verses: 53 },
    { id: 43, name: 'Az-Zukhruf', arabic: 'الزخرف', verses: 89 },
    { id: 44, name: 'Ad-Dukhan', arabic: 'الدخان', verses: 59 },
    { id: 45, name: 'Al-Jathiyah', arabic: 'الجاثية', verses: 37 },
    { id: 46, name: 'Al-Ahqaf', arabic: 'الأحقاف', verses: 35 },
    { id: 47, name: 'Muhammad', arabic: 'محمد', verses: 38 },
    { id: 48, name: 'Al-Fath', arabic: 'الفتح', verses: 29 },
    { id: 49, name: 'Al-Hujurat', arabic: 'الحجرات', verses: 18 },
    { id: 50, name: 'Qaf', arabic: 'ق', verses: 45 },
    { id: 51, name: 'Adh-Dhariyat', arabic: 'الذاريات', verses: 60 },
    { id: 52, name: 'At-Tur', arabic: 'الطور', verses: 49 },
    { id: 53, name: 'An-Najm', arabic: 'النجم', verses: 62 },
    { id: 54, name: 'Al-Qamar', arabic: 'القمر', verses: 55 },
    { id: 55, name: 'Ar-Rahman', arabic: 'الرحمن', verses: 78 },
    { id: 56, name: "Al-Waqi'ah", arabic: 'الواقعة', verses: 96 },
    { id: 57, name: 'Al-Hadid', arabic: 'الحديد', verses: 29 },
    { id: 58, name: 'Al-Mujadilah', arabic: 'المجادلة', verses: 22 },
    { id: 59, name: 'Al-Hashr', arabic: 'الحشر', verses: 24 },
    { id: 60, name: 'Al-Mumtahanah', arabic: 'الممتحنة', verses: 13 },
    { id: 61, name: 'As-Saff', arabic: 'الصف', verses: 14 },
    { id: 62, name: "Al-Jumu'ah", arabic: 'الجمعة', verses: 11 },
    { id: 63, name: 'Al-Munafiqun', arabic: 'المنافقون', verses: 11 },
    { id: 64, name: 'At-Taghabun', arabic: 'التغابن', verses: 18 },
    { id: 65, name: 'At-Talaq', arabic: 'الطلاق', verses: 12 },
    { id: 66, name: 'At-Tahrim', arabic: 'التحريم', verses: 12 },
    { id: 67, name: 'Al-Mulk', arabic: 'الملك', verses: 30 },
    { id: 68, name: 'Al-Qalam', arabic: 'القلم', verses: 52 },
    { id: 69, name: 'Al-Haqqah', arabic: 'الحاقة', verses: 52 },
    { id: 70, name: "Al-Ma'arij", arabic: 'المعارج', verses: 44 },
    { id: 71, name: 'Nuh', arabic: 'نوح', verses: 28 },
    { id: 72, name: 'Al-Jinn', arabic: 'الجن', verses: 28 },
    { id: 73, name: 'Al-Muzzammil', arabic: 'المزمل', verses: 20 },
    { id: 74, name: 'Al-Muddaththir', arabic: 'المدثر', verses: 56 },
    { id: 75, name: 'Al-Qiyamah', arabic: 'القيامة', verses: 40 },
    { id: 76, name: 'Al-Insan', arabic: 'الإنسان', verses: 31 },
    { id: 77, name: 'Al-Mursalat', arabic: 'المرسلات', verses: 50 },
    { id: 78, name: "An-Naba'", arabic: 'النبأ', verses: 40 },
    { id: 79, name: "An-Nazi'at", arabic: 'النازعات', verses: 46 },
    { id: 80, name: "'Abasa", arabic: 'عبس', verses: 42 },
    { id: 81, name: 'At-Takwir', arabic: 'التكوير', verses: 29 },
    { id: 82, name: 'Al-Infitar', arabic: 'الانفطار', verses: 19 },
    { id: 83, name: 'Al-Mutaffifin', arabic: 'المطففين', verses: 36 },
    { id: 84, name: 'Al-Inshiqaq', arabic: 'الانشقاق', verses: 25 },
    { id: 85, name: 'Al-Buruj', arabic: 'البروج', verses: 22 },
    { id: 86, name: 'At-Tariq', arabic: 'الطارق', verses: 17 },
    { id: 87, name: "Al-A'la", arabic: 'الأعلى', verses: 19 },
    { id: 88, name: 'Al-Ghashiyah', arabic: 'الغاشية', verses: 26 },
    { id: 89, name: 'Al-Fajr', arabic: 'الفجر', verses: 30 },
    { id: 90, name: 'Al-Balad', arabic: 'البلد', verses: 20 },
    { id: 91, name: 'Ash-Shams', arabic: 'الشمس', verses: 15 },
    { id: 92, name: 'Al-Layl', arabic: 'الليل', verses: 21 },
    { id: 93, name: 'Ad-Duha', arabic: 'الضحى', verses: 11 },
    { id: 94, name: 'Ash-Sharh', arabic: 'الشرح', verses: 8 },
    { id: 95, name: 'At-Tin', arabic: 'التين', verses: 8 },
    { id: 96, name: "Al-'Alaq", arabic: 'العلق', verses: 19 },
    { id: 97, name: 'Al-Qadr', arabic: 'القدر', verses: 5 },
    { id: 98, name: 'Al-Bayyinah', arabic: 'البينة', verses: 8 },
    { id: 99, name: 'Az-Zalzalah', arabic: 'الزلزلة', verses: 8 },
    { id: 100, name: "Al-'Adiyat", arabic: 'العاديات', verses: 11 },
    { id: 101, name: "Al-Qari'ah", arabic: 'القارعة', verses: 11 },
    { id: 102, name: 'At-Takathur', arabic: 'التكاثر', verses: 8 },
    { id: 103, name: "Al-'Asr", arabic: 'العصر', verses: 3 },
    { id: 104, name: 'Al-Humazah', arabic: 'الهمزة', verses: 9 },
    { id: 105, name: 'Al-Fil', arabic: 'الفيل', verses: 5 },
    { id: 106, name: 'Quraysh', arabic: 'قريش', verses: 4 },
    { id: 107, name: "Al-Ma'un", arabic: 'الماعون', verses: 7 },
    { id: 108, name: 'Al-Kawthar', arabic: 'الكوثر', verses: 3 },
    { id: 109, name: 'Al-Kafirun', arabic: 'الكافرون', verses: 6 },
    { id: 110, name: 'An-Nasr', arabic: 'النصر', verses: 3 },
    { id: 111, name: 'Al-Masad', arabic: 'المسد', verses: 5 },
    { id: 112, name: 'Al-Ikhlas', arabic: 'الإخلاص', verses: 4 },
    { id: 113, name: 'Al-Falaq', arabic: 'الفلق', verses: 5 },
    { id: 114, name: 'An-Nas', arabic: 'الناس', verses: 6 },
];

export default function QuranPlayer({ isTeacher, onClose }: QuranPlayerProps) {
    const [selectedSurah, setSelectedSurah] = useState(1);
    const [selectedVerse, setSelectedVerse] = useState(1);
    const [selectedReciter, setSelectedReciter] = useState(7); // Mishary default
    const [verses, setVerses] = useState<Verse[]>([]);
    const [currentVerse, setCurrentVerse] = useState<Verse | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [audioError, setAudioError] = useState<string | null>(null);
    const [showVerseList, setShowVerseList] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    const { send, message } = useDataChannel('quran');

    // Sync playback state with other participants
    useEffect(() => {
        if (message) {
            try {
                const decoder = new TextDecoder();
                const text = decoder.decode(message.payload);
                const data = JSON.parse(text);
                
                if (data.type === 'QURAN_PLAY' && !isTeacher) {
                    setSelectedSurah(data.surah);
                    setSelectedVerse(data.verse);
                    setSelectedReciter(data.reciter);
                    playVerse(data.surah, data.verse, data.reciter);
                } else if (data.type === 'QURAN_PAUSE' && !isTeacher) {
                    pauseAudio();
                } else if (data.type === 'QURAN_STOP' && !isTeacher) {
                    stopAudio();
                }
            } catch (error) {
                console.error('[QuranPlayer] Parse error:', error);
            }
        }
    }, [message, isTeacher]);

    // Fetch verses when surah changes
    useEffect(() => {
        fetchVerses(selectedSurah);
    }, [selectedSurah]);

    const fetchVerses = async (surahId: number) => {
        setIsLoading(true);
        try {
            // Fetch verses with Arabic text and English translation
            const response = await fetch(
                `https://api.quran.com/api/v4/verses/by_chapter/${surahId}?language=en&words=false&translations=131&fields=text_uthmani&per_page=300`
            );
            const data = await response.json();
            setVerses(data.verses.map((v: any) => ({
                id: v.id,
                verse_key: v.verse_key,
                text_uthmani: v.text_uthmani,
                translation: v.translations?.[0]?.text || ''
            })));
        } catch (error) {
            console.error('Failed to fetch verses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAudioUrl = async (surah: number, verse: number, reciterId: number): Promise<string | null> => {
        try {
            // Fetch audio URL from Quran.com API
            const verseKey = `${surah}:${verse}`;
            const response = await fetch(
                `https://api.quran.com/api/v4/recitations/${reciterId}/by_ayah/${verseKey}`
            );
            const data = await response.json();
            if (data.audio_files?.[0]?.url) {
                return `https://verses.quran.com/${data.audio_files[0].url}`;
            }
            return null;
        } catch (error) {
            console.error('[QuranPlayer] Failed to fetch audio URL:', error);
            return null;
        }
    };

    const playVerse = useCallback(async (surah: number, verse: number, reciterId: number) => {
        console.log('[QuranPlayer] Loading audio for:', `${surah}:${verse}`);
        setCurrentVerse(verses.find(v => v.verse_key === `${surah}:${verse}`) || null);
        setIsPlaying(true);
        setAudioError(null);
        
        const url = await fetchAudioUrl(surah, verse, reciterId);
        if (!url) {
            setAudioError('Failed to load audio URL');
            setIsPlaying(false);
            return;
        }
        
        console.log('[QuranPlayer] Playing:', url);
        if (audioRef.current) {
            audioRef.current.src = url;
            try {
                await audioRef.current.play();
            } catch (err) {
                console.error('[QuranPlayer] Playback error:', err);
                setAudioError('Failed to play audio');
                setIsPlaying(false);
            }
        }
    }, [verses]);

    const pauseAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setIsPlaying(false);
    };

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        setCurrentVerse(null);
    };

    const handlePlay = () => {
        if (isTeacher) safeSend({ type: 'QURAN_PLAY', surah: selectedSurah, verse: selectedVerse, reciter: selectedReciter });
        playVerse(selectedSurah, selectedVerse, selectedReciter);
    };

    const safeSend = (data: object) => {
        try {
            const encoder = new TextEncoder();
            send(encoder.encode(JSON.stringify(data)), { reliable: true });
        } catch (err) {
            console.log('[QuranPlayer] Broadcast failed, continuing locally');
        }
    };

    const handlePause = () => {
        if (isTeacher) safeSend({ type: 'QURAN_PAUSE' });
        pauseAudio();
    };

    const handleStop = () => {
        if (isTeacher) safeSend({ type: 'QURAN_STOP' });
        stopAudio();
    };

    const handleNextVerse = () => {
        const surah = SURAHS.find(s => s.id === selectedSurah);
        if (surah && selectedVerse < surah.verses) {
            const nextVerse = selectedVerse + 1;
            setSelectedVerse(nextVerse);
            if (isPlaying) {
                if (isTeacher) safeSend({ type: 'QURAN_PLAY', surah: selectedSurah, verse: nextVerse, reciter: selectedReciter });
                playVerse(selectedSurah, nextVerse, selectedReciter);
            }
        }
    };

    const handlePrevVerse = () => {
        if (selectedVerse > 1) {
            const prevVerse = selectedVerse - 1;
            setSelectedVerse(prevVerse);
            if (isPlaying) {
                if (isTeacher) safeSend({ type: 'QURAN_PLAY', surah: selectedSurah, verse: prevVerse, reciter: selectedReciter });
                playVerse(selectedSurah, prevVerse, selectedReciter);
            }
        }
    };

    // Auto-play next verse when current ends
    const handleAudioEnded = () => {
        const surah = SURAHS.find(s => s.id === selectedSurah);
        if (surah && selectedVerse < surah.verses) {
            handleNextVerse();
        } else {
            setIsPlaying(false);
        }
    };

    const currentSurah = SURAHS.find(s => s.id === selectedSurah);

    const handleAudioError = () => {
        setAudioError('Failed to load audio. Try another reciter.');
        setIsPlaying(false);
        setTimeout(() => setAudioError(null), 3000);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Hidden audio element */}
            <audio ref={audioRef} onEnded={handleAudioEnded} onError={handleAudioError} />
            
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Icon icon="mdi:book-open-page-variant" className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-body-xs-semibold text-foreground truncate">Quran Recitation</h3>
                        <p className="text-[10px] text-muted-foreground truncate">
                            {isPlaying ? 'Now playing' : 'Select a verse'}
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                    <Icon icon="mdi:close" className="w-4 h-4 text-gray-400" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Surah Selector */}
                <div>
                    <label className="text-[11px] font-semibold text-foreground mb-1 block">Surah</label>
                    {isTeacher ? (
                        <Combobox
                            options={SURAHS.map(surah => ({
                                value: String(surah.id),
                                label: `${surah.id}. ${surah.name} (${surah.arabic})`
                            }))}
                            value={String(selectedSurah)}
                            onChange={(value) => { setSelectedSurah(Number(value)); setSelectedVerse(1); }}
                            placeholder="Select surah..."
                            searchPlaceholder="Search surah..."
                            emptyText="No surah found."
                            className="w-full text-body-xs-regular"
                        />
                    ) : (
                        <div className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-body-xs-regular bg-gray-50 cursor-not-allowed">
                            {selectedSurah}. {SURAHS.find(s => s.id === selectedSurah)?.name} ({SURAHS.find(s => s.id === selectedSurah)?.arabic})
                        </div>
                    )}
                </div>

                {/* Verse Selector */}
                <div>
                    <label className="text-[11px] font-semibold text-foreground mb-1 block">Verse</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            min={1}
                            max={currentSurah?.verses || 1}
                            value={selectedVerse}
                            onChange={(e) => setSelectedVerse(Math.max(1, Math.min(currentSurah?.verses || 1, Number(e.target.value))))}
                            disabled={!isTeacher}
                            className="flex-1 px-2.5 py-2 border border-gray-200 rounded-lg text-body-xs-regular bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                        <span className="px-2.5 py-2 text-body-xs-regular text-muted-foreground">/ {currentSurah?.verses || 0}</span>
                    </div>
                </div>

                {/* Reciter Selector */}
                <div>
                    <label className="text-[11px] font-semibold text-foreground mb-1 block">Reciter</label>
                    {isTeacher ? (
                        <Select
                            value={String(selectedReciter)}
                            onValueChange={(value) => setSelectedReciter(Number(value))}
                        >
                            <SelectTrigger className="w-full text-body-xs-regular">
                                <SelectValue placeholder="Select reciter..." />
                            </SelectTrigger>
                            <SelectContent>
                                {RECITERS.map(reciter => (
                                    <SelectItem key={reciter.id} value={String(reciter.id)}>
                                        {reciter.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-body-xs-regular bg-gray-50 cursor-not-allowed">
                            {RECITERS.find(r => r.id === selectedReciter)?.name}
                        </div>
                    )}
                </div>

                {/* Error Display */}
                {audioError && (
                    <div className="p-2 bg-light-pink rounded-lg text-body-xs-medium text-destructive flex items-center gap-2">
                        <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                        {audioError}
                    </div>
                )}

                {/* Current Verse Display */}
                {currentVerse && (
                    <div className="p-3 bg-pale-green rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-primary">{currentVerse.verse_key}</span>
                            {isPlaying && <div className="flex gap-0.5">{[...Array(3)].map((_, i) => (
                                <div key={i} className="w-1 bg-primary rounded-full animate-pulse" style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }} />
                            ))}</div>}
                        </div>
                        <p className="text-right text-lg font-arabic leading-loose text-foreground" dir="rtl">
                            {currentVerse.text_uthmani}
                        </p>
                        {currentVerse.translation && (
                            <p className="text-body-xs-regular text-muted-foreground italic">
                                {currentVerse.translation.replace(/<[^>]*>/g, '')}
                            </p>
                        )}
                    </div>
                )}

                {/* Verse List Toggle */}
                <button
                    onClick={() => setShowVerseList(!showVerseList)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-body-xs-medium text-foreground transition-colors"
                >
                    <span>Browse Verses</span>
                    <Icon icon={showVerseList ? "mdi:chevron-up" : "mdi:chevron-down"} className="w-4 h-4" />
                </button>

                {/* Verse List */}
                {showVerseList && (
                    <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-lg">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                            </div>
                        ) : (
                            verses.map((verse, idx) => (
                                <button
                                    key={verse.id}
                                    onClick={() => { if (isTeacher) { setSelectedVerse(idx + 1); setShowVerseList(false); } }}
                                    disabled={!isTeacher}
                                    className={cn(
                                        "w-full px-3 py-2 text-left border-b border-gray-50 last:border-0 transition-colors",
                                        selectedVerse === idx + 1 ? "bg-pale-green" : "hover:bg-gray-50",
                                        !isTeacher && "cursor-default"
                                    )}
                                >
                                    <div className="flex items-start gap-2">
                                        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                                            {idx + 1}
                                        </span>
                                        <p className="text-right text-sm font-arabic text-foreground line-clamp-2" dir="rtl">
                                            {verse.text_uthmani}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Playback Controls */}
            <div className="p-3 border-t border-gray-100 space-y-2">
                {/* Progress indicator */}
                {currentVerse && (
                    <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                        <span>Verse {selectedVerse} of {currentSurah?.verses}</span>
                    </div>
                )}
                
                {/* Control buttons */}
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={handlePrevVerse}
                        disabled={selectedVerse <= 1 || !isTeacher}
                        className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                        <Icon icon="mdi:skip-previous" className="w-5 h-5 text-foreground" />
                    </button>
                    
                    {isPlaying ? (
                        <button
                            onClick={handlePause}
                            disabled={!isTeacher}
                            className="w-12 h-12 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-md shadow-primary/20"
                        >
                            <Icon icon="mdi:pause" className="w-6 h-6 text-white" />
                        </button>
                    ) : (
                        <button
                            onClick={handlePlay}
                            disabled={!isTeacher}
                            className="w-12 h-12 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-md shadow-primary/20"
                        >
                            <Icon icon="mdi:play" className="w-6 h-6 text-white" />
                        </button>
                    )}
                    
                    <button
                        onClick={handleNextVerse}
                        disabled={selectedVerse >= (currentSurah?.verses || 1) || !isTeacher}
                        className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                        <Icon icon="mdi:skip-next" className="w-5 h-5 text-foreground" />
                    </button>
                    
                    <button
                        onClick={handleStop}
                        disabled={!isTeacher || !isPlaying}
                        className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                        <Icon icon="mdi:stop" className="w-5 h-5 text-foreground" />
                    </button>
                </div>

                {/* Teacher indicator */}
                {!isTeacher && (
                    <p className="text-center text-[10px] text-muted-foreground">
                        Teacher controls playback
                    </p>
                )}
            </div>
        </div>
    );
}
