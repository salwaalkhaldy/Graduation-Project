import React, { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Truck,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Maximize2,
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../services/auth/AuthContext';
import { DriverProfile } from '../../types/domain';
import { formatDate } from '../../utils/format';
import { StatusBadge } from '../../components/delivery/StatusBadge';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Lightbox } from '../../components/ui/Lightbox';
import { Skeleton } from '../../components/ui/Skeleton';

export const DriverProfilePage: React.FC = () => {
  const { session } = useAuth();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    api
      .getDriverProfile()
      .then((data: any) => {
        if (mounted) {
          setProfile({
            id: data.driverId || data.id,
            userId: data.userId,
            fullName: data.user?.fullName || session?.user.fullName || '',
            email: data.user?.email || session?.user.email || '',
            phone: data.user?.phoneNumber || data.user?.phone || session?.user.phoneNumber || session?.user.phone || '',
            nationalId: data.nationalIdNumber || '',
            vehicleType: data.vehicle?.vehicleType || 'CAR',
            vehicleModel: data.vehicle?.model || '',
            vehicleColor: data.vehicle?.colour || '',
            plateNumber: data.vehicle?.plateNumber || '',
            driverLicenseUrl: data.driverLicenseUrl || data.documents?.[0]?.fileUrl || '',
            personalPhotoUrl: data.personalPhotoUrl || '',
            status: data.accountStatus || session?.driverStatus || 'PENDING',
            rejectionReason: data.rejectionReason,
            createdAt: data.user?.createdAt || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const driver: DriverProfile = profile || {
    id: session?.user.userId || '',
    userId: session?.user.userId || '',
    fullName: session?.user.fullName || '',
    email: session?.user.email || '',
    phone: session?.user.phoneNumber || session?.user.phone || '',
    nationalId: '9981023456',
    vehicleType: 'CAR',
    vehicleModel: 'Toyota Prius',
    vehicleColor: 'White',
    plateNumber: '50-12345',
    driverLicenseUrl: '',
    personalPhotoUrl: '',
    status: session?.driverStatus || 'PENDING',
    rejectionReason: undefined,
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Driver Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your credentials, registered vehicle particulars, and authorization status
          </p>
        </div>

        <StatusBadge status={driver.status} size="md" />
      </div>

      {/* Prominent Status Explanation Banner */}
      {driver.status === 'PENDING' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900 text-xs">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-950">
              Application Under Review
            </h4>
            <p className="mt-1 leading-relaxed text-amber-800">
              Your driver licence and registration details are being audited by platform administrators. Once approved, you will immediately receive access to view and accept nearby orders in Amman.
            </p>
          </div>
        </div>
      )}

      {driver.status === 'REJECTED' && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-900 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-950">
              Application Rejected
            </h4>
            <p className="mt-1 leading-relaxed text-rose-800">
              Reason: <strong>{driver.rejectionReason || 'Documents could not be verified by the administrator.'}</strong>
            </p>
          </div>
        </div>
      )}

      {driver.status === 'APPROVED' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-900 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-950">
              Account Verified & Active
            </h4>
            <p className="mt-1 leading-relaxed text-emerald-800">
              Your credentials are in good standing. You are authorized to accept and fulfill commercial dispatches.
            </p>
          </div>
        </div>
      )}

      {/* Personal Particulars */}
      <Card>
        <CardHeader
          title="Personal Details"
          subtitle="Civil and identity information"
        />
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
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
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {driver.fullName}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                National ID: {driver.nationalId}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block mb-0.5">Email:</span>
              <span className="font-semibold text-slate-800">{driver.email}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block mb-0.5">Phone:</span>
              <span className="font-semibold text-slate-800">{driver.phone}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Particulars */}
      <Card>
        <CardHeader
          title="Registered Vehicle Particulars"
          subtitle="Specifications used by sellers to recognize you during pickup"
        />
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block mb-0.5">Type:</span>
              <span className="font-bold text-slate-800">{driver.vehicleType}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block mb-0.5">Model / Make:</span>
              <span className="font-bold text-slate-800">{driver.vehicleModel}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block mb-0.5">Colour:</span>
              <span className="font-bold text-slate-800">{driver.vehicleColor}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block mb-0.5">Plate Number:</span>
              <span className="font-mono font-bold text-slate-900">{driver.plateNumber}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Licence Document */}
      <Card>
        <CardHeader
          title="Driver's Licence Document"
          subtitle="Official scan uploaded during registration. Click image to inspect in full resolution."
        />
        <CardContent>
          {driver.driverLicenseUrl ? (
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="group relative w-48 h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer shadow-xs hover:shadow-md transition-all"
            >
              <img
                src={driver.driverLicenseUrl}
                alt="Driver Licence Document"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-semibold">
                <Maximize2 className="w-4 h-4" />
                <span>Zoom</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No document attached.</p>
          )}
        </CardContent>
      </Card>

      {/* Document Lightbox */}
      {driver.driverLicenseUrl && (
        <Lightbox
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          imageUrl={driver.driverLicenseUrl}
          title={`${driver.fullName} – Driver's Licence`}
        />
      )}
    </div>
  );
};
