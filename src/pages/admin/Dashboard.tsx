import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Store,
  Package,
  Truck,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../api/client';
import { AdminStats, DriverProfile } from '../../types/domain';
import { formatDate } from '../../utils/format';
import { StatusBadge } from '../../components/delivery/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Table, TableCell, TableRow } from '../../components/ui/Table';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingDrivers, setPendingDrivers] = useState<DriverProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      setIsRefreshing(true);
      const [adminStats, driverList] = await Promise.all([
        api.getAdminStats(),
        api.getDriversList('PENDING'),
      ]);
      setStats(adminStats);
      setPendingDrivers(driverList.drivers.slice(0, 5));
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const s = stats || {
    totalDrivers: 0,
    pendingDrivers: 0,
    approvedDrivers: 0,
    rejectedDrivers: 0,
    totalSellers: 0,
    totalRequests: 0,
    availableRequests: 0,
    inTransitRequests: 0,
    deliveredRequests: 0,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Administrator Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            System metrics, driver verification queue, and platform delivery activity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboard}
            loading={isRefreshing}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Data
          </Button>
          <Link to="/admin/drivers">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Driver Directory
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Drivers Stat Card with Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold">Registered Drivers</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-3xl font-extrabold font-heading text-slate-900 mt-2">
              {s.totalDrivers}
            </p>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-3 gap-1.5 pt-4 mt-2 border-t border-slate-100 text-center text-xs">
            <div className="p-1.5 bg-amber-50 rounded-lg">
              <span className="text-[10px] text-amber-700 font-semibold block">Pending</span>
              <span className="font-bold text-amber-900">{s.pendingDrivers}</span>
            </div>
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <span className="text-[10px] text-emerald-700 font-semibold block">Approved</span>
              <span className="font-bold text-emerald-900">{s.approvedDrivers}</span>
            </div>
            <div className="p-1.5 bg-rose-50 rounded-lg">
              <span className="text-[10px] text-rose-700 font-semibold block">Rejected</span>
              <span className="font-bold text-rose-900">{s.rejectedDrivers}</span>
            </div>
          </div>
        </div>

        {/* Sellers Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold">Commercial Sellers</span>
              <Store className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-3xl font-extrabold font-heading text-teal-800 mt-2">
              {s.totalSellers}
            </p>
          </div>
          <p className="text-xs text-slate-500 pt-4 mt-2 border-t border-slate-100">
            Active merchants dispatching local packages in Amman
          </p>
        </div>

        {/* Dispatches Card with Status Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold">Total Delivery Dispatches</span>
              <Package className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-3xl font-extrabold font-heading text-slate-900 mt-2">
              {s.totalRequests}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-4 mt-2 border-t border-slate-100 text-center text-xs">
            <div className="p-1.5 bg-sky-50 rounded-lg">
              <span className="text-[10px] text-sky-700 font-semibold block">Available</span>
              <span className="font-bold text-sky-900">{s.availableRequests}</span>
            </div>
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <span className="text-[10px] text-indigo-700 font-semibold block">In Transit</span>
              <span className="font-bold text-indigo-900">{s.inTransitRequests}</span>
            </div>
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <span className="text-[10px] text-emerald-700 font-semibold block">Delivered</span>
              <span className="font-bold text-emerald-900">{s.deliveredRequests}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Verification Queue: Needs Review */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <span>Driver Applications Requiring Review</span>
              {s.pendingDrivers > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                  {s.pendingDrivers} Pending
                </span>
              )}
            </div>
          }
          subtitle="Audit submitted national identification and driving licence documents"
          action={
            <Link to="/admin/drivers">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View All Drivers
              </Button>
            </Link>
          }
        />

        <CardContent className="p-0">
          {pendingDrivers.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<CheckCircle2 className="w-8 h-8 text-emerald-500" />}
                title="All driver applications reviewed"
                description="There are currently no pending driver verifications in the queue."
              />
            </div>
          ) : (
            <Table
              headers={[
                'Applicant',
                'National ID',
                'Vehicle',
                'Plate',
                'Application Date',
                'Action',
              ]}
            >
              {pendingDrivers.map((drv, idx) => {
                const driverKey = drv.id || (drv as any).driverId || `drv-${idx}`;
                const targetId = drv.id || (drv as any).driverId;
                return (
                  <TableRow key={driverKey} onClick={() => navigate(`/admin/drivers/${targetId}`)}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {drv.personalPhotoUrl ? (
                          <img
                            src={drv.personalPhotoUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">
                          {drv.fullName}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          {drv.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-slate-700">
                      {drv.nationalId}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-700">
                      {drv.vehicleType} · {drv.vehicleModel}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-bold text-xs text-slate-800">
                      {drv.plateNumber}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500">
                      {formatDate(drv.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/drivers/${targetId}`);
                      }}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Audit & Verify
                    </Button>
                  </TableCell>
                </TableRow>
                );
              })}
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
