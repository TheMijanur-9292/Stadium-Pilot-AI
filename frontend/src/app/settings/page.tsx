'use client';
import Input from '@/components/Input';
import Button from '@/components/Button';

import { useStore } from '@/store/useStore';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, Chip } from '@heroui/react';
import { Settings, User as UserIcon, Lock, Globe, Bell } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useStore();

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* User profile details */}
          <Card className="glass-card md:col-span-2 border border-default-100 shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-2 text-primary-500 mb-2">
                <UserIcon size={20} />
                <h3 className="font-bold text-sm">Account Preferences</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block text-xs font-semibold text-default-600 mb-1">Full Name</label>
<Input
                  
                  value={user.fullName}
                  disabled
                  variant="primary"
                  
                  
                />
                <label className="block text-xs font-semibold text-default-600 mb-1">Email Address</label>
<Input
                  
                  value={user.email}
                  disabled
                  variant="primary"
                  
                  
                />
                <label className="block text-xs font-semibold text-default-600 mb-1">Platform Role</label>
<Input
                  
                  value={user.role}
                  disabled
                  variant="primary"
                  
                  
                />
                <label className="block text-xs font-semibold text-default-600 mb-1">Preferred Language</label>
<Input
                  
                  value={user.preferredLanguage === 'Spanish' ? 'Spanish (Español)' : 'English (US)'}
                  disabled
                  variant="primary"
                  
                  
                />
              </div>

              <p className="text-[10px] text-default-400 bg-default-50 p-3 rounded-xl border border-default-100 italic">
                Note: Profile details are managed by the tournament organizing committee. To modify security credentials, contact venue support.
              </p>
            </CardContent>
          </Card>

          {/* Preferences logs */}
          <Card className="glass-card border border-default-100 shadow-sm h-fit">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-secondary-500">
                <Bell size={20} />
                <h3 className="font-bold text-sm">Notifications</h3>
              </div>
              
              <div className="space-y-3 text-xs text-default-600">
                <div className="flex justify-between items-center p-2 rounded-lg bg-default-50/50">
                  <span>Match Alert Pushes</span>
                  <Chip size="sm" variant="soft" color="success">ENABLED</Chip>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-default-50/50">
                  <span>SOS Dispatch Pings</span>
                  <Chip size="sm" variant="soft" color="success">ENABLED</Chip>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-default-50/50">
                  <span>Concessions Ready Alerts</span>
                  <Chip size="sm" variant="soft" color="success">ENABLED</Chip>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}





