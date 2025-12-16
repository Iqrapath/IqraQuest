import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { useDataChannel } from '@livekit/components-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface PollOption {
    option: string;
    index: number;
    count: number;
    percentage: number;
    is_correct?: boolean;
}

interface Poll {
    id: number;
    question: string;
    options: string[];
    type: 'poll' | 'quiz';
    show_results: boolean;
    results: PollOption[] | null;
    total_responses: number;
    user_response: number | null;
}

interface PollPanelProps {
    bookingId: number;
    isTeacher: boolean;
    onClose: () => void;
}

interface ActivePollViewProps {
    poll: Poll;
    isTeacher: boolean;
    onSubmit: (index: number) => void;
    onEnd: () => void;
    onToggleResults: () => void;
    submitting: boolean;
}

interface CreatePollFormProps {
    question: string;
    setQuestion: (q: string) => void;
    options: string[];
    setOptions: (o: string[]) => void;
    pollType: 'poll' | 'quiz';
    setPollType: (t: 'poll' | 'quiz') => void;
    correctOption: number | null;
    setCorrectOption: (i: number | null) => void;
    onAddOption: () => void;
    onRemoveOption: (i: number) => void;
    onSubmit: () => void;
    onCancel: () => void;
    submitting: boolean;
}

function ActivePollView({
    poll,
    isTeacher,
    onSubmit,
    onEnd,
    onToggleResults,
    submitting,
}: ActivePollViewProps) {
    const hasResponded = poll.user_response !== null;
    // Students can only see results if they've responded OR if it's a poll (not quiz)
    // For quizzes, students must respond first before seeing correct answers
    const canSeeResults = isTeacher || (poll.show_results && (hasResponded || poll.type === 'poll'));
    const showResultsBar = canSeeResults && poll.results;

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                    className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        poll.type === 'quiz'
                            ? 'bg-purple/10 text-purple'
                            : 'bg-orange/10 text-orange',
                    )}
                >
                    {poll.type === 'quiz' ? '📝 Quiz' : '📊 Poll'}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">
                    {poll.total_responses} response
                    {poll.total_responses !== 1 ? 's' : ''}
                </span>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-body-xs-semibold text-foreground">
                    {poll.question}
                </p>
            </div>
            <div className="space-y-2">
                {poll.options.map((option, index) => {
                    const result = poll.results?.find((r) => r.index === index);
                    const isSelected = poll.user_response === index;
                    const isCorrect =
                        poll.type === 'quiz' && result?.is_correct;
                    const canClick = !isTeacher && !hasResponded && !submitting;
                    return (
                        <button
                            key={index}
                            onClick={() => canClick && onSubmit(index)}
                            disabled={!canClick}
                            className={cn(
                                'relative w-full overflow-hidden rounded-xl border-2 p-3 text-left transition-all',
                                canClick &&
                                    'cursor-pointer hover:border-primary hover:bg-primary/5',
                                !canClick && 'cursor-default',
                                isSelected && 'border-primary bg-primary/5',
                                showResultsBar &&
                                    isCorrect &&
                                    'border-primary bg-pale-green',
                                showResultsBar &&
                                    !isCorrect &&
                                    isSelected &&
                                    'border-destructive bg-light-pink',
                                !isSelected &&
                                    !showResultsBar &&
                                    'border-gray-200',
                            )}
                        >
                            {showResultsBar && result && (
                                <div
                                    className={cn(
                                        'absolute inset-y-0 left-0 transition-all duration-500',
                                        isCorrect
                                            ? 'bg-primary/10'
                                            : 'bg-gray-100',
                                    )}
                                    style={{ width: `${result.percentage}%` }}
                                />
                            )}
                            <div className="relative flex items-center justify-between gap-2">
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                    <span
                                        className={cn(
                                            'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                                            isSelected
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-200 text-gray-600',
                                        )}
                                    >
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className="text-body-xs-medium truncate text-foreground">
                                        {option}
                                    </span>
                                </div>
                                {showResultsBar && result && (
                                    <div className="flex flex-shrink-0 items-center gap-1">
                                        {isCorrect && (
                                            <Icon
                                                icon="mdi:check-circle"
                                                className="h-4 w-4 text-primary"
                                            />
                                        )}
                                        <span className="text-body-xs-semibold text-foreground">
                                            {result.percentage}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
            {!isTeacher && hasResponded && !poll.show_results && (
                <div className="flex items-center gap-2 rounded-xl bg-pale-green p-3">
                    <Icon
                        icon="mdi:check-circle"
                        className="h-5 w-5 text-primary"
                    />
                    <span className="text-body-xs-medium text-primary">
                        Response submitted! Waiting for results...
                    </span>
                </div>
            )}
            {!isTeacher && poll.show_results && !hasResponded && poll.type === 'quiz' && (
                <div className="flex items-center gap-2 rounded-xl bg-orange/10 p-3">
                    <Icon icon="mdi:alert-circle" className="h-5 w-5 text-orange" />
                    <span className="text-body-xs-medium text-orange">
                        Answer the quiz to see the correct answer!
                    </span>
                </div>
            )}
            
            {/* Answer Summary Box - Shows for students after responding when results are visible */}
            {!isTeacher && poll.show_results && hasResponded && poll.type === 'quiz' && (
                <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-pale-green/50 to-teal/10 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Icon icon="mdi:clipboard-check" className="h-5 w-5 text-primary" />
                        </div>
                        <h4 className="text-body-xs-semibold text-foreground">Answer Summary</h4>
                    </div>
                    
                    {/* Correct Answer */}
                    <div className="space-y-1.5">
                        <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">Correct Answer</p>
                        <div className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-primary/20">
                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold">
                                {String.fromCharCode(65 + (poll.results?.find(r => r.is_correct)?.index ?? 0))}
                            </span>
                            <span className="text-body-xs-medium text-foreground">
                                {poll.options[poll.results?.find(r => r.is_correct)?.index ?? 0]}
                            </span>
                            <Icon icon="mdi:check-circle" className="h-4 w-4 text-primary ml-auto flex-shrink-0" />
                        </div>
                    </div>
                    
                    {/* Your Answer */}
                    <div className="space-y-1.5">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Your Answer</p>
                        {(() => {
                            const userAnswerIndex = poll.user_response!;
                            const isUserCorrect = poll.results?.find(r => r.index === userAnswerIndex)?.is_correct;
                            return (
                                <div className={cn(
                                    "flex items-center gap-2 p-2.5 rounded-lg border",
                                    isUserCorrect 
                                        ? "bg-pale-green/50 border-primary/20" 
                                        : "bg-light-pink/50 border-destructive/20"
                                )}>
                                    <span className={cn(
                                        "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                                        isUserCorrect ? "bg-primary text-white" : "bg-destructive text-white"
                                    )}>
                                        {String.fromCharCode(65 + userAnswerIndex)}
                                    </span>
                                    <span className="text-body-xs-medium text-foreground">
                                        {poll.options[userAnswerIndex]}
                                    </span>
                                    <Icon 
                                        icon={isUserCorrect ? "mdi:check-circle" : "mdi:close-circle"} 
                                        className={cn(
                                            "h-4 w-4 ml-auto flex-shrink-0",
                                            isUserCorrect ? "text-primary" : "text-destructive"
                                        )} 
                                    />
                                </div>
                            );
                        })()}
                    </div>
                    
                    {/* Result Badge */}
                    {(() => {
                        const userAnswerIndex = poll.user_response!;
                        const isUserCorrect = poll.results?.find(r => r.index === userAnswerIndex)?.is_correct;
                        return (
                            <div className={cn(
                                "flex items-center justify-center gap-2 py-2 rounded-lg",
                                isUserCorrect ? "bg-primary/10" : "bg-destructive/10"
                            )}>
                                <Icon 
                                    icon={isUserCorrect ? "mdi:party-popper" : "mdi:emoticon-sad-outline"} 
                                    className={cn("h-5 w-5", isUserCorrect ? "text-primary" : "text-destructive")} 
                                />
                                <span className={cn(
                                    "text-body-xs-semibold",
                                    isUserCorrect ? "text-primary" : "text-destructive"
                                )}>
                                    {isUserCorrect ? "Correct! Well done! 🎉" : "Incorrect. Keep learning! 📚"}
                                </span>
                            </div>
                        );
                    })()}
                </div>
            )}
            
            {/* Simple results visible message for polls (not quizzes) */}
            {!isTeacher && poll.show_results && hasResponded && poll.type === 'poll' && (
                <div className="flex items-center gap-2 rounded-xl bg-teal/10 p-3">
                    <Icon icon="mdi:chart-bar" className="h-5 w-5 text-teal" />
                    <span className="text-body-xs-medium text-teal">
                        Results are now visible
                    </span>
                </div>
            )}
            {isTeacher && (
                <div className="space-y-2 pt-2">
                    <button
                        onClick={onToggleResults}
                        className={cn(
                            'text-body-xs-semibold flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 transition-colors',
                            poll.show_results
                                ? 'bg-gray-100 text-foreground hover:bg-gray-200'
                                : 'bg-teal text-white hover:bg-teal/90',
                        )}
                    >
                        <Icon
                            icon={poll.show_results ? 'mdi:eye-off' : 'mdi:eye'}
                            className="h-4 w-4 flex-shrink-0"
                        />
                        <span className="truncate">
                            {poll.show_results
                                ? 'Hide from Student'
                                : 'Show to Student'}
                        </span>
                    </button>
                    <button
                        onClick={onEnd}
                        className="text-body-xs-semibold flex w-full items-center justify-center gap-2 rounded-xl bg-destructive px-3 py-2.5 text-white transition-colors hover:bg-destructive/90"
                    >
                        <Icon
                            icon="mdi:stop"
                            className="h-4 w-4 flex-shrink-0"
                        />
                        End Poll
                    </button>
                </div>
            )}
        </div>
    );
}

function CreatePollForm({
    question,
    setQuestion,
    options,
    setOptions,
    pollType,
    setPollType,
    correctOption,
    setCorrectOption,
    onAddOption,
    onRemoveOption,
    onSubmit,
    onCancel,
    submitting,
}: CreatePollFormProps) {
    const isValid =
        question.trim() &&
        options.filter((o) => o.trim()).length >= 2 &&
        (pollType === 'poll' || correctOption !== null);
    return (
        <div className="space-y-3">
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                <button
                    onClick={() => setPollType('poll')}
                    className={cn(
                        'flex-1 rounded-md py-1.5 text-[11px] font-semibold transition-colors',
                        pollType === 'poll'
                            ? 'bg-white text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    📊 Poll
                </button>
                <button
                    onClick={() => setPollType('quiz')}
                    className={cn(
                        'flex-1 rounded-md py-1.5 text-[11px] font-semibold transition-colors',
                        pollType === 'quiz'
                            ? 'bg-white text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    📝 Quiz
                </button>
            </div>
            <div>
                <label className="mb-1 block text-[11px] font-semibold text-foreground">
                    Question
                </label>
                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter your question..."
                    className="text-body-xs-regular w-full resize-none rounded-lg border border-gray-200 px-2.5 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    rows={2}
                />
            </div>
            <div>
                <label className="mb-1 block text-[11px] font-semibold text-foreground">
                    Options{' '}
                    {pollType === 'quiz' && (
                        <span className="text-[10px] font-normal text-muted-foreground">
                            (tap ✓ for correct)
                        </span>
                    )}
                </label>
                <div className="space-y-1.5">
                    {options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                            {pollType === 'quiz' && (
                                <button
                                    onClick={() => setCorrectOption(idx)}
                                    className={cn(
                                        'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-colors',
                                        correctOption === idx
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300',
                                    )}
                                >
                                    {correctOption === idx ? (
                                        <Icon
                                            icon="mdi:check"
                                            className="h-3 w-3"
                                        />
                                    ) : (
                                        <span className="text-[9px] font-bold">
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                    )}
                                </button>
                            )}
                            <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                    const newOpts = [...options];
                                    newOpts[idx] = e.target.value;
                                    setOptions(newOpts);
                                }}
                                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                className="text-body-xs-regular min-w-0 flex-1 rounded-lg border border-gray-200 px-2 py-1.5 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                            />
                            {options.length > 2 && (
                                <button
                                    onClick={() => onRemoveOption(idx)}
                                    className="flex-shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-light-pink hover:text-destructive"
                                >
                                    <Icon
                                        icon="mdi:close"
                                        className="h-3.5 w-3.5"
                                    />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {options.length < 6 && (
                    <button
                        onClick={onAddOption}
                        className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80"
                    >
                        <Icon icon="mdi:plus" className="h-3.5 w-3.5" />
                        Add Option
                    </button>
                )}
            </div>
            <div className="flex gap-2 pt-1">
                <button
                    onClick={onCancel}
                    className="text-body-xs-semibold flex-1 rounded-lg bg-gray-100 px-3 py-2 text-foreground transition-colors hover:bg-gray-200"
                >
                    Cancel
                </button>
                <button
                    onClick={onSubmit}
                    disabled={!isValid || submitting}
                    className={cn(
                        'text-body-xs-semibold flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 transition-colors',
                        isValid && !submitting
                            ? 'bg-primary text-white hover:bg-primary/90'
                            : 'cursor-not-allowed bg-gray-200 text-gray-400',
                    )}
                >
                    {submitting ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                        <>
                            <Icon icon="mdi:send" className="h-3.5 w-3.5" />
                            Launch
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export default function PollPanel({
    bookingId,
    isTeacher,
    onClose,
}: PollPanelProps) {
    const [activePoll, setActivePoll] = useState<Poll | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const pollIdRef = useRef<number | null>(null);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [pollType, setPollType] = useState<'poll' | 'quiz'>('poll');
    const [correctOption, setCorrectOption] = useState<number | null>(null);
    const { send, message } = useDataChannel('poll');

    useEffect(() => {
        fetchActivePoll();
    }, [bookingId]);

    useEffect(() => {
        if (!message) return;
        try {
            const decoder = new TextDecoder();
            const text = decoder.decode(message.payload);
            const data = JSON.parse(text);
            console.log('[PollPanel] Received:', data.type);
            if (data.type === 'POLL_CREATED') {
                const newPoll = {
                    ...data.poll,
                    show_results: false,
                    results: null,
                    total_responses: 0,
                    user_response: null,
                };
                setActivePoll(newPoll);
                pollIdRef.current = newPoll.id;
                setIsCreating(false);
            } else if (data.type === 'POLL_UPDATE') {
                setActivePoll((prev: Poll | null) =>
                    prev
                        ? { ...data.poll, user_response: prev.user_response }
                        : data.poll,
                );
            } else if (data.type === 'POLL_ENDED') {
                setActivePoll((prev: Poll | null) =>
                    prev
                        ? {
                              ...prev,
                              ...data.poll,
                              show_results: true,
                              user_response: prev.user_response,
                          }
                        : null,
                );
            } else if (
                data.type === 'POLL_RESPONSE' &&
                (data.poll_id === pollIdRef.current ||
                    data.poll_id === activePoll?.id)
            ) {
                setActivePoll((prev: Poll | null) =>
                    prev
                        ? {
                              ...prev,
                              total_responses:
                                  data.total_responses ?? prev.total_responses,
                              results: data.results ?? prev.results,
                          }
                        : null,
                );
            }
        } catch (error) {
            console.error('[PollPanel] Parse error:', error);
        }
    }, [message]);

    const fetchActivePoll = async () => {
        try {
            const response = await fetch(`/classroom/${bookingId}/poll/active`);
            const data = await response.json();
            if (data.poll) {
                setActivePoll(data.poll);
                pollIdRef.current = data.poll.id;
            }
        } catch (error) {
            console.error('Failed to fetch poll:', error);
        } finally {
            setLoading(false);
        }
    };

    const createPoll = async () => {
        if (!question.trim() || options.filter((o) => o.trim()).length < 2)
            return;
        if (pollType === 'quiz' && correctOption === null) return;
        setSubmitting(true);
        try {
            const response = await fetch(`/classroom/${bookingId}/poll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    question,
                    options: options.filter((o) => o.trim()),
                    type: pollType,
                    correct_option: pollType === 'quiz' ? correctOption : null,
                }),
            });
            const data = await response.json();
            if (data.success) {
                const newPoll: Poll = {
                    id: data.poll.id,
                    question: data.poll.question,
                    options: data.poll.options,
                    type: data.poll.type,
                    show_results: false,
                    results: null,
                    total_responses: 0,
                    user_response: null,
                };
                send(
                    new TextEncoder().encode(
                        JSON.stringify({ type: 'POLL_CREATED', poll: newPoll }),
                    ),
                    { reliable: true },
                );
                setActivePoll(newPoll);
                pollIdRef.current = newPoll.id;
                resetForm();
            }
        } catch (error) {
            console.error('Failed to create poll:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const submitResponse = async (optionIndex: number) => {
        if (!activePoll || activePoll.user_response !== null) return;
        setSubmitting(true);
        try {
            const response = await fetch(
                `/classroom/poll/${activePoll.id}/respond`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({ selected_option: optionIndex }),
                },
            );
            const data = await response.json();
            if (data.success) {
                const newTotal =
                    data.total_responses || activePoll.total_responses + 1;
                const newResults = data.results || activePoll.results;
                setActivePoll((prev: Poll | null) =>
                    prev
                        ? {
                              ...prev,
                              user_response: optionIndex,
                              total_responses: newTotal,
                              results: newResults,
                          }
                        : null,
                );
                send(
                    new TextEncoder().encode(
                        JSON.stringify({
                            type: 'POLL_RESPONSE',
                            poll_id: activePoll.id,
                            total_responses: newTotal,
                            results: newResults,
                        }),
                    ),
                    { reliable: true },
                );
            }
        } catch (error) {
            console.error('Failed to submit response:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const endPoll = async () => {
        if (!activePoll) return;
        try {
            const response = await fetch(
                `/classroom/poll/${activePoll.id}/end`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );
            const data = await response.json();
            if (data.success) {
                const updatedPoll = {
                    ...activePoll,
                    show_results: true,
                    results: data.results,
                };
                setActivePoll(updatedPoll);
                send(
                    new TextEncoder().encode(
                        JSON.stringify({
                            type: 'POLL_ENDED',
                            poll: updatedPoll,
                        }),
                    ),
                    { reliable: true },
                );
            }
        } catch (error) {
            console.error('Failed to end poll:', error);
        }
    };

    const toggleResults = async () => {
        if (!activePoll) return;
        try {
            const response = await fetch(
                `/classroom/poll/${activePoll.id}/toggle-results`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );
            const data = await response.json();
            if (data.success) {
                const updatedPoll: Poll = {
                    ...activePoll,
                    show_results: data.show_results,
                    results: data.show_results
                        ? data.results || activePoll.results
                        : activePoll.results,
                };
                setActivePoll(updatedPoll);
                send(
                    new TextEncoder().encode(
                        JSON.stringify({
                            type: 'POLL_UPDATE',
                            poll: updatedPoll,
                        }),
                    ),
                    { reliable: true },
                );
            }
        } catch (error) {
            console.error('Failed to toggle results:', error);
        }
    };

    const resetForm = () => {
        setQuestion('');
        setOptions(['', '']);
        setPollType('poll');
        setCorrectOption(null);
        setIsCreating(false);
    };
    const addOption = () => {
        if (options.length < 6) setOptions([...options, '']);
    };
    const removeOption = (idx: number) => {
        if (options.length > 2) {
            const newOpts = options.filter((_, i) => i !== idx);
            setOptions(newOpts);
            if (correctOption === idx) setCorrectOption(null);
            else if (correctOption !== null && correctOption > idx)
                setCorrectOption(correctOption - 1);
        }
    };

    if (loading)
        return (
            <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-gray-100 px-3 py-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange/20">
                            <Icon
                                icon="mdi:poll"
                                className="h-4 w-4 text-orange"
                            />
                        </div>
                        <h3 className="text-body-xs-semibold text-foreground">
                            Polls & Quizzes
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 hover:bg-gray-100"
                    >
                        <Icon
                            icon="mdi:close"
                            className="h-4 w-4 text-gray-400"
                        />
                    </button>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                </div>
            </div>
        );

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-3">
                <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange/20">
                        <Icon icon="mdi:poll" className="h-4 w-4 text-orange" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-body-xs-semibold truncate text-foreground">
                            Polls & Quizzes
                        </h3>
                        <p className="truncate text-[10px] text-muted-foreground">
                            {activePoll
                                ? `${activePoll.total_responses} response${activePoll.total_responses !== 1 ? 's' : ''}`
                                : 'No active poll'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                >
                    <Icon icon="mdi:close" className="h-4 w-4 text-gray-400" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
                {activePoll && !isCreating && (
                    <ActivePollView
                        poll={activePoll}
                        isTeacher={isTeacher}
                        onSubmit={submitResponse}
                        onEnd={endPoll}
                        onToggleResults={toggleResults}
                        submitting={submitting}
                    />
                )}
                {isTeacher && isCreating && (
                    <CreatePollForm
                        question={question}
                        setQuestion={setQuestion}
                        options={options}
                        setOptions={setOptions}
                        pollType={pollType}
                        setPollType={setPollType}
                        correctOption={correctOption}
                        setCorrectOption={setCorrectOption}
                        onAddOption={addOption}
                        onRemoveOption={removeOption}
                        onSubmit={createPoll}
                        onCancel={resetForm}
                        submitting={submitting}
                    />
                )}
                {!activePoll && !isCreating && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange/10">
                            <Icon
                                icon="mdi:poll"
                                className="h-8 w-8 text-orange/50"
                            />
                        </div>
                        <p className="text-body-s-medium mb-1 text-foreground">
                            No active poll
                        </p>
                        <p className="text-body-xs-regular mb-4 text-muted-foreground">
                            {isTeacher
                                ? 'Create a poll to engage your student'
                                : 'Your teacher will start a poll soon'}
                        </p>
                        {isTeacher && (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="text-body-s-medium flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
                            >
                                <Icon icon="mdi:plus" className="h-5 w-5" />
                                Create Poll
                            </button>
                        )}
                    </div>
                )}
            </div>
            {isTeacher && !isCreating && activePoll && (
                <div className="border-t border-gray-100 p-3">
                    <button
                        onClick={() => setIsCreating(true)}
                        className="text-body-xs-semibold flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-foreground transition-colors hover:bg-gray-200"
                    >
                        <Icon
                            icon="mdi:plus"
                            className="h-4 w-4 flex-shrink-0"
                        />
                        <span className="truncate">New Poll</span>
                    </button>
                </div>
            )}
        </div>
    );
}

export function usePollNotification(bookingId: number, isTeacher: boolean) {
    const [notification, setNotification] = useState<{
        type: 'new_poll' | 'results_ready';
        poll: Poll;
    } | null>(null);
    const [shouldOpenPanel, setShouldOpenPanel] = useState(false);
    const { message } = useDataChannel('poll');
    const processedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!message || isTeacher) return;
        try {
            const decoder = new TextDecoder();
            const text = decoder.decode(message.payload);
            const data = JSON.parse(text);
            if (data.type === 'POLL_CREATED') {
                const key = `POLL_CREATED-${data.poll?.id}`;
                if (processedRef.current.has(key)) return;
                processedRef.current.add(key);
                setNotification({ type: 'new_poll', poll: data.poll });
                setShouldOpenPanel(true);
                setTimeout(() => processedRef.current.delete(key), 5000);
            } else if (data.type === 'POLL_UPDATE' && data.poll?.show_results) {
                const key = `RESULTS-${data.poll?.id}`;
                if (processedRef.current.has(key)) return;
                processedRef.current.add(key);
                setNotification({ type: 'results_ready', poll: data.poll });
                setTimeout(() => processedRef.current.delete(key), 5000);
            }
        } catch (error) {
            console.error('[usePollNotification] Parse error:', error);
        }
    }, [message, isTeacher]);

    const dismissNotification = useCallback(() => setNotification(null), []);
    const clearShouldOpenPanel = useCallback(
        () => setShouldOpenPanel(false),
        [],
    );
    return {
        notification,
        dismissNotification,
        shouldOpenPanel,
        clearShouldOpenPanel,
    };
}

export type { Poll };
