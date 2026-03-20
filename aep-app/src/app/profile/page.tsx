'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCurrentUser,
  getUserScores,
  getProficiencyRatings,
  getAssessmentById,
  getTeamById,
  getSkillById,
} from '@/lib/data/store';
import type { User, Score, ProficiencyRating } from '@/lib/types';
import {
  ROLE_LABELS,
  PRACTICE_AREA_LABELS,
  PROFICIENCY_LABELS,
  PROFICIENCY_COLORS,
} from '@/lib/types';
import { PageShell } from '@/components/layout/page-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Mail, Briefcase, Users, Shield } from 'lucide-react';

// ---- Helpers ----

function getLatestRatingsPerSkill(
  ratings: ProficiencyRating[]
): ProficiencyRating[] {
  const map = new Map<string, ProficiencyRating>();
  for (const r of ratings) {
    const existing = map.get(r.skillId);
    if (!existing || r.ratedAt > existing.ratedAt) {
      map.set(r.skillId, r);
    }
  }
  return Array.from(map.values());
}

// ---- Components ----

function PersonalInfoCard({ user }: { user: User }) {
  const team = user.teamId ? getTeamById(user.teamId) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="text-lg font-semibold">
                {user.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </span>
            </div>
            <div>
              <div className="font-semibold text-slate-900">
                {user.fullName}
              </div>
              <div className="text-sm text-muted-foreground">Full Name</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="size-5 text-muted-foreground" />
            <div>
              <div className="font-medium text-slate-900">{user.email}</div>
              <div className="text-sm text-muted-foreground">Email</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield className="size-5 text-muted-foreground" />
            <div>
              <div className="font-medium text-slate-900">
                {ROLE_LABELS[user.role]}
              </div>
              <div className="text-sm text-muted-foreground">Role</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="size-5 text-muted-foreground" />
            <div>
              <div className="font-medium text-slate-900">
                {team?.name ?? 'Unassigned'}
              </div>
              <div className="text-sm text-muted-foreground">Team</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Briefcase className="size-5 text-muted-foreground" />
            <div>
              <div className="font-medium text-slate-900">
                {user.practiceArea
                  ? PRACTICE_AREA_LABELS[user.practiceArea]
                  : 'Not assigned'}
              </div>
              <div className="text-sm text-muted-foreground">
                Practice Area
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AssessmentHistoryTable({ scores }: { scores: Score[] }) {
  const sortedScores = [...scores].sort((a, b) =>
    b.scoredAt.localeCompare(a.scoredAt)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment History</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedScores.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No assessments completed yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assessment</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                  <TableHead className="text-right">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedScores.map((score) => {
                  const assessment = getAssessmentById(score.assessmentId);
                  return (
                    <TableRow key={score.id}>
                      <TableCell className="font-medium">
                        {assessment?.title ?? score.assessmentId}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Date(score.scoredAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {score.totalPoints}/{score.maxPoints}
                      </TableCell>
                      <TableCell className="text-right">
                        {score.percentage}%
                      </TableCell>
                      <TableCell className="text-right">
                        {score.passed === null ? (
                          <Badge variant="outline">N/A</Badge>
                        ) : score.passed ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Pass
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            Fail
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SkillProficiencyOverview({
  ratings,
}: {
  ratings: ProficiencyRating[];
}) {
  const latest = getLatestRatingsPerSkill(ratings);
  const sorted = [...latest].sort((a, b) => b.percentage - a.percentage);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Proficiency Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No proficiency data available yet. Complete assessments to see your
            skill levels.
          </p>
        ) : (
          <div className="space-y-3">
            {sorted.map((rating) => {
              const skill = getSkillById(rating.skillId);
              return (
                <div key={rating.skillId}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">
                        {skill?.name ?? rating.skillId}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${PROFICIENCY_COLORS[rating.level]}`}
                      >
                        {PROFICIENCY_LABELS[rating.level]}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground">
                      {rating.percentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${rating.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---- Page ----

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [ratings, setRatings] = useState<ProficiencyRating[]>([]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    setScores(getUserScores(currentUser.id));
    setRatings(getProficiencyRatings(currentUser.id));
    setLoading(false);
  }, [router]);

  if (loading || !user) {
    return null;
  }

  return (
    <PageShell title="My Profile">
      <div className="flex flex-col gap-6">
        <PersonalInfoCard user={user} />
        <AssessmentHistoryTable scores={scores} />
        <SkillProficiencyOverview ratings={ratings} />
      </div>
    </PageShell>
  );
}
