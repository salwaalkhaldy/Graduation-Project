import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Navigation,
  Clock,
  Banknote,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../api/client';
import { activeMapService } from '../../services/maps/GoogleMapService';
import { useAuth } from '../../services/auth/AuthContext';
import { useDriverLocation } from '../../services/location/useDriverLocation';
import { DeliveryRequest, RouteDetails } from '../../types/domain';
import { formatDistance, formatDuration, formatFee } from '../../utils/format';
import { RouteSummary } from '../../components/delivery/RouteSummary';
import { StatusBadge } from '../../components/delivery/StatusBadge';
import { MapView } from '../../components/maps/MapView';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/ErrorState';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';

export const DriverRequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { point: driverLocation } = useDriverLocation();
  const { success, error: showErrorToast } = useToast();

  const [request, setRequest] = useState<DeliveryRequest | null>(null);
  const [leg1, setLeg1] = useState<RouteDetails | null>(null);
  const [leg2, setLeg2] = useState<RouteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    api
      .getDeliveryRequest(id)
      .then(async (req) => {
        if (!isMounted) return;
        setRequest(req);

        // Compute Leg 1 (Driver -> Pickup) and Leg 2 (Pickup -> Delivery)
        try {
          const [r1, r2] = await Promise.all([
            activeMapService.calculateRoute(driverLocation, req.pickup),
            activeMapService.calculateRoute(req.pickup, req.delivery),
          ]);
          if (isMounted) {
            setLeg1(r1);
            setLeg2(r2);
          }
        } catch {
          // fallback
        }
      })
      .catch((err) => {
        if (isMounted) setErrorMsg(err.message || 'Request not found');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, driverLocation.lat, driverLocation.lng]);

  const handleAcceptOrder = async () => {
    if (!request) return;

    try {
      setIsAccepting(true);
      await api.acceptDeliveryRequest(request.requestId || request.id || '');
      setIsAcceptModalOpen(false);
      success(`Request ${request.referenceNo} accepted! Proceed to pickup.`);
      navigate('/driver/active');
    } catch (err: any) {
      setIsAcceptModalOpen(false);
      showErrorToast(err.message || 'Could not accept this order.');
      // Refresh order to reflect if taken
      if (id) {
        api.getDeliveryRequest(id).then(setRequest).catch(() => {});
      }
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (errorMsg || !request) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title="Request Not Found"
          message={errorMsg || 'This delivery request does not exist.'}
          onRetry={() => navigate('/driver')}
        />
      </div>
    );
  }

  const isAvailable = request.status === 'AVAILABLE';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/driver"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
                {request.referenceNo}
              </h1>
              <StatusBadge status={request.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review trip metrics and route before accepting this dispatch
            </p>
          </div>
        </div>

        {isAvailable && (
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAcceptModalOpen(true)}
            rightIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Accept Delivery ({formatFee(request.offeredFeeJod)})
          </Button>
        )}
      </div>

      {/* Warning if already taken */}
      {!isAvailable && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-4 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              This dispatch is no longer available. Status: <strong>{request.status}</strong>.
            </span>
          </div>
          <Link to="/driver">
            <Button variant="outline" size="sm">
              Back to Nearby Requests
            </Button>
          </Link>
        </div>
      )}

      {/* Journey Overview Route Summary */}
      {leg1 && leg2 && (
        <RouteSummary
          leg1DistanceKm={leg1.distanceKm}
          leg1DurationMin={leg1.durationMin}
          leg2DistanceKm={leg2.distanceKm}
          leg2DurationMin={leg2.durationMin}
          totalDistanceKm={Number((leg1.distanceKm + leg2.distanceKm).toFixed(1))}
          totalDurationMin={leg1.durationMin + leg2.durationMin}
          activeLeg="TO_PICKUP"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Details */}
        <div className="lg:col-span-6 space-y-6">
          {/* Package Details */}
          <Card>
            <CardHeader
              title="Package Details"
              subtitle="Item description and customer drop-off details"
            />
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                {request.productImageUrl && (
                  <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                    <img
                      src={request.productImageUrl}
                      alt={request.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {request.productName}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {request.productDescription}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Offered Delivery Fee:</span>
                <span className="font-mono font-bold text-base text-teal-800">
                  {formatFee(request.offeredFeeJod)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Locations */}
          <Card>
            <CardHeader
              title="Delivery Coordinates"
              subtitle="Pickup and destination locations"
            />
            <CardContent className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>Pickup Location (Seller)</span>
                </div>
                <p className="text-slate-700 pl-6">{request.pickup.label}</p>
                {leg1 && (
                  <p className="text-[11px] text-amber-800 font-semibold pl-6 pt-1">
                    {formatDistance(leg1.distanceKm)} from your current position ({formatDuration(leg1.durationMin)})
                  </p>
                )}
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Dropoff Location (Customer)</span>
                </div>
                <p className="text-slate-700 pl-6">{request.delivery.label}</p>
                {leg2 && (
                  <p className="text-[11px] text-emerald-800 font-semibold pl-6 pt-1">
                    {formatDistance(leg2.distanceKm)} transit from seller ({formatDuration(leg2.durationMin)})
                  </p>
                )}
              </div>

              {/* Privacy Notice: Customer contact hidden before acceptance */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5 text-slate-500">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Customer phone and recipient contact are revealed immediately upon order acceptance.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Route Map Preview */}
        <div className="lg:col-span-6 space-y-4">
          <Card>
            <CardHeader
              title="Full Route Map"
              subtitle="Leg 1: Driver to Seller (Pickup) · Leg 2: Seller to Customer"
            />
            <CardContent className="p-3">
              <MapView
                driver={driverLocation}
                pickup={request.pickup}
                delivery={request.delivery}
                height="340px"
                activeLeg="TO_PICKUP"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal to Accept Order */}
      <Modal
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        title="Accept Delivery Dispatch?"
        description={`You are accepting ${request.referenceNo}. You will be assigned to pick up the package in ${request.pickup.label} and deliver it to ${request.delivery.label}.`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAcceptModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={isAccepting}
              onClick={handleAcceptOrder}
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Confirm Acceptance
            </Button>
          </div>
        }
      >
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 space-y-1">
          <p className="font-bold">Earning on Completion:</p>
          <p className="text-sm font-bold font-mono text-teal-950">
            {formatFee(request.offeredFeeJod)}
          </p>
          <p className="text-[11px] text-teal-700 mt-1">
            Accepting an order requires you to complete it before taking any other delivery requests.
          </p>
        </div>
      </Modal>
    </div>
  );
};
