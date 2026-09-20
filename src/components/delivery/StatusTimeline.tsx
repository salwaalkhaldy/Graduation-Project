import React from 'react';
import { Check, Clock } from 'lucide-react';
import { DeliveryStatus } from '../../types/domain';
import { formatDate, formatShortTime } from '../../utils/format';

export interface StatusTimelineProps {
  currentStatus: DeliveryStatus;
  statusHistory: { status: DeliveryStatus; at: string }[];
  className?: string;
}

const STEPS: { status: DeliveryStatus; label: string }[] = [
  { status: 'AVAILABLE', label: 'Available' },
  { status: 'ACCEPTED', label: 'Accepted' },
  { status: 'PICKED_UP', label: 'Picked Up' },
  { status: 'ON_THE_WAY', label: 'On the Way' },
  { status: 'DELIVERED', label: 'Delivered' },
];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus,
  statusHistory,
  className = '',
}) => {
  const currentIndex = STEPS.findIndex((s) => s.status === currentStatus);

  const getTimestamp = (status: DeliveryStatus) => {
    const entry = statusHistory.find((h) => h.status === status);
    return entry ? formatShortTime(entry.at) : null;
  };

  return (
    <div className={`w-full py-4 ${className}`}>
      <div className="relative flex items-center justify-between">
        {/* Connector line behind circles */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 z-0" />
        <div
          className="absolute top-4 left-4 h-0.5 bg-teal-600 transition-all duration-300 z-0"
          style={{
            width: `${(Math.max(0, currentIndex) / (STEPS.length - 1)) * 100}%`,
          }}
        />

        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isFuture = idx > currentIndex;
          const timestamp = getTimestamp(step.status);

          return (
            <div
              key={step.status}
              className="relative z-10 flex flex-col items-center flex-1 text-center"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 border-2 ${
                  isCompleted
                    ? 'bg-teal-700 border-teal-700 text-white'
                    : isCurrent
                    ? 'bg-white border-teal-700 text-teal-800 ring-4 ring-teal-100'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isCurrent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-700" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </div>

              <div className="mt-2 flex flex-col items-center">
                <span
                  className={`text-xs font-semibold whitespace-nowrap ${
                    isCurrent
                      ? 'text-teal-900 font-bold'
                      : isCompleted
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
                {timestamp ? (
                  <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                    {timestamp}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-300 mt-0.5">–</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
