'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, ChevronLeft, ChevronRight, Send, Clock } from 'lucide-react';
import {
  getAssessmentById,
  getAssessmentQuestions,
  getQuestionById,
  getSessionByUserAndAssessment,
  createSession,
  updateSession,
  getSessionResponses,
  saveResponse,
  scoreSession,
  getCurrentUser,
} from '@/lib/data/store';
import type { Assessment, AssessmentSession, Question, AssessmentQuestion } from '@/lib/types';

export default function TakeAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [aqMap, setAqMap] = useState<Record<string, AssessmentQuestion>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<AssessmentSession | null>(null);
  const answersRef = useRef<Record<string, string[]>>({});

  // Keep refs in sync
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const saveAllResponses = useCallback(() => {
    const s = sessionRef.current;
    if (!s) return;

    setSaveStatus('saving');
    const currentAnswers = answersRef.current;

    for (const [questionId, selectedOptions] of Object.entries(currentAnswers)) {
      if (selectedOptions.length > 0) {
        saveResponse({
          sessionId: s.id,
          questionId,
          selectedOptions,
          isCorrect: null,
          pointsEarned: 0,
          answeredAt: new Date().toISOString(),
        });
      }
    }

    // Save time remaining
    if (timeRemaining !== null) {
      updateSession(s.id, { timeRemainingSeconds: timeRemaining });
    }

    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, [timeRemaining]);

  const handleSubmit = useCallback(() => {
    const s = sessionRef.current;
    if (!s) return;

    // Save all responses
    const currentAnswers = answersRef.current;
    for (const [questionId, selectedOptions] of Object.entries(currentAnswers)) {
      if (selectedOptions.length > 0) {
        saveResponse({
          sessionId: s.id,
          questionId,
          selectedOptions,
          isCorrect: null,
          pointsEarned: 0,
          answeredAt: new Date().toISOString(),
        });
      }
    }

    // Score and submit
    scoreSession(s.id);
    updateSession(s.id, { status: 'submitted', submittedAt: new Date().toISOString() });

    // Clean up timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);

    router.push(`/assessments/${assessmentId}/results`);
  }, [assessmentId, router]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const a = getAssessmentById(assessmentId);
    if (!a) {
      router.push('/assessments');
      return;
    }
    setAssessment(a);

    // Load assessment questions
    const aqList = getAssessmentQuestions(assessmentId);
    const questionOrder = a.randomizeQuestions
      ? aqList.sort(() => Math.random() - 0.5)
      : aqList;

    const aqLookup: Record<string, AssessmentQuestion> = {};
    const loadedQuestions: Question[] = [];
    for (const aq of questionOrder) {
      const q = getQuestionById(aq.questionId);
      if (q) {
        loadedQuestions.push(q);
        aqLookup[q.id] = aq;
      }
    }
    setQuestions(loadedQuestions);
    setAqMap(aqLookup);

    // Create or resume session
    let existingSession = getSessionByUserAndAssessment(user.id, assessmentId);

    if (existingSession && (existingSession.status === 'submitted' || existingSession.status === 'timed_out')) {
      // Already submitted, go to results
      router.push(`/assessments/${assessmentId}/results`);
      return;
    }

    if (!existingSession) {
      existingSession = createSession({
        assessmentId,
        userId: user.id,
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        submittedAt: null,
        timeRemainingSeconds: a.timeLimitMinutes ? a.timeLimitMinutes * 60 : null,
        questionOrder: loadedQuestions.map((q) => q.id),
      });
    } else if (existingSession.status === 'not_started') {
      existingSession = updateSession(existingSession.id, {
        status: 'in_progress',
        startedAt: new Date().toISOString(),
      })!;
    }

    setSession(existingSession);

    // Load existing responses if resuming
    const existingResponses = getSessionResponses(existingSession.id);
    const answerMap: Record<string, string[]> = {};
    for (const r of existingResponses) {
      answerMap[r.questionId] = r.selectedOptions;
    }
    setAnswers(answerMap);

    // Set timer
    if (existingSession.timeRemainingSeconds !== null) {
      setTimeRemaining(existingSession.timeRemainingSeconds);
    } else if (a.timeLimitMinutes) {
      setTimeRemaining(a.timeLimitMinutes * 60);
    }

    setLoading(false);
  }, [assessmentId, router]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || loading) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          // Time's up - auto-submit
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, timeRemaining === null, handleSubmit]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (loading || !session) return;

    autoSaveRef.current = setInterval(() => {
      saveAllResponses();
    }, 30000);

    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [loading, session, saveAllResponses]);

  function handleAnswerChange(questionId: string, optionId: string, questionType: string) {
    setAnswers((prev) => {
      const updated = { ...prev };
      if (questionType === 'mcq') {
        updated[questionId] = [optionId];
      } else {
        // multi_select: toggle
        const current = prev[questionId] || [];
        if (current.includes(optionId)) {
          updated[questionId] = current.filter((id) => id !== optionId);
        } else {
          updated[questionId] = [...current, optionId];
        }
      }
      return updated;
    });

    // Save this specific response immediately
    if (session) {
      const selectedOptions =
        questionType === 'mcq'
          ? [optionId]
          : (() => {
              const current = answers[questionId] || [];
              return current.includes(optionId)
                ? current.filter((id) => id !== optionId)
                : [...current, optionId];
            })();

      saveResponse({
        sessionId: session.id,
        questionId,
        selectedOptions,
        isCorrect: null,
        pointsEarned: 0,
        answeredAt: new Date().toISOString(),
      });
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  const answeredCount = questions.filter((q) => (answers[q.id]?.length ?? 0) > 0).length;
  const currentQuestion = questions[currentIndex];
  const isLowTime = timeRemaining !== null && timeRemaining < 300;

  if (loading || !assessment || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left sidebar: Question palette */}
      <div className="w-20 bg-white border-r border-slate-200 flex flex-col p-2 gap-1 overflow-y-auto shrink-0">
        <p className="text-[10px] font-medium text-slate-400 text-center mb-1 uppercase tracking-wider">
          Questions
        </p>
        {questions.map((q, idx) => {
          const isAnswered = (answers[q.id]?.length ?? 0) > 0;
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`
                w-full aspect-square rounded-lg text-xs font-semibold flex items-center justify-center transition-colors
                ${isCurrent ? 'bg-blue-600 text-white' : isAnswered ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}
                hover:opacity-80
              `}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar: Progress + Timer */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{answeredCount} of {questions.length} answered</span>
              <span>{Math.round((answeredCount / questions.length) * 100)}%</span>
            </div>
            <Progress value={(answeredCount / questions.length) * 100} className="h-2" />
          </div>

          {timeRemaining !== null && (
            <div className={`flex items-center gap-1.5 font-mono text-sm font-semibold shrink-0 ${isLowTime ? 'text-red-600' : 'text-slate-700'}`}>
              <Clock className="size-4" />
              {formatTime(timeRemaining)}
            </div>
          )}

          <div className="text-xs text-slate-400 shrink-0">
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && 'Saved'}
          </div>
        </div>

        {/* Question content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="text-xs text-slate-400 mb-2">
              Question {currentIndex + 1} of {questions.length}
            </div>
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-base mb-1">{currentQuestion.title}</h2>
                <p className="text-sm text-slate-600 mb-6 whitespace-pre-wrap">{currentQuestion.body}</p>

                {currentQuestion.questionType === 'mcq' ? (
                  <RadioGroup
                    value={answers[currentQuestion.id]?.[0] ?? ''}
                    onValueChange={(value) =>
                      handleAnswerChange(currentQuestion.id, value, 'mcq')
                    }
                  >
                    <div className="flex flex-col gap-3">
                      {currentQuestion.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                          onClick={() =>
                            handleAnswerChange(currentQuestion.id, option.id, 'mcq')
                          }
                        >
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label htmlFor={option.id} className="cursor-pointer flex-1 text-sm">
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <div className="flex flex-col gap-3">
                    {currentQuestion.options.map((option) => {
                      const isChecked = answers[currentQuestion.id]?.includes(option.id) ?? false;
                      return (
                        <div
                          key={option.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                          onClick={() =>
                            handleAnswerChange(currentQuestion.id, option.id, 'multi_select')
                          }
                        >
                          <Checkbox
                            id={option.id}
                            checked={isChecked}
                            onCheckedChange={() =>
                              handleAnswerChange(currentQuestion.id, option.id, 'multi_select')
                            }
                          />
                          <Label htmlFor={option.id} className="cursor-pointer flex-1 text-sm">
                            {option.text}
                          </Label>
                        </div>
                      );
                    })}
                    <p className="text-xs text-slate-400 mt-1">Select all that apply</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>

          <Button
            variant="destructive"
            onClick={() => setConfirmOpen(true)}
          >
            <Send className="size-4" />
            Submit Assessment
          </Button>

          <Button
            variant="outline"
            onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            disabled={currentIndex === questions.length - 1}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Submit confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assessment</DialogTitle>
            <DialogDescription>
              You have answered {answeredCount} of {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="block mt-1 text-amber-600 font-medium">
                  Warning: {questions.length - answeredCount} questions are unanswered.
                </span>
              )}
              Are you sure you want to submit? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSubmit}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
