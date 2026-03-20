'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Trophy, Target, BarChart3 } from 'lucide-react';
import {
  getAssessmentById,
  getSessionByUserAndAssessment,
  getScoreBySession,
  getSessionResponses,
  getProficiencyRatings,
  getPercentile,
  getQuestionById,
  getSkillById,
  getCurrentUser,
} from '@/lib/data/store';
import type {
  Score,
  SessionResponse,
  ProficiencyRating,
  Question,
  Skill,
  Assessment,
} from '@/lib/types';
import { PROFICIENCY_LABELS, PROFICIENCY_COLORS } from '@/lib/types';

export default function AssessmentResultsPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [score, setScore] = useState<Score | null>(null);
  const [percentile, setPercentile] = useState<number | null>(null);
  const [responses, setResponses] = useState<SessionResponse[]>([]);
  const [questions, setQuestions] = useState<Record<string, Question>>({});
  const [proficiencies, setProficiencies] = useState<ProficiencyRating[]>([]);
  const [skills, setSkills] = useState<Record<string, Skill>>({});

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

    const session = getSessionByUserAndAssessment(user.id, assessmentId);
    if (!session || (session.status !== 'submitted' && session.status !== 'timed_out')) {
      router.push('/assessments');
      return;
    }

    const sessionScore = getScoreBySession(session.id);
    setScore(sessionScore);

    if (sessionScore) {
      setPercentile(getPercentile(sessionScore.id));
    }

    const sessionResponses = getSessionResponses(session.id);
    setResponses(sessionResponses);

    // Load question details
    const qMap: Record<string, Question> = {};
    for (const r of sessionResponses) {
      const q = getQuestionById(r.questionId);
      if (q) qMap[q.id] = q;
    }
    setQuestions(qMap);

    // Load proficiency ratings
    const ratings = getProficiencyRatings(user.id).filter(
      (pr) => sessionScore && pr.scoreId === sessionScore.id
    );
    setProficiencies(ratings);

    // Load skill names
    const sMap: Record<string, Skill> = {};
    for (const pr of ratings) {
      const skill = getSkillById(pr.skillId);
      if (skill) sMap[skill.id] = skill;
    }
    setSkills(sMap);

    setLoading(false);
  }, [assessmentId, router]);

  function getCorrectAnswerText(question: Question): string {
    return question.options
      .filter((o) => o.isCorrect)
      .map((o) => o.text)
      .join(', ');
  }

  function getSelectedAnswerText(question: Question, response: SessionResponse): string {
    return question.options
      .filter((o) => response.selectedOptions.includes(o.id))
      .map((o) => o.text)
      .join(', ');
  }

  if (loading) {
    return (
      <PageShell title="Assessment Results">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Assessment Results">
      <div className="flex flex-col gap-6">
        {/* Back button */}
        <div>
          <Button variant="outline" onClick={() => router.push('/assessments')}>
            <ArrowLeft className="size-4" />
            Back to Assessments
          </Button>
        </div>

        {/* Score summary */}
        {score && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5 flex flex-col items-center gap-2">
                <Trophy className="size-8 text-amber-500" />
                <p className="text-2xl font-bold">{score.percentage.toFixed(1)}%</p>
                <p className="text-xs text-slate-500">Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex flex-col items-center gap-2">
                <Target className="size-8 text-blue-500" />
                <p className="text-2xl font-bold">
                  {score.totalPoints} / {score.maxPoints}
                </p>
                <p className="text-xs text-slate-500">Points</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex flex-col items-center gap-2">
                {score.passed === null ? (
                  <Badge variant="outline" className="text-sm">N/A</Badge>
                ) : score.passed ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200 text-sm">
                    Passed
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 border-red-200 text-sm">
                    Failed
                  </Badge>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  {assessment?.passingScorePct
                    ? `Passing: ${assessment.passingScorePct}%`
                    : 'No passing threshold'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex flex-col items-center gap-2">
                <BarChart3 className="size-8 text-purple-500" />
                <p className="text-2xl font-bold">
                  {percentile !== null ? `${percentile.toFixed(0)}th` : '--'}
                </p>
                <p className="text-xs text-slate-500">Percentile</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Per-question breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Question Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Your Answer</TableHead>
                  <TableHead>Correct Answer</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="text-center">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((r, idx) => {
                  const q = questions[r.questionId];
                  if (!q) return null;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="text-slate-500">{idx + 1}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {q.title}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-slate-600">
                        {getSelectedAnswerText(q, r) || '--'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-slate-600">
                        {getCorrectAnswerText(q)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.pointsEarned} / {q.points}
                      </TableCell>
                      <TableCell className="text-center">
                        {r.isCorrect ? (
                          <CheckCircle2 className="size-5 text-green-600 inline-block" />
                        ) : (
                          <XCircle className="size-5 text-red-500 inline-block" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Skill proficiency */}
        {proficiencies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Skill Proficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {proficiencies.map((pr) => {
                  const skill = skills[pr.skillId];
                  return (
                    <div
                      key={pr.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50"
                    >
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="text-sm font-medium truncate">
                          {skill?.name ?? 'Unknown Skill'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {pr.pointsEarned} / {pr.maxPoints} pts ({pr.percentage.toFixed(0)}%)
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={PROFICIENCY_COLORS[pr.level]}
                      >
                        {PROFICIENCY_LABELS[pr.level]}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
