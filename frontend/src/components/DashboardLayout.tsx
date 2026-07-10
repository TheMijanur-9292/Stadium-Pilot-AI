'use client';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';

import { ReactNode, useState, useEffect } from 'react';
import { useStore, UserRole } from '@/store/useStore';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bot,
  Map,
  Users,
  Bus,
  Accessibility,
  ShieldAlert,
  Utensils,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  ShieldCheck,
  Calendar,
  UsersRound,
  Trophy,
} from 'lucide-react';
import {
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import Link from 'next/link';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  allowedRoles?: UserRole[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'World Cup Live', href: '/world-cup', icon: Trophy },
  { name: 'AI Assistant', href: '/ai-assistant', icon: Bot },
  { name: 'Navigation', href: '/navigation', icon: Map },
  { name: 'Crowd Intel', href: '/crowd', icon: Users },
  { name: 'Transport', href: '/transport', icon: Bus },
  { name: 'Accessibility', href: '/accessibility', icon: Accessibility },
  { name: 'Emergency Center', href: '/emergency', icon: ShieldAlert },
  { name: 'Food Concessions', href: '/food', icon: Utensils },
  { name: 'Volunteer Portal', href: '/volunteer', icon: Calendar, allowedRoles: ['VOLUNTEER', 'ORGANIZER', 'ADMIN'] },
  { name: 'Organizer Panel', href: '/organizer', icon: ShieldCheck, allowedRoles: ['ORGANIZER', 'ADMIN'] },
  { name: 'User Management', href: '/admin/users', icon: UsersRound, allowedRoles: ['ADMIN'] },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout, theme, toggleTheme } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!mounted || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
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

  const filteredNavItems = navItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(user.role),
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar for Desktop */}
      <aside className="hidden w-64 border-r border-default-100 bg-content1 p-4 md:flex md:flex-col justify-between h-screen sticky top-0 flex-shrink-0">
        <div>
          {/* Logo */}
          <div className="mb-8 flex items-center gap-2 px-2">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              StadiumPilot AI
            </span>
            <Chip size="sm" variant="soft" color="accent" className="text-[10px] font-semibold">
              WC 2026
            </Chip>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500 text-white font-medium shadow-md shadow-primary-500/10'
                      : 'text-default-600 hover:bg-default-100 hover:text-foreground'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile / Logout */}
        <div className="border-t border-default-100 pt-4 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <Avatar
              name={user.fullName}
              size="sm"
              src={user.avatar || ''}
              color="accent"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user.fullName}</p>
              <Chip
                size="sm"
                variant="soft"
                color={getRoleColor(user.role)}
                className="text-[10px] h-4 mt-0.5"
              >
                {user.role}
              </Chip>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              isIconOnly
              variant="ghost"
              onPress={toggleTheme}
              className="w-full h-10 rounded-xl"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </Button>

            <Button
              isIconOnly
              color="danger"
              variant="ghost"
              onPress={handleLogout}
              className="w-full h-10 rounded-xl"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-background/80 backdrop-blur-md">
          <aside className="w-64 bg-content1 border-r border-default-100 p-4 flex flex-col justify-between h-full animate-fade-in-right">
            <div>
              <div className="flex items-center justify-between mb-8 px-2">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  StadiumPilot AI
                </span>
                <Button
                  isIconOnly
                  variant="ghost"
                  onPress={() => setIsMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </Button>
              </div>

              <nav className="space-y-1">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-primary-500 text-white font-medium'
                          : 'text-default-600 hover:bg-default-100 hover:text-foreground'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-default-100 pt-4 space-y-3">
              <div className="flex items-center gap-3 px-2">
                <Avatar name={user.fullName} size="sm" color="accent" src={user.avatar || ''} />
                <div>
                  <p className="text-sm font-semibold truncate">{user.fullName}</p>
                  <Chip
                    size="sm"
                    variant="soft"
                    color={getRoleColor(user.role)}
                    className="text-[10px] h-4 mt-0.5"
                  >
                    {user.role}
                  </Chip>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  isIconOnly
                  variant="ghost"
                  onPress={toggleTheme}
                  className="w-full h-10 rounded-xl"
                >
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </Button>
                <Button
                  isIconOnly
                  color="danger"
                  variant="ghost"
                  onPress={handleLogout}
                  className="w-full h-10 rounded-xl"
                >
                  <LogOut size={18} />
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-default-100 bg-content1/80 backdrop-blur-md px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              variant="ghost"
              className="md:hidden"
              onPress={() => setIsMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </Button>
            <h1 className="text-lg font-bold truncate">
              {pathname === '/dashboard' ? 'Overview' : navItems.find((i) => i.href === pathname)?.name || 'StadiumPilot AI'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Status / Role Tag */}
            <Chip color={getRoleColor(user.role)} variant="soft" className="hidden sm:inline-flex capitalize">
              {user.role.toLowerCase().replace('_', ' ')} Mode
            </Chip>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="focus:outline-none flex items-center justify-center rounded-full"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <Avatar
                  name={user.fullName}
                  size="sm"
                  color={getRoleColor(user.role)}
                  className="cursor-pointer border-2 border-transparent hover:border-primary-500 transition-all shadow-sm"
                  src={user.avatar || ''}
                />
              </button>

              {dropdownOpen && (
                <>
                  {/* Backdrop to close dropdown on click outside */}
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setDropdownOpen(false)}
                  ></div>

                  {/* Dropdown Menu Container */}
                  <div className="absolute right-0 mt-2.5 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121824] p-2 shadow-xl shadow-black/20 z-40 animate-in fade-in slide-in-from-top-3 duration-200">
                    {/* User Profile Summary */}
                    <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800/60 mb-1">
                      <p className="text-[9px] text-default-400 font-bold uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs font-bold text-foreground truncate mt-0.5">{user.email}</p>
                    </div>

                    {/* Settings Link */}
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push('/settings');
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-default-700 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-foreground transition-all flex items-center gap-2"
                    >
                      <Settings size={14} className="text-default-400" />
                      My Settings
                    </button>

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-danger hover:bg-red-500/10 hover:text-danger transition-all flex items-center gap-2 mt-0.5"
                    >
                      <LogOut size={14} />
                      Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Router Slot */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}






