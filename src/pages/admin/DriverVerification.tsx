import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Truck,
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Maximize2,
  CheckSquare,
} from 'lucide-react';
import { api } from '../../api/client';
import { DriverProfile } from '../../types/domain';
import { formatDate } from '../../utils/format';
import { StatusBadge } from '../../components/delivery/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/ErrorState';
import { Lightbox } from '../../components/ui/Lightbox';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { Textarea } from '../../components/ui/Textarea';
import { useToast } from '../../components/ui/Toast';

export const AdminDriverVerification: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showErrorToast } = useToast();

  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeLightboxDoc, setActiveLightboxDoc] = useState<{
    url: string;
    title: string;
  } | null>(null);

  // Approval Modal State
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Rejection Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);

  // Helper Verification Checklist
  const [checklist, setChecklist] = useState({
    idVerified: false,
    licenseValid: false,
    vehicleConsistent: false,
  });

  const loadDriver = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data: any = await api.getDriverDetails(id);
      const licDoc = data.documents?.find((d: any) => d.documentType === 'LICENCE')?.fileUrl;
      const natDoc = data.documents?.find((d: any) => d.documentType === 'NATIONAL_ID')?.fileUrl;
      const vehDoc = data.documents?.find((d: any) => d.documentType === 'VEHICLE_REGISTRATION')?.fileUrl;

      const profile: DriverProfile = {
        id: data.driverId || data.id,
        userId: data.userId || '',
        fullName: data.user?.fullName || data.fullName || 'Unknown Driver',
        email: data.user?.email || data.email || '',
        phone: data.user?.phoneNumber || data.phone || '',
        nationalId: data.nationalIdNumber || data.nationalId || '',
        vehicleType: data.vehicle?.vehicleType || data.vehicleType || 'CAR',
        vehicleModel: data.vehicle?.model || data.vehicleModel || '',
        vehicleColor: data.vehicle?.colour || data.vehicleColor || '',
        plateNumber: data.vehicle?.plateNumber || data.plateNumber || '',
        personalPhotoUrl: data.personalPhotoUrl,
        driverLicenseUrl: data.driverLicenseUrl || data.licensePhotoUrl || licDoc,
        nationalIdCardUrl: data.nationalIdCardUrl || natDoc,
        vehicleRegistrationUrl: data.vehicleRegistrationUrl || vehDoc,
        applicationId: data.applicationId,
        preferredGovernorate: data.preferredGovernorate,
        status: data.accountStatus || data.status,
        rejectionReason: data.rejectionReason,
        createdAt: data.user?.createdAt || data.createdAt || '',
      };
      setDriver(profile);
    } catch (err: any) {
      setErrorMsg(err.message || 'Driver profile not found');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDriver();
  }, [id]);

  const handleApprove = async () => {
    if (!driver) return;
    try {
      setIsApproving(true);
      await api.approveDriver(driver.id);
      setDriver((prev) => (prev ? { ...prev, status: 'APPROVED' } : null));
      setIsApproveModalOpen(false);
      success(`Driver ${driver.fullName} has been approved!`);
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to approve driver');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!driver) return;
    if (!rejectionReason.trim() || rejectionReason.trim().length < 10) {
      setRejectionError('Rejection reason must be at least 10 characters.');
      return;
    }

    try {
      setIsRejecting(true);
      await api.rejectDriver(driver.id, rejectionReason.trim());
      setDriver((prev) => (prev ? { ...prev, status: 'REJECTED', rejectionReason: rejectionReason.trim() } : null));
      setIsRejectModalOpen(false);
      success(`Driver ${driver.fullName}'s application has been rejected.`);
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to reject driver');
    } finally {
      setIsRejecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (errorMsg || !driver) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title="Driver Not Found"
          message={errorMsg || 'The requested driver profile could not be loaded.'}
          onRetry={() => navigate('/admin/drivers')}
        />
      </div>
    );
  }

  const isPending = driver.status === 'PENDING' || driver.status === 'PENDING_APPROVAL';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/drivers"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {driver.fullName}
              </h1>
              <StatusBadge status={driver.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Registered on {formatDate(driver.createdAt)} · Application audit
            </p>
          </div>
        </div>

        {/* Action Buttons if Pending */}
        {isPending && (
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsRejectModalOpen(true)}
              leftIcon={<XCircle className="w-4 h-4" />}
            >
              Reject Application
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsApproveModalOpen(true)}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Approve Driver
            </Button>
          </div>
        )}
      </div>

      {/* Outcome Banner if already resolved */}
      {driver.status === 'APPROVED' && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-3 text-xs text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <strong className="font-bold">Application Approved:</strong> This driver has been vetted and possesses active dispatch privileges on the platform.
          </div>
        </div>
      )}

      {driver.status === 'REJECTED' && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-3 text-xs text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Application Rejected:</strong>
            <p className="mt-0.5 leading-relaxed">
              Reason: {driver.rejectionReason || 'Documents or identity could not be validated.'}
            </p>
          </div>
        </div>
      )}

      {/* Driver Identity Card */}
      <Card>
        <CardHeader
          title="Personal Identity & Contact"
          subtitle="Civil information submitted by the applicant"
        />
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
              {driver.personalPhotoUrl ? (
                <img
                  src={driver.personalPhotoUrl}
                  alt={driver.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {driver.fullName}
              </h3>
              <p className="text-xs font-mono text-slate-600">
                Jordanian National ID: <strong>{driver.nationalId}</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block mb-0.5">Email Address:</span>
              <span className="font-semibold text-slate-800">{driver.email}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block mb-0.5">Phone Number:</span>
              <a
                href={`tel:${driver.phone}`}
                className="font-semibold text-teal-700 hover:underline"
              >
                {driver.phone}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Particulars Card */}
      <Card>
        <CardHeader
          title="Vehicle Information"
          subtitle="Inspection details submitted for platform courier services"
        />
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block mb-0.5">Vehicle Type:</span>
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
              <span className="text-slate-500 block mb-0.5">Licence Plate:</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                {driver.plateNumber}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Audit Card */}
      <Card>
        <CardHeader
          title="Verification Documents Package"
          subtitle="Click any document to inspect in high-resolution lightbox with zoom and rotate controls"
        />
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Driver Licence */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                1. Driving Licence (Required)
              </span>
              {driver.driverLicenseUrl ? (
                <div
                  onClick={() =>
                    setActiveLightboxDoc({
                      url: driver.driverLicenseUrl!,
                      title: `${driver.fullName} – Jordanian Driving Licence`,
                    })
                  }
                  className="group relative h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer shadow-xs hover:shadow-md transition-all"
                >
                  <img
                    src={driver.driverLicenseUrl}
                    alt="Driver Licence Document"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-semibold">
                    <Maximize2 className="w-4 h-4" />
                    <span>Zoom & Inspect</span>
                  </div>
                </div>
              ) : (
                <div className="h-40 rounded-xl border border-dashed border-rose-300 bg-rose-50/50 flex items-center justify-center text-xs text-rose-500 font-medium">
                  No Licence Attached
                </div>
              )}
            </div>

            {/* 2. Civil Status National ID */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                2. National ID Card (بطاقة الأحوال)
              </span>
              {driver.nationalIdCardUrl ? (
                <div
                  onClick={() =>
                    setActiveLightboxDoc({
                      url: driver.nationalIdCardUrl!,
                      title: `${driver.fullName} – Civil Status National ID (${driver.nationalId})`,
                    })
                  }
                  className="group relative h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer shadow-xs hover:shadow-md transition-all"
                >
                  <img
                    src={driver.nationalIdCardUrl}
                    alt="National ID Card"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-semibold">
                    <Maximize2 className="w-4 h-4" />
                    <span>Zoom & Inspect</span>
                  </div>
                </div>
              ) : (
                <div className="h-40 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400">
                  Not Provided
                </div>
              )}
            </div>

            {/* 3. Vehicle Registration Mulkiya */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                3. Vehicle Mulkiya (رخصة سير المركبة)
              </span>
              {driver.vehicleRegistrationUrl ? (
                <div
                  onClick={() =>
                    setActiveLightboxDoc({
                      url: driver.vehicleRegistrationUrl!,
                      title: `${driver.fullName} – Vehicle Registration (${driver.plateNumber})`,
                    })
                  }
                  className="group relative h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer shadow-xs hover:shadow-md transition-all"
                >
                  <img
                    src={driver.vehicleRegistrationUrl}
                    alt="Vehicle Registration"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-semibold">
                    <Maximize2 className="w-4 h-4" />
                    <span>Zoom & Inspect</span>
                  </div>
                </div>
              ) : (
                <div className="h-40 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400">
                  Not Provided
                </div>
              )}
            </div>
          </div>

          {/* Verification Helper Checklist (Optional UX helper for admin) */}
          {isPending && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-700 block">
                Verification Audit Checklist (Administrator Aid):
              </span>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.idVerified}
                  onChange={(e) =>
                    setChecklist((c) => ({ ...c, idVerified: e.target.checked }))
                  }
                  className="w-4 h-4 text-teal-600 rounded border-slate-300"
                />
                <span className="text-slate-700">
                  Driver's name matches National ID ({driver.nationalId})
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.licenseValid}
                  onChange={(e) =>
                    setChecklist((c) => ({ ...c, licenseValid: e.target.checked }))
                  }
                  className="w-4 h-4 text-teal-600 rounded border-slate-300"
                />
                <span className="text-slate-700">
                  Driving licence document is legible, unexpired, and authentic
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.vehicleConsistent}
                  onChange={(e) =>
                    setChecklist((c) => ({
                      ...c,
                      vehicleConsistent: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-teal-600 rounded border-slate-300"
                />
                <span className="text-slate-700">
                  Vehicle particulars ({driver.vehicleType}, {driver.plateNumber}) are standard and consistent
                </span>
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox Modal */}
      {activeLightboxDoc && (
        <Lightbox
          isOpen={true}
          onClose={() => setActiveLightboxDoc(null)}
          imageUrl={activeLightboxDoc.url}
          title={activeLightboxDoc.title}
        />
      )}

      {/* Approval Confirmation Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Driver Application?"
        description={`Confirming will grant ${driver.fullName} immediate access to browse and accept delivery dispatches on the platform.`}
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsApproveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={isApproving}
              onClick={handleApprove}
            >
              Yes, Approve Driver
            </Button>
          </div>
        }
      >
        <p className="text-xs text-slate-600">
          The driver's account status will change to <strong>APPROVED</strong>.
        </p>
      </Modal>

      {/* Rejection Modal with Required Reason */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Driver Application"
        description="Provide an explicit explanation for why this application was rejected. This reason will be displayed directly to the applicant."
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={isRejecting}
              onClick={handleReject}
            >
              Confirm Rejection
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Textarea
            label="Rejection Reason"
            required
            rows={3}
            placeholder="e.g. Licence image was blurred and expiration date unreadable. Please re-upload a clear colour photo of your official driving licence."
            value={rejectionReason}
            onChange={(e) => {
              setRejectionReason(e.target.value);
              setRejectionError(null);
            }}
            error={rejectionError || undefined}
            hint="Minimum 10 characters required"
          />
        </div>
      </Modal>
    </div>
  );
};
