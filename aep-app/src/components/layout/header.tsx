'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, switchRole } from '@/lib/data/store';
import { ROLE_LABELS } from '@/lib/types';
import type { UserRole, User } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface HeaderProps {
  title: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const allRoles: UserRole[] = ['admin', 'manager', 'team_member', 'hr_ld'];

export function Header({ title }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleRoleChange = (value: string | null) => {
    if (!value) return;
    const role = value as UserRole;
    switchRole(role);
    window.location.href = '/dashboard';
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-6">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Role switcher */}
        <Select value={user?.role ?? 'admin'} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Switch role" />
          </SelectTrigger>
          <SelectContent>
            {allRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_LABELS[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700">
              {user.fullName}
            </span>
            <Avatar>
              <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </header>
  );
}
