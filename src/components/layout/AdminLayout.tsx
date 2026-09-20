import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { api } from '../../api/client';
import { MobileNav } from './MobileNav';
import { SideNav } from './SideNav';
import { TopBar } from './TopBar';

export const AdminLayout: React.FC = () => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const loadStats = async () => {
      try {
        const stats = await api.getAdminStats();
        if (mounted) {
          setPendingCount(stats.pendingDrivers);
        }
      } catch {
        // ignore
      }
    };
    loadStats();
    const timer = setInterval(loadStats, 10000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar />
      <div className="flex-1 flex pb-16 md:pb-0">
        <SideNav role="ADMIN" pendingDriverCount={pendingCount} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
      <MobileNav role="ADMIN" />
    </div>
  );
};
