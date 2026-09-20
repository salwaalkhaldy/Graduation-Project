import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { Button } from '../ui/Button';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Public Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs">
            <Truck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-heading font-extrabold text-slate-900 text-base sm:text-lg tracking-tight block leading-tight">
              Smart Delivery
            </span>
            <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider block">
              Logistics Platform
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/about" className="hidden sm:inline-block text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1">
            About
          </Link>
          <Link to="/login">
            <Button variant="outline" size="sm">
              Log in
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="sm">
              Sign up
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-8 text-xs text-slate-500 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Smart Delivery Platform · Graduation Project Prototype</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-teal-700 transition-colors">
              About & Planned Enhancements
            </Link>
            <Link to="/login" className="hover:text-teal-700 transition-colors">
              Demo Logins
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
