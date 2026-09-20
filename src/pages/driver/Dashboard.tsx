import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  RefreshCw,
  Truck,
  ArrowRight,
  Filter,
  MapPin,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../api/client';
import { NearbyRequestItem } from '../../api/contracts';
import { DRIVER_POLL_MS, PROXIMITY_RADIUS_KM } from '../../config/constants';
import { useAuth } from '../../services/auth/AuthContext';
import { useDriverLocation } from '../../services/location/useDriverLocation';
import { DeliveryRequest } from '../../types/domain';
import { RequestCard } from '../../components/delivery/RequestCard';
import { StatusBadge } from '../../components/delivery/StatusBadge';
import { MapView } from '../../components/maps/MapView';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';

export const DriverDashboard: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { point } = useDriverLocation();

  const [radiusKm, setRadiusKm] = useState<number>(PROXIMITY_RADIUS_KM);
  const [nearbyRequests, setNearbyRequests] = useState<NearbyRequestItem[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<DeliveryRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [hoveredRequest, setHoveredRequest] = useState<NearbyRequestItem | null>(null);

  // Status gating
  useEffect(() => {
    if (session?.driverStatus && session.driverStatus !== 'APPROVED') {
      navigate('/driver/profile');
    }
  }, [session, navigate]);

  const loadData = async (isSilent = false) => {
    try {
      if (!isSilent) setIsRefreshing(true);

      const [nearby, active] = await Promise.all([
        api.getNearbyRequests(point, radiusKm),
        api.getDriverActiveDelivery(),
      ]);

      setNearbyRequests(nearby);
      setActiveDelivery(active);
      setLastUpdated(new Date());
    } catch {
      // ignore transient polling errors
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(true);
    }, DRIVER_POLL_MS);

    return () => clearInterval(interval);
  }, [point.lat, point.lng, radiusKm]);

  // Map pickup points from nearby list
  const activePickupHighlight = hoveredRequest ? hoveredRequest.pickup : undefined;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Nearby Delivery Dispatches
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-slate-500">
              Orders within <strong className="text-slate-700">{radiusKm} km</strong> of your current location ({point.label.split(',')[0]})
            </p>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] text-slate-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Radius Selector */}
          <div className="w-44">
            <Select
              value={String(radiusKm)}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              options={[
                { value: '10', label: '10 km (Local)' },
                { value: '25', label: '25 km (Metro)' },
                { value: '50', label: '50 km (Governorate)' },
                { value: '100', label: '100 km (Intercity)' },
                { value: '350', label: 'All Jordan (350 km)' },
              ]}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData()}
            loading={isRefreshing}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Active Delivery Priority Banner (if driver already has an active order) */}
      {activeDelivery && (
        <div className="p-4 bg-teal-50 border-2 border-teal-500 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-teal-950">
                  {activeDelivery.referenceNo}
                </span>
                <StatusBadge status={activeDelivery.status} size="sm" />
                <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.2 rounded">
                  In Progress
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                {activeDelivery.productName}
              </p>
              <p className="text-[11px] text-teal-900 mt-0.5">
                Deliver to: {activeDelivery.delivery.label}
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/driver/active')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Go to Active Delivery
          </Button>
        </div>
      )}

      {/* Interactive Jordan Radar Map */}
      <Card>
        <CardHeader
          title="Jordan Delivery Radar Map"
          subtitle={`Showing pickup locations for orders within ${radiusKm >= 300 ? 'All Jordan' : `${radiusKm} km`} of your position`}
        />
        <CardContent className="p-3">
          <MapView
            driver={point}
            pickup={activePickupHighlight || (nearbyRequests[0] ? nearbyRequests[0].pickup : undefined)}
            height="260px"
            interactive={true}
          />
        </CardContent>
      </Card>

      {/* List of Available Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Available Requests ({nearbyRequests.length})
          </h2>
          {activeDelivery && (
            <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Complete your active delivery before accepting another order
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : nearbyRequests.length === 0 ? (
          <EmptyState
            icon={<Compass className="w-8 h-8 text-slate-400" />}
            title="No delivery requests nearby"
            description={`No commercial orders are currently available within ${radiusKm} km of your location.`}
            actionLabel={radiusKm < 25 ? 'Expand Search Radius to 25 km' : 'Refresh Nearby Jobs'}
            onAction={
              radiusKm < 25 ? () => setRadiusKm(25) : () => loadData()
            }
          />
        ) : (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
              activeDelivery ? 'opacity-65 pointer-events-none' : ''
            }`}
          >
            {nearbyRequests.map((req, idx) => (
              <RequestCard
                key={req.requestId}
                request={req}
                isNearest={idx === 0}
                onView={(reqId) => navigate(`/driver/requests/${reqId}`)}
                onHover={(hoverItem) => setHoveredRequest(hoverItem)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
