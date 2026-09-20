import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package,
  MapPin,
  Banknote,
  ArrowRight,
  ArrowLeft,
  Navigation,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../api/client';
import { AMMAN_PRESET_AREAS } from '../../config/constants';
import { activeMapService } from '../../services/maps/GoogleMapService';
import { GeoPoint, RouteDetails } from '../../types/domain';
import { formatDistance, formatDuration, formatFee } from '../../utils/format';
import { deliveryRequestSchema } from '../../utils/validation';
import { LocationPicker } from '../../components/delivery/LocationPicker';
import { MapView } from '../../components/maps/MapView';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { FileDrop } from '../../components/ui/FileDrop';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { useToast } from '../../components/ui/Toast';

export const CreateRequest: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showErrorToast } = useToast();

  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImageDataUrl, setProductImageDataUrl] = useState('');

  // Default pickup location to Abdali preset
  const [pickup, setPickup] = useState<GeoPoint | null>(AMMAN_PRESET_AREAS.Abdali);
  const [delivery, setDelivery] = useState<GeoPoint | null>(null);

  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [offeredFeeJod, setOfferedFeeJod] = useState<number | ''>(3.5);

  const [routeInfo, setRouteInfo] = useState<RouteDetails | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Recalculate route whenever pickup or delivery points change
  useEffect(() => {
    if (!pickup || !delivery) {
      setRouteInfo(null);
      return;
    }

    let isMounted = true;
    setIsCalculatingRoute(true);

    activeMapService
      .calculateRoute(pickup, delivery)
      .then((res) => {
        if (isMounted) setRouteInfo(res);
      })
      .catch(() => {
        // keep prior
      })
      .finally(() => {
        if (isMounted) setIsCalculatingRoute(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pickup, delivery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      productName,
      productDescription,
      productImageUrl: productImageDataUrl || undefined,
      pickup: pickup || { lat: 0, lng: 0, label: '' },
      delivery: delivery || { lat: 0, lng: 0, label: '' },
      recipientName,
      recipientPhone,
      offeredFeeJod: Number(offeredFeeJod),
    };

    const validationResult = deliveryRequestSchema.safeParse(formData);
    if (!validationResult.success) {
      const errMap: Record<string, string> = {};
      const issues = (validationResult.error as any).issues || (validationResult.error as any).errors || [];
      issues.forEach((err: any) => {
        const path = err.path.join('.');
        errMap[path] = err.message;
      });
      setErrors(errMap);
      return;
    }

    try {
      setIsSubmitting(true);
      const newRequest = await api.createDeliveryRequest({
        productName,
        productDescription,
        productImageUrl: productImageDataUrl || undefined,
        pickup: pickup!,
        delivery: delivery!,
        recipientName,
        recipientPhone,
        offeredFeeJod: Number(offeredFeeJod),
      });

      success(`Delivery dispatch ${newRequest.referenceNo} created! Available for nearby drivers.`);
      navigate(`/seller/requests/${newRequest.requestId || (newRequest as any).id}`);
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to create delivery request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/seller"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Create Delivery Request
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify item details, pickup point in Amman, customer dropoff, and fee
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form Inputs */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Item Details Card */}
            <Card>
              <CardHeader
                title="1. Package & Item Details"
                subtitle="Information presented to nearby drivers"
              />
              <CardContent className="space-y-4">
                <Input
                  label="Product Name"
                  placeholder="e.g. Handmade Ceramic Mug, Boutique Dress"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  error={errors.productName}
                  hint="3 to 80 characters"
                />

                <Textarea
                  label="Product Description & Handling Notes"
                  placeholder="e.g. Fragile glass item packed in bubble wrap. Keep upright."
                  required
                  rows={3}
                  maxLength={500}
                  showCounter
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  error={errors.productDescription}
                />

                <FileDrop
                  label="Product Photo (Optional)"
                  hint="Helps driver identify the parcel (JPG, PNG, WebP up to 5 MB)"
                  value={productImageDataUrl}
                  onChange={(val) => setProductImageDataUrl(val)}
                  onRemove={() => setProductImageDataUrl('')}
                />
              </CardContent>
            </Card>

            {/* 2. Route & Coordinates Card */}
            <Card>
              <CardHeader
                title="2. Route & Locations"
                subtitle="Select store pickup and customer dropoff locations"
              />
              <CardContent className="space-y-5">
                <LocationPicker
                  label="Pickup Location (Your Store / Warehouse)"
                  required
                  allowCurrentLocation
                  value={pickup}
                  onChange={(pt) => setPickup(pt)}
                  error={errors['pickup.lat'] || errors['pickup.label']}
                />

                <LocationPicker
                  label="Customer Drop-off Location"
                  required
                  value={delivery}
                  onChange={(pt) => setDelivery(pt)}
                  error={errors['delivery.lat'] || errors['delivery.label']}
                  hint="Choose neighbourhood from dropdown or drop a pin on the map"
                />
              </CardContent>
            </Card>

            {/* 3. Recipient Contact & Fee */}
            <Card>
              <CardHeader
                title="3. Recipient & Delivery Fee"
                subtitle="Customer contact information and driver delivery payment"
              />
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Recipient Full Name"
                    placeholder="e.g. Layla Majali"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    error={errors.recipientName}
                  />

                  <Input
                    label="Recipient Phone Number"
                    placeholder="0791234567"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    error={errors.recipientPhone}
                    hint="10-digit Jordanian mobile"
                  />
                </div>

                <div className="pt-2">
                  <Input
                    label="Offered Delivery Fee (JOD)"
                    type="number"
                    step="0.25"
                    min="0.5"
                    max="50"
                    required
                    value={offeredFeeJod}
                    onChange={(e) =>
                      setOfferedFeeJod(
                        e.target.value === '' ? '' : parseFloat(e.target.value)
                      )
                    }
                    error={errors.offeredFeeJod}
                    hint="Standard local Amman deliveries range from 2.50 to 5.00 JOD"
                    leftIcon={<Banknote className="w-4 h-4 text-amber-600" />}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link to="/seller">
                <Button variant="outline" size="md">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Publish Delivery Request
              </Button>
            </div>
          </div>

          {/* Right Column: Live Route Summary & Map Preview */}
          <div className="lg:col-span-5 space-y-4 sticky top-20">
            <Card>
              <CardHeader
                title="Live Route Preview"
                subtitle="Interactive preview of Jordan delivery path"
              />
              <CardContent className="p-3">
                <MapView
                  pickup={pickup || undefined}
                  delivery={delivery || undefined}
                  height="260px"
                  activeLeg="ALL"
                  showControls={false}
                />
              </CardContent>

              {/* Route Metrics */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Trip Distance:</span>
                  <span className="font-bold text-slate-800">
                    {routeInfo ? formatDistance(routeInfo.distanceKm) : '–'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Estimated Travel Time:</span>
                  <span className="font-bold text-slate-800">
                    {routeInfo ? formatDuration(routeInfo.durationMin) : '–'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-800">Offered Fee:</span>
                  <span className="font-bold text-base text-teal-800 font-mono">
                    {offeredFeeJod ? formatFee(Number(offeredFeeJod)) : '–'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Hint Box */}
            <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-start gap-2">
              <Navigation className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Once published, this dispatch will automatically broadcast to approved couriers within range across Jordan.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
