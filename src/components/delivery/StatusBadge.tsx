import React from 'react';
import {
  Clock,
  UserCheck,
  PackageCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { DeliveryStatus, DriverStatus } from '../../types/domain';
import { Badge } from '../ui/Badge';

export interface StatusBadgeProps {
  status: DeliveryStatus | DriverStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  switch (status) {
    case 'AVAILABLE':
      return (
        <Badge
          variant="blue"
          size={size}
          icon={<Clock className="w-3.5 h-3.5 text-sky-600" />}
        >
          Available
        </Badge>
      );
    case 'ACCEPTED':
      return (
        <Badge
          variant="indigo"
          size={size}
          icon={<UserCheck className="w-3.5 h-3.5 text-indigo-600" />}
        >
          Accepted
        </Badge>
      );
    case 'PICKED_UP':
      return (
        <Badge
          variant="amber"
          size={size}
          icon={<PackageCheck className="w-3.5 h-3.5 text-amber-600" />}
        >
          Picked Up
        </Badge>
      );
    case 'ON_THE_WAY':
      return (
        <Badge
          variant="orange"
          size={size}
          icon={<Truck className="w-3.5 h-3.5 text-orange-600" />}
        >
          On the Way
        </Badge>
      );
    case 'DELIVERED':
      return (
        <Badge
          variant="emerald"
          size={size}
          icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
        >
          Delivered
        </Badge>
      );
    case 'PENDING':
      return (
        <Badge
          variant="amber"
          size={size}
          icon={<Clock className="w-3.5 h-3.5 text-amber-600" />}
        >
          Pending
        </Badge>
      );
    case 'APPROVED':
      return (
        <Badge
          variant="emerald"
          size={size}
          icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
        >
          Approved
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge
          variant="rose"
          size={size}
          icon={<XCircle className="w-3.5 h-3.5 text-rose-600" />}
        >
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="slate">{status}</Badge>;
  }
};
