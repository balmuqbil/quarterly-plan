'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, Plus, Pencil, Trash2, Loader2, FileQuestion } from 'lucide-react';
import { toast } from 'sonner';
import {
  getQuestions,
  getAllSkills,
  deleteQuestion,
  type QuestionFilters,
} from '@/lib/data/store';
import type {
  Question,
  Skill,
  QuestionStatus,
  DifficultyLevel,
  QuestionType,
} from '@/lib/types';
import { DIFFICULTY_LABELS } from '@/lib/types';

// ============ Status / Difficulty badge helpers ============

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

const DIFFICULTY_STYLES: Record<DifficultyLevel, string> = {
  easy: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  medium: 'bg-amber-100 text-amber-800 border border-amber-200',
  hard: 'bg-red-100 text-red-800 border border-red-200',
};

const TYPE_LABELS: Record<QuestionType, string> = {
  mcq: 'MCQ',
  multi_select: 'Multi-Select',
};

// ============ Main Page ============

export default function QuestionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuestionStatus | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all');
  const [skillFilter, setSkillFilter] = useState<string>('all');

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const loadData = useCallback(() => {
    const filters: QuestionFilters = {};
    if (statusFilter !== 'all') filters.status = statusFilter;
    if (difficultyFilter !== 'all') filters.difficulty = difficultyFilter;
    if (typeFilter !== 'all') filters.questionType = typeFilter;
    if (skillFilter !== 'all') filters.skillId = skillFilter;
    if (search.trim()) filters.search = search.trim();

    setQuestions(getQuestions(filters));
  }, [search, statusFilter, difficultyFilter, typeFilter, skillFilter]);

  useEffect(() => {
    setSkills(getAllSkills());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      loadData();
    }
  }, [loading, loadData]);

  function handleDelete(id: string, title: string) {
    setDeleteTarget({ id, title });
    setDeleteDialogOpen(true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const success = deleteQuestion(deleteTarget.id);
    if (success) {
      toast.success('Question deleted successfully');
      loadData();
    } else {
      toast.error('Failed to delete question');
    }
    setDeleteTarget(null);
    setDeleteDialogOpen(false);
  }

  function getSkillName(skillId: string | null): string {
    if (!skillId) return '--';
    const skill = skills.find((s) => s.id === skillId);
    return skill?.name ?? '--';
  }

  if (loading) {
    return (
      <PageShell title="Question Bank">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Question Bank">
      <div className="flex flex-col gap-4">
        {/* Top bar: search, filters, add button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as QuestionStatus | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={(val) => setDifficultyFilter(val as DifficultyLevel | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val as QuestionType | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="mcq">MCQ</SelectItem>
              <SelectItem value="multi_select">Multi-Select</SelectItem>
            </SelectContent>
          </Select>

          <Select value={skillFilter} onValueChange={(val) => setSkillFilter(val ?? 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Skill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skills</SelectItem>
              {skills.map((skill) => (
                <SelectItem key={skill.id} value={skill.id}>
                  {skill.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => router.push('/admin/questions/new')}>
            <Plus className="size-4" data-icon="inline-start" />
            Add Question
          </Button>
        </div>

        {/* Questions table */}
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200">
            <FileQuestion className="size-12 stroke-1 mb-3" />
            <p className="text-sm font-medium text-slate-500">No questions found</p>
            <p className="text-xs mt-1">
              {search || statusFilter !== 'all' || difficultyFilter !== 'all' || typeFilter !== 'all' || skillFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by adding your first question.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Skill</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((q) => (
                  <TableRow
                    key={q.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/admin/questions/${q.id}`)}
                  >
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {q.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{TYPE_LABELS[q.questionType]}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_STYLES[q.difficulty]}`}>
                        {DIFFICULTY_LABELS[q.difficulty]}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-slate-600">
                      {getSkillName(q.skillId)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[q.status]}`}>
                        {STATUS_LABELS[q.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {q.points}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/questions/${q.id}`);
                          }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(q.id, q.title);
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This will also
              remove it from any assessments. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
