import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../api/client';
import { DriverProfile, DriverStatus } from '../../types/domain';
import { formatDate } from '../../utils/format';
import { StatusBadge } from '../../components/delivery/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Table, TableCell, TableRow } from '../../components/ui/Table';

const PAGE_SIZE = 8;

export const AdminDriverManagement: React.FC = () => {
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [counts, setCounts] = useState<{ total: number; pending: number; approved: number; rejected: number }>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDrivers = async () => {
    try {
      setIsLoading(true);
      const res = await api.getDriversList(
        selectedStatus === 'ALL' ? undefined : (selectedStatus as DriverStatus),
        searchQuery || undefined,
        1,
        100 // fetch full set for client paging
      );
      setDrivers(res.drivers);
      setCounts(res.counts);
      setCurrentPage(1);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [selectedStatus, searchQuery]);

  // Client pagination
  const totalPages = Math.ceil(drivers.length / PAGE_SIZE) || 1;
  const paginatedDrivers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return drivers.slice(start, start + PAGE_SIZE);
  }, [drivers, currentPage]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Driver Management Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit, authorize, or reject registered driver applicants across Amman
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchDrivers}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Directory
        </Button>
      </div>

      <Card>
        <CardHeader
          title="All Registered Drivers"
          subtitle="Manage credentials, view identity documents, and assign platform statuses"
          action={
            <div className="relative w-56 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, email, or plate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
              />
            </div>
          }
        />

        {/* Filter Chips Bar */}
        <div className="px-5 py-2.5 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto bg-slate-50/50">
          {[
            { id: 'ALL', label: 'All Drivers', count: counts.total },
            { id: 'PENDING', label: 'Pending Review', count: counts.pending },
            { id: 'APPROVED', label: 'Approved', count: counts.approved },
            { id: 'REJECTED', label: 'Rejected', count: counts.rejected },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setSelectedStatus(chip.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                selectedStatus === chip.id
                  ? 'bg-teal-700 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{chip.label}</span>
              <span
                className={`text-[10px] px-1 rounded-full ${
                  selectedStatus === chip.id
                    ? 'bg-teal-800 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {chip.count}
              </span>
            </button>
          ))}
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : paginatedDrivers.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Users className="w-8 h-8 text-slate-400" />}
                title="No drivers match your criteria"
                description="Try changing the status filter or modifying the search terms."
              />
            </div>
          ) : (
            <>
              <Table
                headers={[
                  'Driver / Contact',
                  'National ID',
                  'Vehicle Particulars',
                  'Licence Plate',
                  'Status',
                  'Registration Date',
                  'Actions',
                ]}
              >
                {paginatedDrivers.map((drv, idx) => (
                  <TableRow
                    key={drv.id || (drv as any).driverId || `drv-${idx}`}
                    onClick={() => navigate(`/admin/drivers/${drv.id || (drv as any).driverId}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {drv.personalPhotoUrl ? (
                            <img
                              src={drv.personalPhotoUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-900 block truncate max-w-[150px]">
                            {drv.fullName}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate max-w-[150px]">
                            {drv.phone} · {drv.email}
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
                      <span className="text-xs text-slate-700 block">
                        {drv.vehicleType}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {drv.vehicleModel} ({drv.vehicleColor})
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                        {drv.plateNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={drv.status} size="sm" />
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(drv.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/drivers/${drv.id || (drv as any).driverId}`);
                        }}
                        rightIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>

              {/* Pagination Bar */}
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing{' '}
                  <strong className="text-slate-800">
                    {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, drivers.length)}
                  </strong>{' '}
                  of <strong className="text-slate-800">{drivers.length}</strong> drivers
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <span className="px-2 font-bold text-slate-700">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
