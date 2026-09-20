import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  RotateCcw,
  Users,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Map,
  Zap,
} from 'lucide-react';
import { loadDatabase, resetDatabase, saveDatabase } from '../../api/mock/db';
import { GOOGLE_MAPS_API_KEY, USE_MOCK_API } from '../../config/env';
import { useAuth } from '../../services/auth/AuthContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { DEMO_ACCOUNTS } from './DemoCredentialsCard';

export const DemoPanel: React.FC = () => {
  if (!USE_MOCK_API) return null;

  const { login, refreshSession } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleResetData = () => {
    resetDatabase();
    refreshSession();
    setIsResetConfirmOpen(false);
    success('Demo database has been reset to seed state.');
    window.location.reload();
  };

  const handleSwitchAccount = async (email: string, pass: string) => {
    try {
      const res = await login({ email, password: pass });
      success(`Switched account to ${res.user.fullName} (${res.role})`);
      setIsOpen(false);
      if (res.role === 'SELLER') navigate('/seller');
      else if (res.role === 'DRIVER') {
        if (res.driverStatus === 'APPROVED') navigate('/driver');
        else navigate('/driver/profile');
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      error(err.message || 'Failed to switch account');
    }
  };

  const handleSimulateAnotherDriverAccept = () => {
    const db = loadDatabase();
    const availableRequests = db.deliveryRequests.filter((r) => r.status === 'AVAILABLE');

    if (availableRequests.length === 0) {
      error('No available requests to take. Create one or reset demo data.');
      return;
    }

    // Pick a random available request and assign to Khaled Rimawi (drv_4)
    const target = availableRequests[0];
    const now = new Date().toISOString();
    target.status = 'ACCEPTED';
    target.driverId = 'drv_4'; // Khaled Rimawi
    target.updatedAt = now;
    target.statusHistory.push({ status: 'ACCEPTED', at: now });

    saveDatabase(db);
    success(
      `Simulated: Driver Khaled Rimawi just accepted request ${target.referenceNo}!`
    );
  };

  return (
    <>
      <div className="fixed bottom-20 sm:bottom-4 right-4 z-40">
        {!isOpen ? (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-full shadow-lg border border-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-teal-400" />
            <span>Demo Panel</span>
          </button>
        ) : (
          <div className="w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-3 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-3.5 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold tracking-tight">
                  Demo Utilities Panel
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 space-y-3 text-xs max-h-96 overflow-y-auto">
              {/* Active Map Engine Info */}
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Map className="w-3.5 h-3.5 text-teal-700" />
                  <span>Map Provider:</span>
                </div>
                <span className="font-bold text-teal-800">
                  {GOOGLE_MAPS_API_KEY ? 'Google Maps Live' : 'Amman SVG Demo'}
                </span>
              </div>

              {/* Simulation button for concurrent accept */}
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs border-amber-300 bg-amber-50/50 hover:bg-amber-100/60 text-amber-900"
                  leftIcon={<Zap className="w-3.5 h-3.5 text-amber-600" />}
                  onClick={handleSimulateAnotherDriverAccept}
                >
                  Simulate: Another Driver Accepts Request
                </Button>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                  Marks an available order taken so you can test concurrent conflict rejection.
                </p>
              </div>

              {/* Quick Persona Switcher */}
              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-700 block mb-1.5">
                  Instant Account Switcher
                </span>
                <div className="space-y-1">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleSwitchAccount(acc.email, acc.pass)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg border border-slate-100 hover:border-teal-300 hover:bg-teal-50/50 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold text-slate-800 block truncate">
                          {acc.name}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-mono">
                          {acc.role} {acc.statusBadge ? `(${acc.statusBadge})` : ''}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-teal-700 shrink-0">
                        Switch
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Data Button */}
              <div className="pt-2 border-t border-slate-100">
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  onClick={() => setIsResetConfirmOpen(true)}
                >
                  Reset Demo Database
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Reset Demo Database?"
        description="This will clear all mutated orders, newly registered drivers, and reset all seed data back to the initial prototype state."
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleResetData}>
              Yes, Reset Everything
            </Button>
          </div>
        }
      >
        <p className="text-xs text-slate-600">
          All changes made during this session will be replaced by the default seed drivers and delivery requests.
        </p>
      </Modal>
    </>
  );
};
