'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Search, UserPlus, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  getUsers,
  createUser,
  updateUser,
  getTeams,
  getCurrentUser,
} from '@/lib/data/store';
import type { User, Team, UserRole, PracticeArea } from '@/lib/types';
import { ROLE_LABELS, PRACTICE_AREA_LABELS } from '@/lib/types';

// ============ Badge style helpers ============

const ROLE_STYLES: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-800 border border-purple-200',
  manager: 'bg-blue-100 text-blue-800 border border-blue-200',
  team_member: 'bg-green-100 text-green-800 border border-green-200',
  hr_ld: 'bg-orange-100 text-orange-800 border border-orange-200',
};

const ALL_ROLES: UserRole[] = ['admin', 'manager', 'team_member', 'hr_ld'];
const ALL_PRACTICE_AREAS: PracticeArea[] = [
  'software_development',
  'application_integration',
  'system_integration',
];

// ============ Main Page ============

export default function UsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  // Add user dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('team_member');
  const [newTeamId, setNewTeamId] = useState<string>('none');
  const [newPracticeArea, setNewPracticeArea] = useState<string>('none');

  const loadData = useCallback(() => {
    setUsers(getUsers());
    setTeams(getTeams());
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    loadData();
    setLoading(false);
  }, [router, loadData]);

  // ============ Filtered users ============

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      u.fullName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // ============ Helpers ============

  function teamName(teamId: string | null): string {
    if (!teamId) return '\u2014';
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : '\u2014';
  }

  function practiceAreaLabel(pa: PracticeArea | null): string {
    return pa ? PRACTICE_AREA_LABELS[pa] : '\u2014';
  }

  // ============ Inline role change ============

  function handleRoleChange(userId: string, newRole: UserRole) {
    const updated = updateUser(userId, { role: newRole });
    if (updated) {
      loadData();
      toast.success(`Role updated to ${ROLE_LABELS[newRole]}`);
    } else {
      toast.error('Failed to update role');
    }
  }

  // ============ Inline team change ============

  function handleTeamChange(userId: string, teamId: string) {
    const updated = updateUser(userId, {
      teamId: teamId === 'none' ? null : teamId,
    });
    if (updated) {
      loadData();
      toast.success('Team updated');
    } else {
      toast.error('Failed to update team');
    }
  }

  // ============ Toggle active ============

  function handleToggleActive(userId: string, currentlyActive: boolean) {
    const updated = updateUser(userId, { isActive: !currentlyActive });
    if (updated) {
      loadData();
      toast.success(
        currentlyActive ? 'User deactivated' : 'User activated'
      );
    } else {
      toast.error('Failed to update status');
    }
  }

  // ============ Add user ============

  function resetAddForm() {
    setNewFullName('');
    setNewEmail('');
    setNewRole('team_member');
    setNewTeamId('none');
    setNewPracticeArea('none');
  }

  function handleAddUser() {
    if (!newFullName.trim() || !newEmail.trim()) {
      toast.error('Full name and email are required');
      return;
    }

    const existing = users.find(
      (u) => u.email.toLowerCase() === newEmail.trim().toLowerCase()
    );
    if (existing) {
      toast.error('A user with this email already exists');
      return;
    }

    createUser({
      fullName: newFullName.trim(),
      email: newEmail.trim(),
      role: newRole,
      teamId: newTeamId === 'none' ? null : newTeamId,
      practiceArea:
        newPracticeArea === 'none'
          ? null
          : (newPracticeArea as PracticeArea),
      isActive: true,
    });

    loadData();
    resetAddForm();
    setAddDialogOpen(false);
    toast.success('User created successfully');
  }

  // ============ Render ============

  if (loading) {
    return (
      <PageShell title="User Management">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="User Management">
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          {/* Search */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Role filter */}
          <Select
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v as UserRole | 'all')}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {ALL_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Users table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Practice Area</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-slate-500"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.fullName}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(v) =>
                        handleRoleChange(user.id, v as UserRole)
                      }
                    >
                      <SelectTrigger className="h-8 w-36 border-none bg-transparent p-0 shadow-none">
                        <Badge
                          variant="outline"
                          className={ROLE_STYLES[user.role]}
                        >
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.teamId ?? 'none'}
                      onValueChange={(v) => handleTeamChange(user.id, v ?? 'none')}
                    >
                      <SelectTrigger className="h-8 w-44 text-sm">
                        <SelectValue>
                          {teamName(user.teamId)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Team</SelectItem>
                        {teams.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {practiceAreaLabel(user.practiceArea)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.isActive
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleToggleActive(user.id, user.isActive)
                      }
                      title={
                        user.isActive ? 'Deactivate user' : 'Activate user'
                      }
                    >
                      {user.isActive ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. They will be active by default.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@company.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={newRole}
                onValueChange={(v) => setNewRole(v as UserRole)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="team">Team</Label>
              <Select
                value={newTeamId}
                onValueChange={(v) => setNewTeamId(v ?? '')}
              >
                <SelectTrigger id="team">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Team</SelectItem>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="practiceArea">Practice Area</Label>
              <Select
                value={newPracticeArea}
                onValueChange={(v) => setNewPracticeArea(v ?? '')}
              >
                <SelectTrigger id="practiceArea">
                  <SelectValue placeholder="Select practice area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {ALL_PRACTICE_AREAS.map((pa) => (
                    <SelectItem key={pa} value={pa}>
                      {PRACTICE_AREA_LABELS[pa]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetAddForm();
                setAddDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
