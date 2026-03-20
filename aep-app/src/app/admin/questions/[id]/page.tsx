'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  getQuestionById,
  getAllSkills,
  createQuestion,
  updateQuestion,
  updateQuestionStatus,
  getCurrentUser,
} from '@/lib/data/store';
import type {
  Question,
  QuestionOption,
  Skill,
  QuestionType,
  DifficultyLevel,
  BloomsLevel,
  QuestionStatus,
} from '@/lib/types';
import { DIFFICULTY_LABELS, BLOOMS_LABELS } from '@/lib/types';
import { QuestionPreview } from '@/components/questions/question-preview';

// ============ Constants ============

const STATUS_STYLES: Record<QuestionStatus, string> = {
  draft: 'bg-slate-100 text-slate-700 border border-slate-200',
  review: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  approved: 'bg-green-100 text-green-800 border border-green-200',
};

const STATUS_LABELS: Record<QuestionStatus, string> = {
  draft: 'Draft',
  review: 'Review',
  approved: 'Approved',
};

function generateOptionId(): string {
  return 'opt_' + Date.now() + '_' + Math.random().toString(36).slice(2);
}

function createEmptyOption(): QuestionOption {
  return { id: generateOptionId(), text: '', isCorrect: false };
}

// ============ Main Page ============

export default function QuestionEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('mcq');
  const [options, setOptions] = useState<QuestionOption[]>([
    createEmptyOption(),
    createEmptyOption(),
  ]);
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [bloomsLevel, setBloomsLevel] = useState<BloomsLevel>('understand');
  const [skillId, setSkillId] = useState<string>('none');
  const [points, setPoints] = useState(1);
  const [status, setStatus] = useState<QuestionStatus>('draft');
  const [reviewNotes, setReviewNotes] = useState('');

  // Current user for review actions
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);

  useEffect(() => {
    const allSkills = getAllSkills();
    setSkills(allSkills);

    const user = getCurrentUser();
    if (user) {
      setCurrentUser({ id: user.id, role: user.role });
    }

    if (!isNew) {
      const question = getQuestionById(id);
      if (question) {
        setTitle(question.title);
        setBody(question.body);
        setQuestionType(question.questionType);
        setOptions(question.options.length >= 2 ? question.options : [createEmptyOption(), createEmptyOption()]);
        setExplanation(question.explanation);
        setDifficulty(question.difficulty);
        setBloomsLevel(question.bloomsLevel);
        setSkillId(question.skillId ?? 'none');
        setPoints(question.points);
        setStatus(question.status);
        setReviewNotes(question.reviewNotes);
      } else {
        toast.error('Question not found');
        router.push('/admin/questions');
        return;
      }
    }

    setLoading(false);
  }, [id, isNew, router]);

  // ============ Option handlers ============

  function updateOptionText(index: number, text: string) {
    setOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, text } : opt)));
  }

  function toggleOptionCorrect(index: number) {
    setOptions((prev) => {
      if (questionType === 'mcq') {
        // MCQ: only one correct answer
        return prev.map((opt, i) => ({ ...opt, isCorrect: i === index }));
      } else {
        // Multi-select: toggle individual
        return prev.map((opt, i) => (i === index ? { ...opt, isCorrect: !opt.isCorrect } : opt));
      }
    });
  }

  function addOption() {
    if (options.length >= 6) {
      toast.error('Maximum 6 options allowed');
      return;
    }
    setOptions((prev) => [...prev, createEmptyOption()]);
  }

  function removeOption(index: number) {
    if (options.length <= 2) {
      toast.error('Minimum 2 options required');
      return;
    }
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  // When question type changes, reset correct answers if switching to MCQ
  function handleTypeChange(newType: QuestionType) {
    setQuestionType(newType);
    if (newType === 'mcq') {
      // Keep only the first correct answer if multiple are selected
      const firstCorrectIdx = options.findIndex((o) => o.isCorrect);
      setOptions((prev) =>
        prev.map((opt, i) => ({
          ...opt,
          isCorrect: i === (firstCorrectIdx >= 0 ? firstCorrectIdx : 0),
        }))
      );
    }
  }

  // ============ Save ============

  function handleSave() {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!body.trim()) {
      toast.error('Question body is required');
      return;
    }
    if (options.some((o) => !o.text.trim())) {
      toast.error('All options must have text');
      return;
    }
    if (!options.some((o) => o.isCorrect)) {
      toast.error('At least one correct answer is required');
      return;
    }

    const questionData = {
      title: title.trim(),
      body: body.trim(),
      questionType,
      options,
      explanation: explanation.trim(),
      difficulty,
      bloomsLevel,
      skillId: skillId === 'none' ? null : skillId,
      points,
      status,
      createdBy: currentUser?.id ?? '',
      reviewedBy: null,
      reviewNotes,
    };

    if (isNew) {
      createQuestion(questionData);
      toast.success('Question created successfully');
    } else {
      updateQuestion(id, questionData);
      toast.success('Question updated successfully');
    }

    router.push('/admin/questions');
  }

  // ============ Status actions ============

  function handleSubmitForReview() {
    if (!isNew) {
      updateQuestionStatus(id, 'review');
      toast.success('Question submitted for review');
      router.push('/admin/questions');
    }
  }

  function handleApprove() {
    if (!isNew && currentUser) {
      updateQuestionStatus(id, 'approved', currentUser.id, reviewNotes);
      toast.success('Question approved');
      router.push('/admin/questions');
    }
  }

  function handleReject() {
    if (!isNew && currentUser) {
      updateQuestionStatus(id, 'draft', currentUser.id, reviewNotes);
      toast.success('Question rejected and returned to draft');
      router.push('/admin/questions');
    }
  }

  // ============ Build preview question object ============

  const previewQuestion: Question = {
    id: isNew ? 'preview' : id,
    title: title || 'Untitled Question',
    body: body || '',
    questionType,
    options,
    explanation,
    difficulty,
    bloomsLevel,
    skillId: skillId === 'none' ? null : skillId,
    status,
    createdBy: currentUser?.id ?? '',
    reviewedBy: null,
    reviewNotes,
    points,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const canApprove =
    currentUser &&
    (currentUser.role === 'admin' || currentUser.role === 'manager') &&
    status === 'review';

  if (loading) {
    return (
      <PageShell title={isNew ? 'New Question' : 'Edit Question'}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title={isNew ? 'New Question' : 'Edit Question'}>
      <div className="flex flex-col gap-6 max-w-4xl">
        {/* Back button */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/questions')}>
            <ArrowLeft className="size-4" data-icon="inline-start" />
            Back to Questions
          </Button>
          {!isNew && (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
              {STATUS_LABELS[status]}
            </span>
          )}
          <div className="ml-auto">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="size-4" data-icon="inline-start" />
              {showPreview ? 'Hide Preview' : 'Preview'}
            </Button>
          </div>
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Question Preview</h3>
            <QuestionPreview question={previewQuestion} showAnswer />
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="q-title">Title</Label>
            <Input
              id="q-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a concise question title"
            />
          </div>

          {/* Body */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="q-body">Question Body</Label>
            <textarea
              id="q-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write the full question text here..."
              rows={5}
              className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
            />
          </div>

          {/* Question Type */}
          <div className="flex flex-col gap-1.5">
            <Label>Question Type</Label>
            <Select value={questionType} onValueChange={(val) => handleTypeChange(val as QuestionType)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                <SelectItem value="multi_select">Multi-Select</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options editor */}
          <div className="flex flex-col gap-3">
            <Label>
              Options
              <span className="text-xs font-normal text-slate-500 ml-2">
                {questionType === 'mcq'
                  ? '(Select one correct answer)'
                  : '(Check all correct answers)'}
              </span>
            </Label>

            <div className="flex flex-col gap-2">
              {options.map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8">
                    {questionType === 'mcq' ? (
                      <button
                        type="button"
                        onClick={() => toggleOptionCorrect(idx)}
                        className={`size-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          opt.isCorrect
                            ? 'border-primary bg-primary'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {opt.isCorrect && (
                          <span className="size-2 rounded-full bg-white" />
                        )}
                      </button>
                    ) : (
                      <Checkbox
                        checked={opt.isCorrect}
                        onCheckedChange={() => toggleOptionCorrect(idx)}
                      />
                    )}
                  </div>
                  <Input
                    value={opt.text}
                    onChange={(e) => updateOptionText(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeOption(idx)}
                    disabled={options.length <= 2}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            {options.length < 6 && (
              <Button variant="outline" size="sm" className="w-fit" onClick={addOption}>
                <Plus className="size-3.5" data-icon="inline-start" />
                Add Option
              </Button>
            )}
          </div>

          {/* Explanation */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="q-explanation">Explanation</Label>
            <textarea
              id="q-explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why the correct answer(s) are correct..."
              rows={3}
              className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
            />
          </div>

          {/* Difficulty + Bloom's + Skill + Points row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(val) => setDifficulty(val as DifficultyLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Bloom&apos;s Taxonomy Level</Label>
              <Select value={bloomsLevel} onValueChange={(val) => setBloomsLevel(val as BloomsLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(BLOOMS_LABELS) as [BloomsLevel, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Skill</Label>
              <Select value={skillId} onValueChange={(val) => setSkillId(val ?? 'none')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No skill assigned</SelectItem>
                  {skills.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="q-points">Points</Label>
              <Input
                id="q-points"
                type="number"
                min={1}
                max={100}
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* Review section (only for questions in review status) */}
          {canApprove && (
            <div className="border-t border-slate-200 pt-5 flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-slate-900">Review Actions</h3>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="review-notes">Review Notes (optional)</Label>
                <textarea
                  id="review-notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about this review..."
                  rows={2}
                  className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleApprove}>Approve</Button>
                <Button variant="destructive" onClick={handleReject}>
                  Reject
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom action bar */}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave}>
            {isNew ? 'Create Question' : 'Save Changes'}
          </Button>
          {!isNew && status === 'draft' && (
            <Button variant="outline" onClick={handleSubmitForReview}>
              Submit for Review
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push('/admin/questions')}>
            Cancel
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
