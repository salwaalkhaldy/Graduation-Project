import React from 'react';
import { UserCheck, ShieldAlert, KeyRound, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export interface DemoAccount {
  role: 'SELLER' | 'DRIVER' | 'ADMIN';
  name: string;
  email: string;
  pass: string;
  note: string;
  statusBadge?: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'SELLER',
    name: 'Omar Nasser',
    email: 'seller@demo.com',
    pass: 'Seller@123',
    note: 'Active seller with multiple requests in various statuses',
  },
  {
    role: 'SELLER',
    name: 'Rana Khalil',
    email: 'seller2@demo.com',
    pass: 'Seller@123',
    note: 'Second seller account (proves data isolation)',
  },
  {
    role: 'DRIVER',
    name: 'Yousef Haddad',
    email: 'driver@demo.com',
    pass: 'Driver@123',
    note: 'Approved driver ready to accept nearby jobs',
    statusBadge: 'Approved',
  },
  {
    role: 'DRIVER',
    name: 'Sami Odeh',
    email: 'driver2@demo.com',
    pass: 'Driver@123',
    note: 'Approved driver with active delivery in progress',
    statusBadge: 'Approved',
  },
  {
    role: 'DRIVER',
    name: 'Lina Barakat',
    email: 'pending.driver@demo.com',
    pass: 'Driver@123',
    note: 'New registration pending admin review (gated routes)',
    statusBadge: 'Pending',
  },
  {
    role: 'DRIVER',
    name: 'Hadi Zoubi',
    email: 'rejected.driver@demo.com',
    pass: 'Driver@123',
    note: 'Rejected driver showing administrator rejection reason',
    statusBadge: 'Rejected',
  },
  {
    role: 'ADMIN',
    name: 'Platform Admin',
    email: 'admin@demo.com',
    pass: 'Admin@123',
    note: 'Reviews drivers, verifies documents, approves/rejects',
  },
];

export interface DemoCredentialsCardProps {
  onSelectAccount: (email: string, pass: string) => void;
  onDirectLogin?: (email: string, pass: string) => void;
  className?: string;
}

export const DemoCredentialsCard: React.FC<DemoCredentialsCardProps> = ({
  onSelectAccount,
  onDirectLogin,
  className = '',
}) => {
  return (
    <div
      className={`bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-teal-700" />
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">
            One-Click Demo Accounts
          </h4>
        </div>
        <span className="text-[10px] font-bold text-teal-800 bg-teal-100/70 border border-teal-200 px-2 py-0.5 rounded-full">
          Demo Mode (Local)
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed -mt-1">
        Select any pre-seeded persona to populate credentials or sign in instantly. Data is stored safely in your browser.
      </p>

      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
        {DEMO_ACCOUNTS.map((acc) => (
          <div
            key={acc.email}
            className="p-3 bg-white rounded-xl border border-slate-200 hover:border-teal-300 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-900">{acc.name}</span>
                <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 uppercase">
                  {acc.role}
                </span>
                {acc.statusBadge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                      acc.statusBadge === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : acc.statusBadge === 'Pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {acc.statusBadge}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5 truncate">
                {acc.email}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 italic leading-tight">
                {acc.note}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => onSelectAccount(acc.email, acc.pass)}
              >
                Fill Form
              </Button>
              {onDirectLogin && (
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => onDirectLogin(acc.email, acc.pass)}
                >
                  Log in
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
