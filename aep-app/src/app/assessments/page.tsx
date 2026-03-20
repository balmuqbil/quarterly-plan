'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ClipboardList, Clock, PlayCircle, RotateCcw, BarChart3 } from 'lucide-react';
import {
  getAssessments,
  getAssessmentQuestions,
  getSessionByUserAndAssessment,
  getCurrentUser,
} from '@/lib/data/store';
import type { Assessment, AssessmentSession, SessionStatus } from '@/lib/types';

type UserAssessmentStatus = 'not_started' | 'in_progress' | 'completed';

function getUserStatus(session: AssessmentSession | null): UserAssessmentStatus {
  if (!session) return 'not_started';
  if (session.status === 'submitted' || session.status === 'timed_out') return 'completed';
  if (session.status === 'in_progress') return 'in_progress';
  return 'not_started';
}

const USER_STATUS_STYLES: Record<UserAssessmentStatus, string> = {
  not_started: 'bg-slate-100 text-slate-600 border-slate-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
};

const USER_STATUS_LABELS: Record<UserAssessmentStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export default function MyAssessmentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<
    { assessment: Assessment; session: AssessmentSession | null; questionCount: number; userStatus: UserAssessmentStatus }[]
  >([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const now = new Date();
    const allAssessments = getAssessments();

    // Show published assessments within their open/close window
    const available = allAssessments.filter((a) => {
      if (a.status !== 'published') return false;
      if (a.openAt && new Date(a.openAt) > now) return false;
      if (a.closeAt && new Date(a.closeAt) < now) return false;
      return true;
    });

    const result = available.map((assessment) => {
      const session = getSessionByUserAndAssessment(user.id, assessment.id);
      const questionCount = getAssessmentQuestions(assessment.id).length;
      const userStatus = getUserStatus(session);
      return { assessment, session, questionCount, userStatus };
    });

    setItems(result);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <PageShell title="My Assessments">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="My Assessments">
      <div className="flex flex-col gap-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200">
            <ClipboardList className="size-12 stroke-1 mb-3" />
            <p className="text-sm font-medium text-slate-500">No assessments available</p>
            <p className="text-xs mt-1">Check back later for new assessments.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map(({ assessment, session, questionCount, userStatus }) => (
              <Card key={assessment.id} className="flex flex-col">
                <CardContent className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                      {assessment.title}
                    </h3>
                    <Badge variant="outline" className={USER_STATUS_STYLES[userStatus]}>
                      {USER_STATUS_LABELS[userStatus]}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2">{assessment.description}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-auto pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <ClipboardList className="size-3.5" />
                      {questionCount} questions
                    </span>
                    {assessment.timeLimitMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {assessment.timeLimitMinutes} min
                      </span>
                    )}
                  </div>

                  <div className="pt-2">
                    {userStatus === 'not_started' && (
                      <Button
                        className="w-full"
                        onClick={() => router.push(`/assessments/${assessment.id}/take`)}
                      >
                        <PlayCircle className="size-4" />
                        Start Assessment
                      </Button>
                    )}
                    {userStatus === 'in_progress' && (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => router.push(`/assessments/${assessment.id}/take`)}
                      >
                        <RotateCcw className="size-4" />
                        Resume
                      </Button>
                    )}
                    {userStatus === 'completed' && (
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={() => router.push(`/assessments/${assessment.id}/results`)}
                      >
                        <BarChart3 className="size-4" />
                        View Results
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
