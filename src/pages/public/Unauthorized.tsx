import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../services/auth/AuthContext';
import { Button } from '../../components/ui/Button';

export const Unauthorized: React.FC = () => {
  const { session } = useAuth();

  const getHomePath = () => {
    if (!session) return '/login';
    if (session.role === 'SELLER') return '/seller';
    if (session.role === 'DRIVER') return '/driver';
    return '/admin';
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-5">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Access Restricted
          </h1>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            You do not have administrative or role-level permissions to access this page.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to={getHomePath()}>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Home className="w-4 h-4" />}
            >
              Go to Your Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
