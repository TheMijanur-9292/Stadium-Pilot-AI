'use client';

import { useStore } from '@/store/useStore';
import DashboardLayout from '@/components/DashboardLayout';
import FanDashboard from '@/features/dashboard/FanDashboard';
import VolunteerDashboard from '@/features/dashboard/VolunteerDashboard';
import VenueStaffDashboard from '@/features/dashboard/VenueStaffDashboard';
import OrganizerDashboard from '@/features/dashboard/OrganizerDashboard';
import AdminDashboard from '@/features/dashboard/AdminDashboard';
import { useEffect, useState } from 'react';

export default function DashboardRouter() {
  const { user } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'ORGANIZER':
        return <OrganizerDashboard />;
      case 'VENUE_STAFF':
        return <VenueStaffDashboard />;
      case 'VOLUNTEER':
        return <VolunteerDashboard />;
      case 'FAN':
      default:
        return <FanDashboard />;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
}



