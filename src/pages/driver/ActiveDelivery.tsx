import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck,
  MapPin,
  Phone,
  User,
  Package,
  CheckCircle2,
  Navigation,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Banknote,
  Sparkles,
} from 'lucide-react';
import { api } from '../../api/client';
import { activeMapService } from '../../services/maps/GoogleMapService';
import { useAuth } from '../../services/auth/AuthContext';
import { useDriverLocation } from '../../services/location/useDriverLocation';
import { DeliveryRequest, DeliveryStatus, RouteDetails } from '../../types/domain';
import { formatDistance, formatDuration, formatFee } from '../../utils/format';
import { RouteSummary } from '../../components/delivery/RouteSummary';
import { StatusBadge } from '../../components/delivery/StatusBadge';
import { StatusTimeline } from '../../components/delivery/StatusTimeline';
import { MapView } from '../../components/maps/MapView';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';

export const ActiveDelivery: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { point: driverLocation } = useDriverLocation();
  const { success, error: showErrorToast } = useToast();

  const [delivery, setDelivery] = useState<DeliveryRequest | null>(null);
  const [sellerInfo, setSellerInfo] = useState<{ name: string; phone: string } | null>(null);
  const [leg1, setLeg1] = useState<RouteDetails | null>(null);
  const [leg2, setLeg2] = useState<RouteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Status transition modal
  const [pendingNextStatus, setPendingNextStatus] = useState<DeliveryStatus | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const fetchActiveDelivery = async () => {
    try {
      const active = await api.getDriverActiveDelivery();
      setDelivery(active);

      if (active) {
        // Compute routes
        const [r1, r2] = await Promise.all([
          activeMapService.calculateRoute(driverLocation, active.pickup),
          activeMapService.calculateRoute(active.pickup, active.delivery),
        ]);
        setLeg1(r1);
        setLeg2(r2);

        // Load seller contact details
        if ((active as any).seller) {
          setSellerInfo({
            name: (active as any).seller.fullName,
            phone: (active as any).seller.phoneNumber || (active as any).seller.phone || '0795551234',
          });
        } else {
          try {
            const profile = await api.getSellerProfile();
            setSellerInfo({
              name: profile.user?.fullName || 'Commercial Seller',
              phone: profile.user?.phoneNumber || profile.user?.phone || '0795551234',
            });
          } catch {
            setSellerInfo({ name: 'Commercial Seller', phone: '0795551234' });
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveDelivery();
  }, [driverLocation.lat, driverLocation.lng]);

  const handleUpdateStatus = async () => {
    if (!delivery || !pendingNextStatus) return;

    try {
      setIsTransitioning(true);
      const targetId = delivery.requestId || delivery.id || '';
      const updated = await api.updateDeliveryStatus(targetId, pendingNextStatus);
      setDelivery(updated);
      setPendingNextStatus(null);
      success(`Delivery status updated to ${pendingNextStatus.replace('_', ' ')}!`);
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to update status');
    } finally {
      setIsTransitioning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <EmptyState
          icon={<Truck className="w-8 h-8 text-slate-400" />}
          title="No Active Delivery"
          description="You are not currently fulfilling any deliveries. Browse nearby dispatches to claim your next job."
          actionLabel="Find Nearby Requests"
          onAction={() => navigate('/driver')}
        />
      </div>
    );
  }

  // Determine active leg and next status progression
  let activeLeg: 'TO_PICKUP' | 'TO_DELIVERY' | 'ALL' = 'TO_PICKUP';
  let nextAction: { status: DeliveryStatus; label: string; modalTitle: string; modalDesc: string } | null = null;

  if (delivery.status === 'ACCEPTED') {
    activeLeg = 'TO_PICKUP';
    nextAction = {
      status: 'PICKED_UP',
      label: 'Mark as Picked Up',
      modalTitle: 'Confirm Package Pickup?',
      modalDesc: 'Confirm that you have arrived at the seller location and physically retrieved the package.',
    };
  } else if (delivery.status === 'PICKED_UP') {
    activeLeg = 'TO_DELIVERY';
    nextAction = {
      status: 'ON_THE_WAY',
      label: 'Mark as On the Way',
      modalTitle: 'Departing to Customer?',
      modalDesc: 'Confirm that you have departed the pickup location and are in transit to the customer drop-off address.',
    };
  } else if (delivery.status === 'ON_THE_WAY') {
    activeLeg = 'TO_DELIVERY';
    nextAction = {
      status: 'DELIVERED',
      label: 'Mark as Delivered',
      modalTitle: 'Complete Delivery?',
      modalDesc: 'Confirm that you have handed the package to the recipient and received any fee due.',
    };
  }

  const isCompleted = delivery.status === 'DELIVERED';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              {delivery.referenceNo}
            </h1>
            <StatusBadge status={delivery.status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Active assignment · Fulfill order stages sequentially
          </p>
        </div>

        {nextAction && (
          <Button
            variant="primary"
            size="lg"
            onClick={() => setPendingNextStatus(nextAction!.status)}
            rightIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            {nextAction.label}
          </Button>
        )}
      </div>

      {/* Completion Celebration Card */}
      {isCompleted && (
        <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-3 animate-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-emerald-950">
            Delivery Successfully Completed!
          </h3>
          <p className="text-xs text-emerald-800 max-w-md mx-auto">
            You have delivered dispatch {delivery.referenceNo}. You earned{' '}
            <strong>{formatFee(delivery.offeredFeeJod)}</strong> for this trip.
          </p>
          <div className="pt-2">
            <Link to="/driver">
              <Button variant="primary" size="md">
                Find More Nearby Requests
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Status Timeline */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <StatusTimeline
            currentStatus={delivery.status}
            statusHistory={delivery.statusHistory}
          />
        </CardContent>
      </Card>

      {/* Route Overview */}
      {leg1 && leg2 && (
        <RouteSummary
          leg1DistanceKm={leg1.distanceKm}
          leg1DurationMin={leg1.durationMin}
          leg2DistanceKm={leg2.distanceKm}
          leg2DurationMin={leg2.durationMin}
          totalDistanceKm={Number((leg1.distanceKm + leg2.distanceKm).toFixed(1))}
          totalDurationMin={leg1.durationMin + leg2.durationMin}
          activeLeg={activeLeg}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Route Map */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader
              title="Live Delivery Route"
              subtitle={`Active stage: ${
                activeLeg === 'TO_PICKUP'
                  ? 'Proceed to Seller Pickup Point'
                  : 'En Route to Customer Drop-off'
              }`}
            />
            <CardContent className="p-3">
              <MapView
                driver={driverLocation}
                pickup={delivery.pickup}
                delivery={delivery.delivery}
                height="340px"
                activeLeg={activeLeg}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Contact Cards & Package Details */}
        <div className="lg:col-span-5 space-y-5">
          {/* Seller / Pickup Card */}
          <Card>
            <CardHeader
              title="1. Pickup Contact (Seller)"
              subtitle="Collect package from store"
            />
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Pickup Area:</span>
                <span className="font-bold text-slate-800">{delivery.pickup.label}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-500">Seller Phone:</span>
                <a
                  href={`tel:${sellerInfo?.phone || '0795551234'}`}
                  className="font-bold text-teal-700 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{sellerInfo?.phone || '0795551234'}</span>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Customer / Drop-off Card */}
          <Card>
            <CardHeader
              title="2. Recipient Customer"
              subtitle="Deliver parcel to customer"
            />
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Recipient Name:</span>
                <span className="font-bold text-slate-800">{delivery.recipientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Customer Drop-off:</span>
                <span className="font-bold text-slate-800">{delivery.delivery.label}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-500">Customer Phone:</span>
                <a
                  href={`tel:${delivery.recipientPhone}`}
                  className="font-bold text-teal-700 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{delivery.recipientPhone}</span>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Package Details */}
          <Card>
            <CardHeader title="Package Information" />
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-900 block">
                  {delivery.productName}
                </span>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  {delivery.productDescription}
                </p>
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 flex items-center justify-between">
                <span className="font-bold text-teal-900">Your Fee:</span>
                <span className="font-bold font-mono text-base text-teal-950">
                  {formatFee(delivery.offeredFeeJod)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal for Updating Delivery Status */}
      {nextAction && (
        <Modal
          isOpen={!!pendingNextStatus}
          onClose={() => setPendingNextStatus(null)}
          title={nextAction.modalTitle}
          description={nextAction.modalDesc}
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPendingNextStatus(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isTransitioning}
                onClick={handleUpdateStatus}
              >
                Yes, Update Status
              </Button>
            </div>
          }
        >
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
            <span className="font-bold block mb-1">Status change:</span>
            <div className="flex items-center gap-2">
              <StatusBadge status={delivery.status} size="sm" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <StatusBadge status={nextAction.status} size="sm" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
