'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCurrentUser,
  getUsers,
  getTeams,
  getTeamById,
  getUserScores,
  getProficiencyRatings,
  getAssessmentById,
  getSessionsByUser,
  getAllSkills,
  getSkillById,
} from '@/lib/data/store';
import type {
  User,
  Team,
  Score,
  ProficiencyRating,
  ProficiencyLevel,
} from '@/lib/types';
import {
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
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  User as UserIcon,
} from 'lucide-react';

// ---- Types ----

interface MemberRow {
  user: User;
  assessmentsCompleted: number;
  avgScore: number;
  lastAssessmentDate: string | null;
  scores: Score[];
  ratings: ProficiencyRating[];
}

// ---- Helpers ----

function getLatestRatingsPerSkill(
  ratings: ProficiencyRating[]
): Map<string, ProficiencyRating> {
  const map = new Map<string, ProficiencyRating>();
  for (const r of ratings) {
    const existing = map.get(r.skillId);
    if (!existing || r.ratedAt > existing.ratedAt) {
      map.set(r.skillId, r);
    }
  }
  return map;
}

function getGapSkills(
  latestRatings: Map<string, ProficiencyRating>
): ProficiencyRating[] {
  const belowProficient: ProficiencyLevel[] = ['foundational', 'developing'];
  return Array.from(latestRatings.values()).filter((r) =>
    belowProficient.includes(r.level)
  );
}

// ---- Components ----

function MemberDetailPanel({ member }: { member: MemberRow }) {
  const latestRatings = getLatestRatingsPerSkill(member.ratings);
  const gapSkills = getGapSkills(latestRatings);
  const allSkills = getAllSkills();
  const skillMap = new Map(allSkills.map((s) => [s.id, s]));

  return (
    <div className="space-y-4 bg-slate-50 p-4">
      {/* Skill Proficiency Badges */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-slate-700">
          Skill Proficiency Levels
        </h4>
        {latestRatings.size === 0 ? (
          <p className="text-sm text-muted-foreground">
            No proficiency data available.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {Array.from(latestRatings.entries()).map(([skillId, rating]) => {
              const skill = skillMap.get(skillId);
              return (
                <Badge
                  key={skillId}
                  variant="outline"
                  className={PROFICIENCY_COLORS[rating.level]}
                >
                  {skill?.name ?? skillId}:{' '}
                  {PROFICIENCY_LABELS[rating.level]} ({rating.percentage}%)
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Assessments */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-slate-700">
          Completed Assessments
        </h4>
        {member.scores.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No completed assessments.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assessment</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {member.scores.map((score) => {
                  const assessment = getAssessmentById(score.assessmentId);
                  return (
                    <TableRow key={score.id}>
                      <TableCell className="font-medium">
                        {assessment?.title ?? score.assessmentId}
                      </TableCell>
                      <TableCell className="text-right">
                        {score.totalPoints}/{score.maxPoints}
                      </TableCell>
                      <TableCell className="text-right">
                        {score.percentage}%
                      </TableCell>
                      <TableCell className="text-right">
                        {new Date(score.scoredAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Gap Analysis */}
      <div>
        <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
          <AlertTriangle className="size-4 text-amber-500" />
          Gap Analysis (Below Proficient)
        </h4>
        {gapSkills.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No skill gaps identified. All assessed skills are at proficient
            level or above.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {gapSkills.map((rating) => {
              const skill = skillMap.get(rating.skillId);
              return (
                <Badge
                  key={rating.id}
                  variant="outline"
                  className={PROFICIENCY_COLORS[rating.level]}
                >
                  {skill?.name ?? rating.skillId}:{' '}
                  {PROFICIENCY_LABELS[rating.level]} ({rating.percentage}%)
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Page ----

export default function ManagerTeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // Find the team this manager leads
    const teams = getTeams();
    const managerTeam =
      teams.find((t) => t.managerId === currentUser.id) ??
      (currentUser.teamId ? getTeamById(currentUser.teamId) : null);

    if (!managerTeam) {
      setLoading(false);
      return;
    }
    setTeam(managerTeam);

    // Get team members
    const allUsers = getUsers();
    const teamMembers = allUsers.filter(
      (u) => u.teamId === managerTeam.id && u.isActive
    );

    const memberRows: MemberRow[] = teamMembers.map((u) => {
      const scores = getUserScores(u.id);
      const ratings = getProficiencyRatings(u.id);
      const sessions = getSessionsByUser(u.id);
      const completedSessions = sessions.filter(
        (s) => s.status === 'submitted'
      );
      const avgScore =
        scores.length > 0
          ? Math.round(
              scores.reduce((sum, s) => sum + s.percentage, 0) / scores.length
            )
          : 0;
      const lastDate =
        scores.length > 0
          ? scores.sort((a, b) => b.scoredAt.localeCompare(a.scoredAt))[0]
              .scoredAt
          : null;

      return {
        user: u,
        assessmentsCompleted: completedSessions.length,
        avgScore,
        lastAssessmentDate: lastDate,
        scores,
        ratings,
      };
    });

    setMembers(memberRows);
    setLoading(false);
  }, [router]);

  if (loading || !user) {
    return null;
  }

  return (
    <PageShell title="Team Members">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {team ? team.name : 'No Team Assigned'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {members.length} team member{members.length !== 1 ? 's' : ''}
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Practice Area</TableHead>
                    <TableHead className="text-right">
                      Assessments Completed
                    </TableHead>
                    <TableHead className="text-right">Avg Score</TableHead>
                    <TableHead className="text-right">
                      Last Assessment
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No team members found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => {
                      const isExpanded = expandedId === member.user.id;
                      return (
                        <TableRow
                          key={member.user.id}
                          className="group cursor-pointer"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : member.user.id)
                          }
                        >
                          <TableCell>
                            {isExpanded ? (
                              <ChevronDown className="size-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="size-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <UserIcon className="size-4 text-muted-foreground" />
                              {member.user.fullName}
                            </div>
                          </TableCell>
                          <TableCell>{member.user.email}</TableCell>
                          <TableCell>
                            {member.user.practiceArea
                              ? PRACTICE_AREA_LABELS[member.user.practiceArea]
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {member.assessmentsCompleted}
                          </TableCell>
                          <TableCell className="text-right">
                            {member.avgScore > 0 ? `${member.avgScore}%` : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {member.lastAssessmentDate
                              ? new Date(
                                  member.lastAssessmentDate
                                ).toLocaleDateString()
                              : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Expanded detail panel (rendered outside the table for proper layout) */}
            {expandedId && (
              <div className="border-t">
                {members
                  .filter((m) => m.user.id === expandedId)
                  .map((m) => (
                    <MemberDetailPanel key={m.user.id} member={m} />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
