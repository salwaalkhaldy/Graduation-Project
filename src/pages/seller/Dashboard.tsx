import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  RefreshCw,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../api/client';
import { SELLER_POLL_MS } from '../../config/constants';
import { DeliveryRequest, DeliveryStatus } from '../../types/domain';
import { formatDate, formatFee, formatShortTime } from '../../utils/format';
import { StatusBadge } from '../../components/delivery/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Table, TableCell, TableRow } from '../../components/ui/Table';

export const SellerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRequests = async (isSilent = false) => {
    try {
      if (!isSilent) setIsRefreshing(true);
      const data = await api.getSellerRequests();
      setRequests(data);
      setLastUpdated(new Date());
    } catch {
      // silently keep previous state on network/poll jitter
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(() => {
      fetchRequests(true);
    }, SELLER_POLL_MS);
    return () => clearInterval(interval);
  }, []);

  // Stats calculation
  const totalCount = requests.length;
  const availableCount = requests.filter((r) => r.status === 'AVAILABLE').length;
  const activeCount = requests.filter(
    (r) => r.status === 'ACCEPTED' || r.status === 'PICKED_UP' || r.status === 'ON_THE_WAY'
  ).length;
  const deliveredCount = requests.filter((r) => r.status === 'DELIVERED').length;

  // Most recent active request
  const mostRecentActive = useMemo(() => {
    return requests.find(
      (r) =>
        r.status === 'ACCEPTED' ||
        r.status === 'PICKED_UP' ||
        r.status === 'ON_THE_WAY'
    );
  }, [requests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        r.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.delivery.label.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedStatus === 'ALL') return true;
      if (selectedStatus === 'AVAILABLE') return r.status === 'AVAILABLE';
      if (selectedStatus === 'ACTIVE')
        return (
          r.status === 'ACCEPTED' ||
          r.status === 'PICKED_UP' ||
          r.status === 'ON_THE_WAY'
        );
      if (selectedStatus === 'DELIVERED') return r.status === 'DELIVERED';
      return true;
    });
  }, [requests, searchQuery, selectedStatus]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Seller Dashboard
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-slate-500">
              Manage your store's dispatches and monitor active drivers
            </p>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] text-slate-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchRequests()}
            loading={isRefreshing}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Link to="/seller/requests/new">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              New Delivery Request
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Requests</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold font-heading text-slate-900 mt-2">
            {totalCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Dispatches created</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-teal-800 text-xs">
            <span>Active In-Transit</span>
            <Truck className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold font-heading text-teal-800 mt-2">
            {activeCount}
          </p>
          <p className="text-[11px] text-teal-600/80 mt-0.5">Driver assigned or moving</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-sky-800 text-xs">
            <span>Available (Waiting)</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-bold font-heading text-sky-800 mt-2">
            {availableCount}
          </p>
          <p className="text-[11px] text-sky-600/80 mt-0.5">Awaiting nearby driver</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 text-xs">
            <span>Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-heading text-emerald-800 mt-2">
            {deliveredCount}
          </p>
          <p className="text-[11px] text-emerald-600/80 mt-0.5">Successfully completed</p>
        </div>
      </div>

      {/* Active Request Priority Callout (if one is active) */}
      {mostRecentActive && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-teal-950">
                  {mostRecentActive.referenceNo}
                </span>
                <StatusBadge status={mostRecentActive.status} size="sm" />
              </div>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                {mostRecentActive.productName}
              </p>
              <p className="text-[11px] text-teal-900 mt-0.5">
                Destination: {mostRecentActive.delivery.label}
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              navigate(
                `/seller/requests/${mostRecentActive.requestId || mostRecentActive.id}`
              )
            }
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Track Active Delivery
          </Button>
        </div>
      )}

      {/* Requests Table Card */}
      <Card>
        <CardHeader
          title="All Delivery Requests"
          subtitle="Real-time list of dispatches, assigned drivers, and transit statuses"
          action={
            <div className="flex items-center gap-2">
              <div className="relative w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by product or ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                />
              </div>
            </div>
          }
        />

        {/* Filter Status Chips */}
        <div className="px-5 py-2.5 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto bg-slate-50/50">
          {[
            { id: 'ALL', label: 'All Requests', count: totalCount },
            { id: 'AVAILABLE', label: 'Available', count: availableCount },
            { id: 'ACTIVE', label: 'Active', count: activeCount },
            { id: 'DELIVERED', label: 'Delivered', count: deliveredCount },
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
          ) : filteredRequests.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Package className="w-8 h-8 text-slate-400" />}
                title="No delivery requests found"
                description={
                  searchQuery
                    ? 'No requests match your search criteria. Try modifying your query or filter.'
                    : 'You have not created any delivery requests yet. Dispatch your first order now.'
                }
                actionLabel={searchQuery ? undefined : 'Create Delivery Request'}
                onAction={
                  searchQuery ? undefined : () => navigate('/seller/requests/new')
                }
              />
            </div>
          ) : (
            <Table
              headers={[
                'Reference',
                'Product Details',
                'Dropoff Area',
                'Status',
                'Fee (JOD)',
                'Created',
                'Actions',
              ]}
            >
              {filteredRequests.map((req, idx) => {
                const targetId = req.requestId || req.id || req.referenceNo;
                const rowKey = `seller-req-${req.id || req.requestId || req.referenceNo || 'item'}-${idx}`;
                return (
                  <TableRow
                    key={rowKey}
                    onClick={() => navigate(`/seller/requests/${targetId}`)}
                  >
                    <TableCell>
                      <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {req.referenceNo}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-bold text-xs text-slate-900 block truncate max-w-[160px]">
                          {req.productName}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[160px]">
                          {req.productDescription}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-700 truncate block max-w-[140px]">
                        {req.delivery.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={req.status} size="sm" />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-bold text-xs text-teal-800">
                        {formatFee(req.offeredFeeJod)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(req.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/seller/requests/${targetId}`);
                        }}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        View
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
