'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2, ClipboardList, Clock, CalendarDays } from 'lucide-react';
import { getAssessments, getAssessmentQuestions, getCurrentUser } from '@/lib/data/store';
import type { Assessment, AssessmentStatus } from '@/lib/types';
import { PRACTICE_AREA_LABELS } from '@/lib/types';

const STATUS_STYLES: Record<AssessmentStatus, string> = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  published: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-red-100 text-red-800 border-red-200',
  archived: 'bg-slate-100 text-slate-500 border-slate-200',
};

const STATUS_LABELS: Record<AssessmentStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  closed: 'Closed',
  archived: 'Archived',
};

type FilterTab = 'all' | AssessmentStatus;

export default function AdminAssessmentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<FilterTab>('all');

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const all = getAssessments();
    setAssessments(all);

    const counts: Record<string, number> = {};
    for (const a of all) {
      counts[a.id] = getAssessmentQuestions(a.id).length;
    }
    setQuestionCounts(counts);
    setLoading(false);
  }, [router]);

  const filtered = tab === 'all' ? assessments : assessments.filter((a) => a.status === tab);

  if (loading) {
    return (
      <PageShell title="Assessments">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Assessments">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={() => router.push('/admin/assessments/new')}>
            <Plus className="size-4" />
            Create Assessment
          </Button>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200">
            <ClipboardList className="size-12 stroke-1 mb-3" />
            <p className="text-sm font-medium text-slate-500">No assessments found</p>
            <p className="text-xs mt-1">
              {tab !== 'all' ? 'Try a different filter.' : 'Create your first assessment to get started.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((a) => (
              <Card
                key={a.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/admin/assessments/${a.id}`)}
              >
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">{a.title}</h3>
                    <Badge variant="outline" className={STATUS_STYLES[a.status]}>
                      {STATUS_LABELS[a.status]}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2">{a.description}</p>

                  <div className="flex flex-wrap items-center gap-2">
                    {a.practiceArea && (
                      <Badge variant="secondary" className="text-xs">
                        {PRACTICE_AREA_LABELS[a.practiceArea]}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-auto pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <ClipboardList className="size-3.5" />
                      {questionCounts[a.id] ?? 0} questions
                    </span>
                    {a.timeLimitMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {a.timeLimitMinutes} min
                      </span>
                    )}
                  </div>

                  {(a.openAt || a.closeAt) && (
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <CalendarDays className="size-3.5" />
                      {a.openAt ? new Date(a.openAt).toLocaleDateString() : '...'}{' '}
                      - {a.closeAt ? new Date(a.closeAt).toLocaleDateString() : '...'}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
