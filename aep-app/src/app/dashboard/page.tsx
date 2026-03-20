'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCurrentUser,
  getUsers,
  getQuestions,
  getAssessments,
  getSessions,
  getUserScores,
  getTeams,
} from '@/lib/data/store';
import type { User, UserRole } from '@/lib/types';
import { ROLE_LABELS } from '@/lib/types';
import { PageShell } from '@/components/layout/page-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Users,
  FileQuestion,
  ClipboardList,
  CheckCircle,
  TrendingUp,
  Target,
  BarChart3,
  Clock,
} from 'lucide-react';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

function StatCardGrid({ stats }: { stats: StatCard[] }) {
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
            {stat.description && (
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TeamMemberDashboard({ user }: { user: User }) {
  const sessions = getSessions().filter((s) => s.userId === user.id);
  const scores = getUserScores(user.id);
  const upcoming = sessions.filter((s) => s.status === 'not_started').length;
  const completed = sessions.filter((s) => s.status === 'submitted').length;
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s.percentage, 0) / scores.length)
      : 0;

  const stats: StatCard[] = [
    {
      label: 'Upcoming Assessments',
      value: upcoming,
      icon: <Clock className="size-5" />,
      description: 'Not yet started',
    },
    {
      label: 'Completed',
      value: completed,
      icon: <CheckCircle className="size-5" />,
      description: 'Submitted assessments',
    },
    {
      label: 'Average Score',
      value: `${avgScore}%`,
      icon: <TrendingUp className="size-5" />,
      description: scores.length > 0 ? `Across ${scores.length} assessments` : 'No scores yet',
    },
    {
      label: 'In Progress',
      value: sessions.filter((s) => s.status === 'in_progress').length,
      icon: <ClipboardList className="size-5" />,
      description: 'Currently in progress',
    },
  ];

  return <StatCardGrid stats={stats} />;
}

function ManagerDashboard({ user }: { user: User }) {
  const allUsers = getUsers();
  const teams = getTeams();
  const userTeam = teams.find((t) => t.managerId === user.id);
  const teamMembers = userTeam
    ? allUsers.filter((u) => u.teamId === userTeam.id)
    : [];
  const sessions = getSessions();
  const teamSessions = sessions.filter((s) =>
    teamMembers.some((m) => m.id === s.userId)
  );
  const submitted = teamSessions.filter((s) => s.status === 'submitted').length;
  const total = teamSessions.length;
  const completionRate = total > 0 ? Math.round((submitted / total) * 100) : 0;

  const stats: StatCard[] = [
    {
      label: 'Team Members',
      value: teamMembers.length,
      icon: <Users className="size-5" />,
      description: userTeam?.name ?? 'No team assigned',
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      icon: <CheckCircle className="size-5" />,
      description: `${submitted} of ${total} sessions`,
    },
    {
      label: 'Active Assessments',
      value: getAssessments().filter((a) => a.status === 'published').length,
      icon: <ClipboardList className="size-5" />,
      description: 'Currently published',
    },
    {
      label: 'Skill Gaps',
      value: 0,
      icon: <Target className="size-5" />,
      description: 'Identified areas for improvement',
    },
  ];

  return <StatCardGrid stats={stats} />;
}

function AdminDashboard() {
  const users = getUsers();
  const questions = getQuestions();
  const assessments = getAssessments();
  const sessions = getSessions();
  const submitted = sessions.filter((s) => s.status === 'submitted').length;
  const completionRate =
    sessions.length > 0
      ? Math.round((submitted / sessions.length) * 100)
      : 0;

  const stats: StatCard[] = [
    {
      label: 'Total Users',
      value: users.length,
      icon: <Users className="size-5" />,
      description: `${users.filter((u) => u.isActive).length} active`,
    },
    {
      label: 'Questions',
      value: questions.length,
      icon: <FileQuestion className="size-5" />,
      description: `${questions.filter((q) => q.status === 'approved').length} approved`,
    },
    {
      label: 'Assessments',
      value: assessments.length,
      icon: <ClipboardList className="size-5" />,
      description: `${assessments.filter((a) => a.status === 'published').length} published`,
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      icon: <TrendingUp className="size-5" />,
      description: `${submitted} of ${sessions.length} sessions`,
    },
  ];

  return <StatCardGrid stats={stats} />;
}

function HrLdDashboard() {
  const users = getUsers();
  const teams = getTeams();
  const assessments = getAssessments();
  const sessions = getSessions();
  const submitted = sessions.filter((s) => s.status === 'submitted').length;
  const completionRate =
    sessions.length > 0
      ? Math.round((submitted / sessions.length) * 100)
      : 0;

  const stats: StatCard[] = [
    {
      label: 'Total Teams',
      value: teams.length,
      icon: <Users className="size-5" />,
      description: `${users.filter((u) => u.isActive).length} active users`,
    },
    {
      label: 'Org Completion Rate',
      value: `${completionRate}%`,
      icon: <CheckCircle className="size-5" />,
      description: `${submitted} submitted sessions`,
    },
    {
      label: 'Active Assessments',
      value: assessments.filter((a) => a.status === 'published').length,
      icon: <ClipboardList className="size-5" />,
      description: 'Currently published',
    },
    {
      label: 'Reports Available',
      value: teams.length,
      icon: <BarChart3 className="size-5" />,
      description: 'Per-team reports',
    },
  ];

  return <StatCardGrid stats={stats} />;
}

function DashboardContent({ user }: { user: User }) {
  switch (user.role) {
    case 'team_member':
      return <TeamMemberDashboard user={user} />;
    case 'manager':
      return <ManagerDashboard user={user} />;
    case 'admin':
      return <AdminDashboard />;
    case 'hr_ld':
      return <HrLdDashboard />;
    default:
      return null;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [router]);

  if (loading || !user) {
    return null;
  }

  return (
    <PageShell title="Dashboard">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Welcome back, {user.fullName}
          </h2>
          <p className="text-sm text-muted-foreground">
            You are signed in as {ROLE_LABELS[user.role]}.
          </p>
        </div>

        <DashboardContent user={user} />
      </div>
    </PageShell>
  );
}
