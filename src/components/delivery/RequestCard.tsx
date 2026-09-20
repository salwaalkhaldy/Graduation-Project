import React from 'react';
import { MapPin, Navigation, Clock, Banknote, ArrowRight } from 'lucide-react';
import { NearbyRequestItem } from '../../api/contracts';
import { formatDistance, formatDuration, formatFee } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface RequestCardProps {
  request: NearbyRequestItem;
  isNearest?: boolean;
  onView: (requestId: string) => void;
  onHover?: (request: NearbyRequestItem | null) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  isNearest = false,
  onView,
  onHover,
}) => {
  return (
    <div
      onMouseEnter={() => onHover && onHover(request)}
      onMouseLeave={() => onHover && onHover(null)}
      className={`bg-white rounded-xl border p-4 shadow-xs transition-all duration-200 hover:shadow-md hover:border-teal-400 flex flex-col justify-between gap-3 ${
        isNearest ? 'border-teal-500 ring-1 ring-teal-500/30' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            {request.referenceNo}
          </span>
          {isNearest && (
            <Badge variant="teal" size="sm">
              Nearest
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded-full text-xs font-bold">
          <Banknote className="w-3.5 h-3.5 text-amber-600" />
          <span>{formatFee(request.offeredFeeJod)}</span>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
          {request.productName}
        </h4>
        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
          {request.productDescription}
        </p>
      </div>

      {/* Locations */}
      <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <span className="font-semibold text-slate-500 text-[11px] shrink-0">
            Pickup:
          </span>
          <span className="truncate text-slate-800">{request.pickup.label}</span>
        </div>
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-semibold text-slate-500 text-[11px] shrink-0">
            Dropoff:
          </span>
          <span className="truncate text-slate-800">{request.delivery.label}</span>
        </div>
      </div>

      {/* Distance and Travel Time Metrics (Before acceptance) */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-slate-600">
            <Navigation className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-semibold">
              {formatDistance(request.distanceToPickupKm)}
            </span>
            <span className="text-[11px] text-slate-400">to pickup</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-semibold">
              {formatDuration(request.durationToPickupMin)}
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onView(request.requestId)}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          View Request
        </Button>
      </div>
    </div>
  );
};
