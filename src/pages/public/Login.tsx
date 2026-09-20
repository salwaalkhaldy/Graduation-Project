import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../services/auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DemoCredentialsCard } from '../../components/demo/DemoCredentialsCard';
import { useToast } from '../../components/ui/Toast';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { success, error: showErrorToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if redirected from a guard
  const fromLocation = (location.state as any)?.from?.pathname;

  const handleRedirect = (role: string, driverStatus?: string) => {
    if (role === 'SELLER') {
      navigate('/seller');
    } else if (role === 'DRIVER') {
      if (driverStatus === 'APPROVED') {
        navigate('/driver');
      } else {
        navigate('/driver/profile');
      }
    } else if (role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await login({ email: email.trim(), password });
      success(`Welcome back, ${res.user.fullName}!`);
      handleRedirect(res.role, res.driverStatus);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  const handleDirectLogin = async (demoEmail: string, demoPass: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await login({ email: demoEmail, password: demoPass });
      success(`Signed in as ${res.user.fullName} (${res.role})`);
      handleRedirect(res.role, res.driverStatus);
    } catch (err: any) {
      setErrorMessage(err.message || 'Direct login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      {/* Login Form Column */}
      <div className="md:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Log In
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your Seller, Driver, or Admin portal
          </p>
        </div>

        {fromLocation && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Please sign in to access this page.</span>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 select-none">
                Password <span className="text-rose-500 ml-0.5">*</span>
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isLoading}
              rightIcon={<LogIn className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link
              to="/signup"
              className="text-teal-700 font-bold hover:underline"
            >
              Sign up now
            </Link>
          </p>
        </div>
      </div>

      {/* Demo Credentials Column */}
      <div className="md:col-span-6">
        <DemoCredentialsCard
          onSelectAccount={handleSelectAccount}
          onDirectLogin={handleDirectLogin}
        />
      </div>
    </div>
  );
};
