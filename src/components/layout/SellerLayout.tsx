import React from 'react';
import { Outlet } from 'react-router-dom';
import { MobileNav } from './MobileNav';
import { SideNav } from './SideNav';
import { TopBar } from './TopBar';

export const SellerLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar />
      <div className="flex-1 flex pb-16 md:pb-0">
        <SideNav role="SELLER" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
      <MobileNav role="SELLER" />
    </div>
  );
};
