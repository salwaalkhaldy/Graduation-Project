import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck,
  LogOut,
  User as UserIcon,
  ChevronDown,
  MapPin,
} from 'lucide-react';
import { JORDAN_PRESET_AREAS } from '../../config/constants';
import { useAuth } from '../../services/auth/AuthContext';
import { useDriverLocation } from '../../services/location/useDriverLocation';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface TopBarProps {
  showLocationChip?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ showLocationChip = false }) => {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<'All' | 'North' | 'Central' | 'South' | 'East'>('All');

  const { point, changeLocation, requestGps, source } = useDriverLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleHomePath =
    session?.role === 'SELLER'
      ? '/seller'
      : session?.role === 'DRIVER'
      ? '/driver'
      : '/admin';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs h-16 flex items-center justify-between px-4 sm:px-6">
      {/* Brand logo & title */}
      <div className="flex items-center gap-3">
        <Link to={roleHomePath} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
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
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Driver location chip (if role is DRIVER) */}
        {showLocationChip && (
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
            title="Change current driver location"
          >
            <MapPin className="w-3.5 h-3.5 text-teal-700" />
            <span className="max-w-[120px] sm:max-w-[180px] truncate">
              {point.label.split(',')[0]}
            </span>
            <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-1 rounded border border-teal-200">
              {source.toUpperCase()}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        )}

        {/* User profile dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((v) => !v)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
              {session?.user.fullName[0] || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-bold text-slate-800 leading-tight">
                {session?.user.fullName}
              </span>
              <span className="block text-[10px] text-slate-500 capitalize">
                {session?.role.toLowerCase()}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-slate-200 shadow-lg z-40 py-1 divide-y divide-slate-100">
                <div className="px-4 py-2.5">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {session?.user.fullName}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {session?.user.email}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    to={
                      session?.role === 'SELLER'
                        ? '/seller/profile'
                        : session?.role === 'DRIVER'
                        ? '/driver/profile'
                        : '/admin'
                    }
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>Profile Details</span>
                  </Link>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Driver Location Switch Modal */}
      <Modal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        title="Set Current Driver Location"
        description="Choose any city across Jordan or use real browser GPS to test proximity dispatch."
        maxWidth="md"
        footer={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsLocationModalOpen(false)}
          >
            Done
          </Button>
        }
      >
        <div className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            leftIcon={<MapPin className="w-4 h-4 text-teal-600" />}
            onClick={() => {
              requestGps();
              setIsLocationModalOpen(false);
            }}
          >
            Use Real GPS Location
          </Button>

          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">
                Jordan Preset Locations
              </span>
              <div className="flex items-center gap-1 text-[11px]">
                {(['All', 'Central', 'North', 'South'] as const).map((reg) => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => setSelectedRegion(reg)}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                      selectedRegion === reg
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1">
              {Object.entries(JORDAN_PRESET_AREAS)
                .filter(([, loc]) => selectedRegion === 'All' || loc.region === selectedRegion)
                .map(([name, pt]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      changeLocation(name);
                      setIsLocationModalOpen(false);
                    }}
                    className={`text-left px-2.5 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                      point.label.startsWith(name) || point.label.includes(name)
                        ? 'bg-teal-50 border-teal-300 text-teal-800 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-semibold truncate">{name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{pt.governorate}</div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </Modal>
    </header>
  );
};
