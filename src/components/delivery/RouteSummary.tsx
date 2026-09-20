import React from 'react';
import { Navigation, Clock, Flag, MapPin, ArrowRight } from 'lucide-react';
import { formatDistance, formatDuration } from '../../utils/format';

export interface RouteSummaryProps {
  leg1DistanceKm: number;
  leg1DurationMin: number;
  leg2DistanceKm: number;
  leg2DurationMin: number;
  totalDistanceKm: number;
  totalDurationMin: number;
  activeLeg?: 'TO_PICKUP' | 'TO_DELIVERY' | 'ALL';
  className?: string;
}

export const RouteSummary: React.FC<RouteSummaryProps> = ({
  leg1DistanceKm,
  leg1DurationMin,
  leg2DistanceKm,
  leg2DurationMin,
  totalDistanceKm,
  totalDurationMin,
  activeLeg = 'ALL',
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col gap-3 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Journey Overview
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
            Total: {formatDistance(totalDistanceKm)} · {formatDuration(totalDurationMin)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Leg 1: Driver -> Pickup */}
        <div
          className={`p-3 rounded-lg border transition-all ${
            activeLeg === 'TO_PICKUP'
              ? 'bg-teal-50/70 border-teal-300 ring-1 ring-teal-400'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Leg 1: Driver → Pickup</span>
            </div>
            {activeLeg === 'TO_PICKUP' && (
              <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.2 rounded">
                Active Leg
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-slate-500" />
              {formatDistance(leg1DistanceKm)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {formatDuration(leg1DurationMin)}
            </span>
          </div>
        </div>

        {/* Leg 2: Pickup -> Customer */}
        <div
          className={`p-3 rounded-lg border transition-all ${
            activeLeg === 'TO_DELIVERY'
              ? 'bg-teal-50/70 border-teal-300 ring-1 ring-teal-400'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Leg 2: Pickup → Customer</span>
            </div>
            {activeLeg === 'TO_DELIVERY' && (
              <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.2 rounded">
                Active Leg
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-slate-500" />
              {formatDistance(leg2DistanceKm)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {formatDuration(leg2DurationMin)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
