import { DeliveryStatus, DriverStatus, Role, VehicleType } from '../types/domain';

/**
 * Format distance in kilometers to human-readable string.
 * Under 1 km: e.g. "850 m"
 * Over 1 km: e.g. "2.4 km"
 */
export function formatDistance(distanceKm: number): string {
  if (isNaN(distanceKm) || distanceKm <= 0) return '0 m';
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Format duration in minutes to e.g. "12 min" or "1 h 05 min"
 */
export function formatDuration(durationMin: number): string {
  if (isNaN(durationMin) || durationMin <= 0) return '1 min';
  const mins = Math.round(durationMin);
  if (mins < 60) {
    return `${mins} min`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours} h ${remainingMins.toString().padStart(2, '0')} min`;
}

/**
 * Format delivery fee in JOD: e.g. "2.5 JOD"
 */
export function formatFee(feeJod: number): string {
  return `${Number(feeJod).toFixed(1)} JOD`;
}

/**
 * Format ISO date string to localized readable date
 */
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatShortTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function getDeliveryStatusDetails(status: DeliveryStatus): {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  iconName: string;
} {
  switch (status) {
    case 'AVAILABLE':
      return {
        label: 'Available',
        bgClass: 'bg-sky-50',
        textClass: 'text-sky-700',
        borderClass: 'border-sky-200',
        iconName: 'Clock',
      };
    case 'ACCEPTED':
      return {
        label: 'Accepted',
        bgClass: 'bg-indigo-50',
        textClass: 'text-indigo-700',
        borderClass: 'border-indigo-200',
        iconName: 'UserCheck',
      };
    case 'PICKED_UP':
      return {
        label: 'Picked Up',
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-700',
        borderClass: 'border-amber-200',
        iconName: 'PackageCheck',
      };
    case 'ON_THE_WAY':
      return {
        label: 'On the Way',
        bgClass: 'bg-orange-50',
        textClass: 'text-orange-700',
        borderClass: 'border-orange-200',
        iconName: 'Truck',
      };
    case 'DELIVERED':
      return {
        label: 'Delivered',
        bgClass: 'bg-emerald-50',
        textClass: 'text-emerald-700',
        borderClass: 'border-emerald-200',
        iconName: 'CheckCircle2',
      };
    default:
      return {
        label: status,
        bgClass: 'bg-slate-50',
        textClass: 'text-slate-700',
        borderClass: 'border-slate-200',
        iconName: 'Clock',
      };
  }
}

export function getDriverStatusDetails(status: DriverStatus): {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  switch (status) {
    case 'PENDING':
    case 'PENDING_APPROVAL':
      return {
        label: 'Pending Verification',
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-700',
        borderClass: 'border-amber-200',
      };
    case 'APPROVED':
      return {
        label: 'Approved',
        bgClass: 'bg-emerald-50',
        textClass: 'text-emerald-700',
        borderClass: 'border-emerald-200',
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        bgClass: 'bg-rose-50',
        textClass: 'text-rose-700',
        borderClass: 'border-rose-200',
      };
    default:
      return {
        label: status,
        bgClass: 'bg-slate-50',
        textClass: 'text-slate-700',
        borderClass: 'border-slate-200',
      };
  }
}
