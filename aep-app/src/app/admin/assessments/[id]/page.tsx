'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Loader2, Search, Plus, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  getAssessmentById,
  createAssessment,
  updateAssessment,
  getAssessmentQuestions,
  getQuestions,
  addQuestionToAssessment,
  removeQuestionFromAssessment,
  updateAssessmentQuestion,
  getQuestionById,
  getCurrentUser,
} from '@/lib/data/store';
import type {
  Assessment,
  AssessmentQuestion,
  Question,
  AssessmentStatus,
  PracticeArea,
} from '@/lib/types';
import { PRACTICE_AREA_LABELS, DIFFICULTY_LABELS } from '@/lib/types';

export default function AssessmentEditorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [practiceArea, setPracticeArea] = useState<PracticeArea | ''>('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState('');
  const [passingScorePct, setPassingScorePct] = useState('');
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [openAt, setOpenAt] = useState('');
  const [closeAt, setCloseAt] = useState('');
  const [status, setStatus] = useState<AssessmentStatus>('draft');

  // Question selection state
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [questionMap, setQuestionMap] = useState<Record<string, Question>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [assessmentId, setAssessmentId] = useState<string | null>(isNew ? null : id);

  const loadQuestions = useCallback((currentAqList: AssessmentQuestion[]) => {
    const approved = getQuestions({ status: 'approved' });
    const selectedIds = new Set(currentAqList.map((aq) => aq.questionId));
    setAvailableQuestions(approved.filter((q) => !selectedIds.has(q.id)));

    const map: Record<string, Question> = {};
    for (const q of approved) {
      map[q.id] = q;
    }
    setQuestionMap(map);
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    if (!isNew) {
      const assessment = getAssessmentById(id);
      if (!assessment) {
        router.push('/admin/assessments');
        return;
      }
      setTitle(assessment.title);
      setDescription(assessment.description);
      setPracticeArea(assessment.practiceArea || '');
      setTimeLimitMinutes(assessment.timeLimitMinutes?.toString() ?? '');
      setPassingScorePct(assessment.passingScorePct?.toString() ?? '');
      setRandomizeQuestions(assessment.randomizeQuestions);
      setOpenAt(assessment.openAt ? assessment.openAt.slice(0, 16) : '');
      setCloseAt(assessment.closeAt ? assessment.closeAt.slice(0, 16) : '');
      setStatus(assessment.status);

      const aqList = getAssessmentQuestions(id);
      setAssessmentQuestions(aqList);
      loadQuestions(aqList);
    } else {
      loadQuestions([]);
    }

    setLoading(false);
  }, [id, isNew, router, loadQuestions]);

  function handleSave() {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    const user = getCurrentUser();
    if (!user) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      practiceArea: (practiceArea || null) as PracticeArea | null,
      timeLimitMinutes: timeLimitMinutes ? parseInt(timeLimitMinutes) : null,
      passingScorePct: passingScorePct ? parseFloat(passingScorePct) : null,
      randomizeQuestions,
      questionsCount: null as number | null,
      openAt: openAt ? new Date(openAt).toISOString() : null,
      closeAt: closeAt ? new Date(closeAt).toISOString() : null,
      status,
      createdBy: user.id,
    };

    if (isNew) {
      const created = createAssessment(payload);
      setAssessmentId(created.id);
      toast.success('Assessment created');
      router.push(`/admin/assessments/${created.id}`);
    } else {
      updateAssessment(id, payload);
      toast.success('Assessment saved');
    }
  }

  function handleAddQuestion(questionId: string) {
    const targetId = assessmentId ?? id;
    if (!targetId || targetId === 'new') {
      toast.error('Save the assessment first before adding questions');
      return;
    }

    const aq = addQuestionToAssessment(targetId, questionId, 1);
    const updated = [...assessmentQuestions, aq];
    setAssessmentQuestions(updated);
    loadQuestions(updated);
    toast.success('Question added');
  }

  function handleRemoveQuestion(questionId: string) {
    const targetId = assessmentId ?? id;
    if (!targetId) return;

    removeQuestionFromAssessment(targetId, questionId);
    const updated = assessmentQuestions.filter((aq) => aq.questionId !== questionId);
    setAssessmentQuestions(updated);
    loadQuestions(updated);
    toast.success('Question removed');
  }

  function handleWeightChange(aqId: string, weight: number) {
    updateAssessmentQuestion(aqId, { weight });
    setAssessmentQuestions((prev) =>
      prev.map((aq) => (aq.id === aqId ? { ...aq, weight } : aq))
    );
  }

  function handleSortOrderChange(aqId: string, sortOrder: number) {
    updateAssessmentQuestion(aqId, { sortOrder });
    setAssessmentQuestions((prev) =>
      prev.map((aq) => (aq.id === aqId ? { ...aq, sortOrder } : aq)).sort((a, b) => a.sortOrder - b.sortOrder)
    );
  }

  const filteredAvailable = searchTerm
    ? availableQuestions.filter(
        (q) =>
          q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.body.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableQuestions;

  const totalPoints = assessmentQuestions.reduce((sum, aq) => {
    const q = questionMap[aq.questionId];
    return sum + (q ? q.points * aq.weight : 0);
  }, 0);

  if (loading) {
    return (
      <PageShell title={isNew ? 'Create Assessment' : 'Edit Assessment'}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title={isNew ? 'Create Assessment' : 'Edit Assessment'}>
      <div className="flex flex-col gap-6">
        {/* Section A: Assessment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assessment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Assessment title"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Assessment description"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Practice Area</Label>
                <Select value={practiceArea} onValueChange={(v) => setPracticeArea(v as PracticeArea | '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select practice area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {Object.entries(PRACTICE_AREA_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as AssessmentStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(e.target.value)}
                  placeholder="Optional"
                  min={0}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  value={passingScorePct}
                  onChange={(e) => setPassingScorePct(e.target.value)}
                  placeholder="Optional"
                  min={0}
                  max={100}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="openAt">Open At</Label>
                <Input
                  id="openAt"
                  type="datetime-local"
                  value={openAt}
                  onChange={(e) => setOpenAt(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="closeAt">Close At</Label>
                <Input
                  id="closeAt"
                  type="datetime-local"
                  value={closeAt}
                  onChange={(e) => setCloseAt(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 md:col-span-2">
                <Checkbox
                  id="randomize"
                  checked={randomizeQuestions}
                  onCheckedChange={(checked) => setRandomizeQuestions(checked === true)}
                />
                <Label htmlFor="randomize" className="cursor-pointer">
                  Randomize question order
                </Label>
              </div>

              <div className="md:col-span-2">
                <Button onClick={handleSave}>
                  <Save className="size-4" />
                  Save Assessment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section B: Question Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Question Selection</CardTitle>
          </CardHeader>
          <CardContent>
            {(!assessmentId && isNew) ? (
              <p className="text-sm text-slate-500">Save the assessment first to add questions.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: Available questions */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-sm font-medium text-slate-700">Available Questions</h4>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                    <Input
                      placeholder="Search approved questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <div className="border border-slate-200 rounded-lg max-h-[400px] overflow-y-auto divide-y divide-slate-100">
                    {filteredAvailable.length === 0 ? (
                      <p className="text-xs text-slate-400 p-4 text-center">No available questions</p>
                    ) : (
                      filteredAvailable.map((q) => (
                        <div key={q.id} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50">
                          <div className="flex-1 min-w-0 mr-2">
                            <p className="text-sm font-medium truncate">{q.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-slate-400">{DIFFICULTY_LABELS[q.difficulty]}</span>
                              <span className="text-xs text-slate-400">{q.points} pts</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddQuestion(q.id)}
                          >
                            <Plus className="size-3.5" />
                            Add
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right: Selected questions */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-sm font-medium text-slate-700">
                    Selected Questions ({assessmentQuestions.length})
                  </h4>
                  <div className="border border-slate-200 rounded-lg max-h-[400px] overflow-y-auto divide-y divide-slate-100">
                    {assessmentQuestions.length === 0 ? (
                      <p className="text-xs text-slate-400 p-4 text-center">No questions selected</p>
                    ) : (
                      assessmentQuestions.map((aq) => {
                        const q = questionMap[aq.questionId];
                        return (
                          <div key={aq.id} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{q?.title ?? 'Unknown'}</p>
                              <span className="text-xs text-slate-400">{q?.points ?? 0} pts</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex items-center gap-1">
                                <Label className="text-xs text-slate-500 whitespace-nowrap">Order</Label>
                                <Input
                                  type="number"
                                  className="w-16 h-7 text-xs"
                                  value={aq.sortOrder}
                                  onChange={(e) => handleSortOrderChange(aq.id, parseInt(e.target.value) || 0)}
                                  min={1}
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <Label className="text-xs text-slate-500 whitespace-nowrap">Weight</Label>
                                <Input
                                  type="number"
                                  className="w-16 h-7 text-xs"
                                  value={aq.weight}
                                  onChange={(e) => handleWeightChange(aq.id, parseFloat(e.target.value) || 1)}
                                  min={0}
                                  step={0.5}
                                />
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive h-7 w-7 p-0"
                                onClick={() => handleRemoveQuestion(aq.questionId)}
                              >
                                <X className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="text-sm font-medium text-slate-700 text-right">
                    Total Points: {totalPoints.toFixed(1)}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
