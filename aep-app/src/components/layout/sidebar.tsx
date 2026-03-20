'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileQuestion,
  BookOpen,
  ClipboardList,
  User,
  BarChart3,
  GraduationCap,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/data/store';
import type { UserRole } from '@/lib/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="size-5" />,
    roles: ['admin', 'manager', 'team_member', 'hr_ld'],
  },
  {
    label: 'Users',
    href: '/users',
    icon: <Users className="size-5" />,
    roles: ['admin'],
  },
  {
    label: 'Questions',
    href: '/questions',
    icon: <FileQuestion className="size-5" />,
    roles: ['admin'],
  },
  {
    label: 'Competencies',
    href: '/competencies',
    icon: <BookOpen className="size-5" />,
    roles: ['admin', 'hr_ld'],
  },
  {
    label: 'Assessments',
    href: '/assessments',
    icon: <ClipboardList className="size-5" />,
    roles: ['admin', 'manager', 'team_member'],
  },
  {
    label: 'Team',
    href: '/team',
    icon: <Users className="size-5" />,
    roles: ['manager'],
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: <User className="size-5" />,
    roles: ['team_member'],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: <BarChart3 className="size-5" />,
    roles: ['hr_ld'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserRole(user.role);
    }
  }, []);

  const filteredItems = navItems.filter(
    (item) => userRole && item.roles.includes(userRole)
  );

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col bg-slate-900 text-white">
      {/* Logo / Title */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-700 px-6">
        <GraduationCap className="size-7 text-blue-400" />
        <span className="text-lg font-semibold tracking-tight">AEP</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-700/80 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700 px-6 py-4">
        <p className="text-xs text-slate-400">Assessment & Evaluation Platform</p>
      </div>
    </aside>
  );
}
