import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
  ShieldCheck,
  RefreshCw,
  Banknote,
} from 'lucide-react';
import { api } from '../../api/client';
import { SELLER_POLL_MS } from '../../config/constants';
import { DeliveryRequest, DriverProfile } from '../../types/domain';
import { formatDate, formatDistance, formatDuration, formatFee } from '../../utils/format';
import { StatusBadge } from '../../components/delivery/StatusBadge';
import { StatusTimeline } from '../../components/delivery/StatusTimeline';
import { MapView } from '../../components/maps/MapView';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';

export const SellerOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<DeliveryRequest | null>(null);
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchOrder = async (isSilent = false) => {
    if (!id) return;
    try {
      const data = await api.getDeliveryRequest(id);
      setRequest(data);
      setLastRefreshed(new Date());

      // If driver is assigned, load driver profile details
      if (data.driver) {
        setDriver({
          id: data.driver.driverId,
          userId: '',
          fullName: data.driver.fullName,
          email: '',
          phone: data.driver.phoneNumber,
          nationalId: '',
          vehicleType: data.driver.vehicle?.vehicleType || 'CAR',
          vehicleModel: data.driver.vehicle?.model || '',
          vehicleColor: data.driver.vehicle?.colour || '',
          plateNumber: data.driver.vehicle?.plateNumber || '',
          personalPhotoUrl: data.driver.personalPhotoUrl,
          status: 'APPROVED',
          createdAt: '',
        });
      } else if (data.driverId) {
        try {
          const drv = await api.getDriverDetails(data.driverId);
          setDriver({
            id: drv.driverId,
            userId: drv.userId,
            fullName: drv.user.fullName,
            email: drv.user.email,
            phone: drv.user.phoneNumber,
            nationalId: drv.nationalIdNumber,
            vehicleType: drv.vehicle.vehicleType,
            vehicleModel: drv.vehicle.model,
            vehicleColor: drv.vehicle.colour,
            plateNumber: drv.vehicle.plateNumber,
            personalPhotoUrl: drv.personalPhotoUrl,
            status: drv.accountStatus,
            createdAt: drv.user.createdAt,
          });
        } catch {
          // ignore if driver load fails
        }
      }
    } catch (err: any) {
      if (!isSilent) setErrorMsg(err.message || 'Order not found');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Auto poll if delivery is not finished
    const interval = setInterval(() => {
      if (request?.status !== 'DELIVERED') {
        fetchOrder(true);
      }
    }, SELLER_POLL_MS);

    return () => clearInterval(interval);
  }, [id, request?.status]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (errorMsg || !request) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title="Delivery Request Not Found"
          message={errorMsg || 'The requested order does not exist or has been removed.'}
          onRetry={() => fetchOrder()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/seller"
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
              Created on {formatDate(request.createdAt)} · Polling live status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrder()}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Progression Timeline */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <StatusTimeline
            currentStatus={request.status}
            statusHistory={request.statusHistory}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Details & Driver */}
        <div className="lg:col-span-7 space-y-6">
          {/* Assigned Driver Card */}
          <Card>
            <CardHeader
              title="Assigned Courier"
              subtitle="Verified independent driver fulfilling this order"
            />
            <CardContent>
              {driver ? (
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {driver.personalPhotoUrl ? (
                      <img
                        src={driver.personalPhotoUrl}
                        alt={driver.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {driver.fullName}
                      </h4>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <a
                        href={`tel:${driver.phone}`}
                        className="text-teal-700 font-semibold hover:underline"
                      >
                        {driver.phone}
                      </a>
                    </p>

                    <div className="mt-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                      <span className="font-semibold text-slate-500 block text-[11px]">
                        Vehicle Particulars:
                      </span>
                      <p className="font-medium mt-0.5">
                        {driver.vehicleType} · {driver.vehicleModel} ({driver.vehicleColor})
                      </p>
                      <p className="font-mono text-slate-500 mt-0.5">
                        Plate: {driver.plateNumber}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 px-4 bg-sky-50/60 rounded-xl border border-dashed border-sky-300">
                  <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-5 h-5 animate-spin" />
                  </div>
                  <h4 className="text-sm font-bold text-sky-950">
                    Awaiting Courier Acceptance
                  </h4>
                  <p className="text-xs text-sky-800 max-w-sm mx-auto mt-1 leading-relaxed">
                    This order is currently visible on the nearby radar for approved drivers in Amman. You will be notified the moment a driver accepts.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Package Details */}
          <Card>
            <CardHeader
              title="Package Information"
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
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">
                    {request.productDescription}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="font-bold text-slate-500 block mb-0.5">
                    Pickup Location:
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{request.pickup.label}</span>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-500 block mb-0.5">
                    Customer Drop-off:
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{request.delivery.label}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-500">
                    Recipient Customer:
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {request.recipientName} ({request.recipientPhone})
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-500">
                    Delivery Fee:
                  </span>
                  <p className="font-bold text-sm text-teal-800 font-mono mt-0.5">
                    {formatFee(request.offeredFeeJod)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Route Map View */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader
              title="Transit Route"
              subtitle="Map showing pickup and drop-off coordinates"
            />
            <CardContent className="p-3">
              <MapView
                pickup={request.pickup}
                delivery={request.delivery}
                height="320px"
                activeLeg="ALL"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
