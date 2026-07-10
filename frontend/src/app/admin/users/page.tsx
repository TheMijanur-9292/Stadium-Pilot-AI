'use client';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Card, CardContent, Chip, Skeleton } from '@heroui/react';
import {
  Users,
  UserPlus,
  Mail,
  User,
  Shield,
  Trash2,
  Edit,
  Search,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Lock,
  UserCheck
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';

export default function UserManagementPage() {
  const { user: currentUser } = useStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal / Form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState<any | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>('FAN');

  // Feedback Messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  // Queries & Mutations
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/api/users').then((res) => res.data),
    enabled: currentUser?.role === 'ADMIN',
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/users', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsCreateOpen(false);
      setSuccessMsg('User successfully created.');
      clearForm();
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to create user.');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; body: any }) =>
      api.put(`/api/users/${data.id}`, data.body).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
      setSuccessMsg('User details updated successfully.');
      clearForm();
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to update user.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/users/${id}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeletingUser(null);
      setSuccessMsg('User successfully removed from system.');
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to delete user.');
    }
  });

  const clearForm = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setRole('FAN');
    setErrorMsg(null);
  };

  const handleEditClick = (u: any) => {
    setEditingUser(u);
    setFullName(u.fullName);
    setEmail(u.email);
    setRole(u.role);
    setPassword('');
    setErrorMsg(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    createMutation.mutate({ fullName, email, password, role });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const body: any = { fullName, email, role };
    if (password.trim()) body.password = password;
    updateMutation.mutate({ id: editingUser.id, body });
  };

  const handleDeleteSubmit = () => {
    setErrorMsg(null);
    if (currentUser && deletingUser.id === currentUser.id) {
      setErrorMsg('You cannot delete your own admin account.');
      return;
    }
    deleteMutation.mutate(deletingUser.id);
  };

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return null;
  }

  // Calculate Metrics
  const totalCount = users?.length || 0;
  const fanCount = users?.filter((u: any) => u.role === 'FAN').length || 0;
  const staffCount = users?.filter((u: any) => u.role === 'VENUE_STAFF' || u.role === 'VOLUNTEER').length || 0;
  const adminCount = users?.filter((u: any) => u.role === 'ADMIN' || u.role === 'ORGANIZER').length || 0;

  // Filter and Search Users
  const filteredUsers = users?.filter((u: any) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (r: string): 'accent' | 'danger' | 'default' | 'success' | 'warning' => {
    switch (r) {
      case 'ADMIN':
        return 'danger';
      case 'ORGANIZER':
        return 'default';
      case 'VENUE_STAFF':
        return 'warning';
      case 'VOLUNTEER':
        return 'success';
      default:
        return 'accent';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-indigo-900/40 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold md:text-2xl tracking-tight flex items-center gap-2">
              User Directory & Access Control 👥
            </h2>
            <p className="text-xs text-indigo-200">
              Manage stadium user accounts, assign roles, register venue staff, and audit system credentials.
            </p>
          </div>
          <Button
            color="primary"
            radius="xl"
            onPress={() => {
              clearForm();
              setIsCreateOpen(true);
            }}
            startContent={<UserPlus size={16} />}
            className="bg-indigo-600 hover:bg-indigo-700 shadow-md font-semibold text-xs"
          >
            Create New User
          </Button>
        </div>

        {/* Success Feedback Banner */}
        {successMsg && (
          <div className="p-4 bg-success-50 border border-success-100 text-success rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card border border-default-100 shadow-sm">
            <CardContent className="p-6 space-y-1">
              <span className="text-[10px] text-default-400 font-bold uppercase tracking-wider">Total Accounts</span>
              <p className="text-3xl font-extrabold text-foreground tracking-tight">
                {isLoading ? <span className="animate-pulse">...</span> : totalCount}
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card border border-default-100 shadow-sm">
            <CardContent className="p-6 space-y-1">
              <span className="text-[10px] text-default-400 font-bold uppercase tracking-wider">Spectators (Fans)</span>
              <p className="text-3xl font-extrabold text-primary-500 tracking-tight">
                {isLoading ? <span className="animate-pulse">...</span> : fanCount}
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card border border-default-100 shadow-sm">
            <CardContent className="p-6 space-y-1">
              <span className="text-[10px] text-default-400 font-bold uppercase tracking-wider">Staff & Crew</span>
              <p className="text-3xl font-extrabold text-success-600 dark:text-success-500 tracking-tight">
                {isLoading ? <span className="animate-pulse">...</span> : staffCount}
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card border border-default-100 shadow-sm">
            <CardContent className="p-6 space-y-1">
              <span className="text-[10px] text-default-400 font-bold uppercase tracking-wider">System Managers</span>
              <p className="text-3xl font-extrabold text-danger-500 tracking-tight">
                {isLoading ? <span className="animate-pulse">...</span> : adminCount}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Toolbar */}
        <Card className="glass-card border border-default-100 shadow-sm">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-default-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-default-200 bg-default-50/50 dark:bg-default-800/20 text-foreground placeholder-default-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto">
              {(['ALL', 'ADMIN', 'ORGANIZER', 'VENUE_STAFF', 'VOLUNTEER', 'FAN'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex-shrink-0 ${
                    roleFilter === r
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'border-default-200 bg-transparent text-default-600 hover:bg-default-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Table Panel */}
        <Card className="glass-card border border-default-100 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-default-100 bg-default-50/40 text-[10px] text-default-400 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">User Name</th>
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4">Security Role</th>
                    <th className="px-6 py-4">Date Joined</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-100 text-xs">
                  {isLoading ? (
                    [1, 2, 3].map((i) => (
                      <tr key={i}>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-32 rounded" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-44 rounded" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24 rounded" /></td>
                        <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-16 rounded-xl ml-auto" /></td>
                      </tr>
                    ))
                  ) : filteredUsers && filteredUsers.length > 0 ? (
                    filteredUsers.map((u: any) => (
                      <tr key={u.id} className="hover:bg-default-50/20 transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground flex items-center gap-2">
                          <span className="h-7 w-7 rounded-full bg-indigo-500/10 text-indigo-500 font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {u.fullName[0].toUpperCase()}
                          </span>
                          <span>{u.fullName}</span>
                        </td>
                        <td className="px-6 py-4 text-default-600 font-medium">{u.email}</td>
                        <td className="px-6 py-4">
                          <Chip
                            size="sm"
                            color={getRoleBadgeColor(u.role)}
                            variant="soft"
                            className="font-bold text-[9px] h-5"
                          >
                            {u.role}
                          </Chip>
                        </td>
                        <td className="px-6 py-4 text-default-400">
                          {new Date(u.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 text-right space-x-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            color="default"
                            isIconOnly
                            className="h-8 w-8 rounded-lg"
                            onPress={() => handleEditClick(u)}
                          >
                            <Edit size={14} className="text-default-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            color="danger"
                            isIconOnly
                            className="h-8 w-8 rounded-lg"
                            onPress={() => setDeletingUser(u)}
                            isDisabled={u.id === currentUser.id}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-default-400">
                        No registered users match your search queries.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-indigo-950/60 rounded-2xl w-full max-w-md p-6 shadow-2xl shadow-indigo-500/5 space-y-4 animate-scale-up">
            <div className="flex justify-between items-center border-b border-default-100 pb-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <UserPlus size={18} className="text-indigo-500" /> Create Account
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-default-400 hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-danger-50 text-danger rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                startContent={<User size={14} />}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="john@stadiumpilot.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                startContent={<Mail size={14} />}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                startContent={<Lock size={14} />}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-default-600">
                  Access Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-default-200 bg-default-50/50 dark:bg-default-800/20 text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="FAN">FAN (Spectator)</option>
                  <option value="VOLUNTEER">VOLUNTEER (Event Volunteer)</option>
                  <option value="VENUE_STAFF">VENUE_STAFF (Stadium Worker)</option>
                  <option value="ORGANIZER">ORGANIZER (Event Planner)</option>
                  <option value="ADMIN">ADMIN (System Administrator)</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  color="default"
                  onPress={() => setIsCreateOpen(false)}
                  className="font-semibold text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  isLoading={createMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs rounded-xl"
                >
                  Register User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-indigo-950/60 rounded-2xl w-full max-w-md p-6 shadow-2xl shadow-indigo-500/5 space-y-4 animate-scale-up">
            <div className="flex justify-between items-center border-b border-default-100 pb-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Edit size={18} className="text-indigo-500" /> Edit Profile Settings
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-default-400 hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-danger-50 text-danger rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                startContent={<User size={14} />}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="john@stadiumpilot.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                startContent={<Mail size={14} />}
              />

              <Input
                label="Password (Leave blank to keep current)"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                startContent={<Lock size={14} />}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-default-600">
                  Access Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-default-200 bg-default-50/50 dark:bg-default-800/20 text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
                  disabled={editingUser.id === currentUser.id}
                >
                  <option value="FAN">FAN (Spectator)</option>
                  <option value="VOLUNTEER">VOLUNTEER (Event Volunteer)</option>
                  <option value="VENUE_STAFF">VENUE_STAFF (Stadium Worker)</option>
                  <option value="ORGANIZER">ORGANIZER (Event Planner)</option>
                  <option value="ADMIN">ADMIN (System Administrator)</option>
                </select>
                {editingUser.id === currentUser.id && (
                  <p className="text-[10px] text-default-400">
                    You cannot change your own admin access role.
                  </p>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  color="default"
                  onPress={() => setEditingUser(null)}
                  className="font-semibold text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  isLoading={updateMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs rounded-xl"
                >
                  Save Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE DIALOG */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-indigo-950/60 rounded-2xl w-full max-w-sm p-6 shadow-2xl shadow-indigo-500/5 space-y-4 animate-scale-up">
            <div className="flex items-center gap-2 text-danger pb-1 border-b border-default-100">
              <Trash2 size={20} />
              <h3 className="font-bold text-sm">Remove System User?</h3>
            </div>

            {errorMsg && (
              <div className="p-3 bg-danger-50 text-danger rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            <p className="text-xs text-default-500 leading-relaxed">
              Are you sure you want to delete <strong>{deletingUser.fullName}</strong> ({deletingUser.email})? This action is permanent and will clear their active login sessions.
            </p>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="ghost"
                color="default"
                onPress={() => setDeletingUser(null)}
                className="font-semibold text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                color="danger"
                onPress={handleDeleteSubmit}
                isLoading={deleteMutation.isPending}
                className="font-semibold text-xs rounded-xl"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
