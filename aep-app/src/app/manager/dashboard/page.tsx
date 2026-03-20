'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCurrentUser,
  getUsers,
  getTeamById,
  getTeamProficiencyRatings,
  getAllSkills,
  getAssessments,
  getSessionsByAssessment,
  getDomains,
  getSubdomains,
  getTeams,
  getSessions,
} from '@/lib/data/store';
import type {
  User,
  Team,
  Skill,
  ProficiencyRating,
  Assessment,
  CompetencyDomain,
  CompetencySubdomain,
  ProficiencyLevel,
} from '@/lib/types';
import { PROFICIENCY_LABELS } from '@/lib/types';
import { PageShell } from '@/components/layout/page-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  Users,
  TrendingUp,
  ClipboardList,
  BarChart3,
} from 'lucide-react';

// ---- Types ----

interface SkillGroup {
  domain: CompetencyDomain;
  skills: Skill[];
}

interface HeatmapData {
  members: User[];
  skillGroups: SkillGroup[];
  ratings: Map<string, ProficiencyRating>; // key: `${userId}-${skillId}`
}

interface AssessmentCompletion {
  assessment: Assessment;
  completed: number;
  total: number;
}

// ---- Helpers ----

const HEATMAP_COLORS: Record<ProficiencyLevel, string> = {
  foundational: 'bg-red-200',
  developing: 'bg-yellow-200',
  proficient: 'bg-green-200',
  expert: 'bg-blue-200',
};

function buildHeatmapData(
  teamMembers: User[],
  teamRatings: ProficiencyRating[],
  allSkills: Skill[],
  domains: CompetencyDomain[],
  subdomains: CompetencySubdomain[],
  practiceArea: string | null
): HeatmapData {
  // Build a lookup: userId-skillId -> latest rating
  const ratingsMap = new Map<string, ProficiencyRating>();
  for (const r of teamRatings) {
    const key = `${r.userId}-${r.skillId}`;
    const existing = ratingsMap.get(key);
    if (!existing || r.ratedAt > existing.ratedAt) {
      ratingsMap.set(key, r);
    }
  }

  // Filter domains to the team's practice area
  const relevantDomains = practiceArea
    ? domains.filter((d) => d.practiceArea === practiceArea)
    : domains;

  // Build subdomain set for relevant domains
  const relevantDomainIds = new Set(relevantDomains.map((d) => d.id));
  const relevantSubdomains = subdomains.filter((sd) =>
    relevantDomainIds.has(sd.domainId)
  );
  const relevantSubdomainIds = new Set(relevantSubdomains.map((sd) => sd.id));

  // Filter skills to relevant subdomains
  const relevantSkills = allSkills.filter((sk) =>
    relevantSubdomainIds.has(sk.subdomainId)
  );

  // Group skills by domain
  const subdomainToDomain = new Map<string, string>();
  for (const sd of relevantSubdomains) {
    subdomainToDomain.set(sd.id, sd.domainId);
  }

  const domainSkillsMap = new Map<string, Skill[]>();
  for (const skill of relevantSkills) {
    const domainId = subdomainToDomain.get(skill.subdomainId);
    if (!domainId) continue;
    const list = domainSkillsMap.get(domainId) || [];
    list.push(skill);
    domainSkillsMap.set(domainId, list);
  }

  const skillGroups: SkillGroup[] = relevantDomains
    .filter((d) => domainSkillsMap.has(d.id))
    .map((domain) => ({
      domain,
      skills: domainSkillsMap.get(domain.id)!,
    }));

  return {
    members: teamMembers,
    skillGroups,
    ratings: ratingsMap,
  };
}

// ---- Components ----

function QuickStats({
  teamSize,
  avgScore,
  assessmentsInProgress,
  skillsCoverage,
}: {
  teamSize: number;
  avgScore: number;
  assessmentsInProgress: number;
  skillsCoverage: number;
}) {
  const stats = [
    {
      label: 'Team Size',
      value: teamSize,
      icon: <Users className="size-5" />,
      description: 'Active team members',
    },
    {
      label: 'Avg Proficiency',
      value: `${avgScore}%`,
      icon: <TrendingUp className="size-5" />,
      description: 'Average proficiency score',
    },
    {
      label: 'In Progress',
      value: assessmentsInProgress,
      icon: <ClipboardList className="size-5" />,
      description: 'Assessments in progress',
    },
    {
      label: 'Skills Coverage',
      value: `${skillsCoverage}%`,
      icon: <BarChart3 className="size-5" />,
      description: '% of skill-member pairs assessed',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className="text-muted-foreground">{stat.icon}</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SkillsHeatmap({ data }: { data: HeatmapData }) {
  const totalSkills = data.skillGroups.reduce(
    (sum, g) => sum + g.skills.length,
    0
  );

  if (totalSkills === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Skills Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No skills data available for this team.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Skills Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <TooltipProvider>
            <table className="w-full border-collapse text-xs">
              <thead>
                {/* Domain header row */}
                <tr>
                  <th className="sticky left-0 z-10 bg-white px-3 py-2 text-left font-medium text-muted-foreground">
                    Member
                  </th>
                  {data.skillGroups.map((group) => (
                    <th
                      key={group.domain.id}
                      colSpan={group.skills.length}
                      className="border-b border-l px-2 py-1.5 text-center font-semibold text-slate-700"
                    >
                      {group.domain.name}
                    </th>
                  ))}
                </tr>
                {/* Skill name row */}
                <tr>
                  <th className="sticky left-0 z-10 bg-white px-3 py-2" />
                  {data.skillGroups.map((group) =>
                    group.skills.map((skill) => (
                      <th
                        key={skill.id}
                        className="border-l px-1 py-1.5 text-center font-normal text-muted-foreground"
                      >
                        <div
                          className="max-w-[80px] truncate"
                          title={skill.name}
                        >
                          {skill.name}
                        </div>
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {data.members.map((member) => (
                  <tr key={member.id} className="border-t">
                    <td className="sticky left-0 z-10 bg-white px-3 py-2 font-medium whitespace-nowrap text-slate-800">
                      {member.fullName}
                    </td>
                    {data.skillGroups.map((group) =>
                      group.skills.map((skill) => {
                        const rating = data.ratings.get(
                          `${member.id}-${skill.id}`
                        );
                        const bgColor = rating
                          ? HEATMAP_COLORS[rating.level]
                          : 'bg-gray-100';
                        const label = rating
                          ? `${PROFICIENCY_LABELS[rating.level]} (${rating.percentage}%)`
                          : 'Not assessed';

                        return (
                          <td
                            key={`${member.id}-${skill.id}`}
                            className="border-l p-0.5"
                          >
                            <Tooltip>
                              <TooltipTrigger
                                className={`block h-8 w-full rounded ${bgColor} cursor-default`}
                              />
                              <TooltipContent>
                                <div className="text-center">
                                  <div className="font-medium">
                                    {skill.name}
                                  </div>
                                  <div>{label}</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </td>
                        );
                      })
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </TooltipProvider>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="font-medium">Legend:</span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-4 w-6 rounded bg-red-200" />
            Foundational
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-4 w-6 rounded bg-yellow-200" />
            Developing
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-4 w-6 rounded bg-green-200" />
            Proficient
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-4 w-6 rounded bg-blue-200" />
            Expert
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-4 w-6 rounded bg-gray-100" />
            Not assessed
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function AssessmentCompletionRates({
  completions,
}: {
  completions: AssessmentCompletion[];
}) {
  if (completions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assessment Completion Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No published assessments found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment Completion Rates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {completions.map(({ assessment, completed, total }) => {
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
          return (
            <div key={assessment.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-800">
                  {assessment.title}
                </span>
                <span className="text-muted-foreground">
                  {completed}/{total} completed ({pct}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ---- Page ----

export default function ManagerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [completions, setCompletions] = useState<AssessmentCompletion[]>([]);
  const [quickStats, setQuickStats] = useState({
    teamSize: 0,
    avgScore: 0,
    assessmentsInProgress: 0,
    skillsCoverage: 0,
  });

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

    // Get ratings and skills
    const teamRatings = getTeamProficiencyRatings(managerTeam.id);
    const allSkills = getAllSkills();
    const domains = getDomains();
    const allSubdomains: CompetencySubdomain[] = [];
    for (const d of domains) {
      allSubdomains.push(...getSubdomains(d.id));
    }

    // Build heatmap
    const heatmap = buildHeatmapData(
      teamMembers,
      teamRatings,
      allSkills,
      domains,
      allSubdomains,
      managerTeam.practiceArea
    );
    setHeatmapData(heatmap);

    // Assessment completion rates
    const assessments = getAssessments().filter(
      (a) => a.status === 'published' || a.status === 'closed'
    );
    const memberIds = new Set(teamMembers.map((m) => m.id));
    const completionData: AssessmentCompletion[] = assessments.map((a) => {
      const sessions = getSessionsByAssessment(a.id).filter((s) =>
        memberIds.has(s.userId)
      );
      const completed = sessions.filter(
        (s) => s.status === 'submitted'
      ).length;
      return { assessment: a, completed, total: teamMembers.length };
    });
    setCompletions(completionData);

    // Quick stats
    const avgScore =
      teamRatings.length > 0
        ? Math.round(
            teamRatings.reduce((sum, r) => sum + r.percentage, 0) /
              teamRatings.length
          )
        : 0;

    const allSessions = getSessions();
    const teamSessions = allSessions.filter((s) => memberIds.has(s.userId));
    const assessmentsInProgress = teamSessions.filter(
      (s) => s.status === 'in_progress'
    ).length;

    // Skills coverage: how many unique user-skill combos have been assessed
    const totalSkillsInHeatmap = heatmap.skillGroups.reduce(
      (sum, g) => sum + g.skills.length,
      0
    );
    const totalCombinations = teamMembers.length * totalSkillsInHeatmap;
    const assessedCombinations = heatmap.ratings.size;
    const skillsCoverage =
      totalCombinations > 0
        ? Math.round((assessedCombinations / totalCombinations) * 100)
        : 0;

    setQuickStats({
      teamSize: teamMembers.length,
      avgScore,
      assessmentsInProgress,
      skillsCoverage,
    });

    setLoading(false);
  }, [router]);

  if (loading || !user) {
    return null;
  }

  return (
    <PageShell title="Team Dashboard">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {team ? team.name : 'No Team Assigned'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Team proficiency overview and assessment progress
          </p>
        </div>

        <QuickStats {...quickStats} />

        {heatmapData && <SkillsHeatmap data={heatmapData} />}

        <AssessmentCompletionRates completions={completions} />
      </div>
    </PageShell>
  );
}
