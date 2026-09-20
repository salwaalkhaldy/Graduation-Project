import React, { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../../api/client';
import { getStoredSessionToken } from '../../api/mock/db';
import {
  AuthSession,
  DriverStatus,
  Role,
  User,
} from '../../types/domain';
import { LoginDto, RegisterDriverDto, RegisterSellerDto } from '../../api/contracts';

interface AuthContextType {
  session: AuthSession | null;
  user: User | null;
  role: Role | null;
  driverStatus?: DriverStatus;
  sellerId?: string;
  driverId?: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dto: LoginDto) => Promise<AuthSession>;
  logout: () => Promise<void>;
  registerSeller: (dto: RegisterSellerDto) => Promise<AuthSession>;
  registerDriver: (
    dto: RegisterDriverDto
  ) => Promise<{
    message: string;
    status: DriverStatus;
    driverId?: string;
    applicationId?: string;
    token?: string;
    user?: User;
  }>;
  refreshSession: () => Promise<void>;
  updateProfile: (data: { fullName?: string; phone?: string; phoneNumber?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = async () => {
    const token = getStoredSessionToken();
    if (!token) {
      setSession(null);
      setIsLoading(false);
      return;
    }

    try {
      // Re-hydrate session
      const me = await api.getMe();
      if (me.role === 'SELLER') {
        const profile = await api.getSellerProfile();
        setSession({
          token,
          user: me,
          role: 'SELLER',
          sellerId: profile.sellerId,
        });
      } else if (me.role === 'DRIVER') {
        const profile = await api.getDriverProfile();
        setSession({
          token,
          user: me,
          role: 'DRIVER',
          driverStatus: profile.accountStatus,
          driverId: profile.driverId,
        });
      } else {
        setSession({
          token,
          user: me,
          role: 'ADMIN',
        });
      }
    } catch (err) {
      console.warn('Session verification failed, logging out', err);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (dto: LoginDto) => {
    const res = await api.login(dto);
    setSession(res);
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    setSession(null);
  };

  const registerSeller = async (dto: RegisterSellerDto) => {
    const res = await api.registerSeller(dto);
    setSession(res);
    return res;
  };

  const registerDriver = async (dto: RegisterDriverDto) => {
    return api.registerDriver(dto);
  };

  const refreshSession = async () => {
    await initAuth();
  };

  const updateProfile = async (data: { fullName?: string; phone?: string; phoneNumber?: string }) => {
    await api.updateSellerProfile({
      fullName: data.fullName || session?.user?.fullName || '',
      phoneNumber: data.phoneNumber || data.phone || session?.user?.phoneNumber || session?.user?.phone || '',
    });
    await refreshSession();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        role: session?.role ?? null,
        driverStatus: session?.driverStatus,
        sellerId: session?.sellerId,
        driverId: session?.driverId,
        isAuthenticated: !!session,
        isLoading,
        login,
        logout,
        registerSeller,
        registerDriver,
        refreshSession,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Route Guard: Authentication check
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Route Guard: Role check
export const RequireRole: React.FC<{ role: Role; children: React.ReactNode }> = ({
  role,
  children,
}) => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (session.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Route Guard: Require Approved Driver
export const RequireApprovedDriver: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || session.role !== 'DRIVER') {
    return <Navigate to="/unauthorized" replace />;
  }

  if (session.driverStatus !== 'APPROVED') {
    return <Navigate to="/driver/profile" replace />;
  }

  return <>{children}</>;
};
