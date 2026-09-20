import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Compass,
  CreditCard,
  Star,
  Bell,
  MessageSquare,
  Smartphone,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-12">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          About Smart Delivery Platform
        </h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          An academic graduation project prototype showcasing location-aware logistics, multi-role access control, upfront travel estimates, and administrative trust verification for Amman, Jordan.
        </p>
      </div>

      {/* Verification Explainer */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-teal-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              How Driver Verification Works
            </h2>
            <p className="text-xs text-slate-500">
              Ensuring trust between commercial sellers and independent couriers
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Upon registration, drivers submit their official Jordanian National ID number, personal portrait, vehicle particulars (make, model, colour, and licence plate), and an upload of their driving licence. 
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <span className="font-bold text-slate-800 block mb-1">
              1. Pending Stage
            </span>
            <p className="text-slate-500 text-[11px]">
              The account is securely locked. Drivers cannot browse or accept any customer delivery requests.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <span className="font-bold text-slate-800 block mb-1">
              2. Administrative Audit
            </span>
            <p className="text-slate-500 text-[11px]">
              Platform admins cross-check documents in a verification interface with lightbox document zooming.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <span className="font-bold text-slate-800 block mb-1">
              3. Approval or Rejection
            </span>
            <p className="text-slate-500 text-[11px]">
              Approved drivers gain immediate dispatch access. If rejected, an explanation reason is returned.
            </p>
          </div>
        </div>
      </section>

      {/* Planned for Later Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Planned for Subsequent Phases
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Architectural roadmap for commercial deployment beyond the prototype scope
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-900">In-App Payment Gateway</h3>
              <p className="text-xs text-slate-500 mt-1">
                Automated payout via CliQ, credit cards, or cash-on-delivery escrow handling.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 flex items-start gap-3">
            <Star className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-900">Two-Way Rating System</h3>
              <p className="text-xs text-slate-500 mt-1">
                Post-delivery star reviews and badges for reliable sellers and punctual drivers.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 flex items-start gap-3">
            <Compass className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-900">Real-Time GPS Telemetry</h3>
              <p className="text-xs text-slate-500 mt-1">
                Continuous driver location streaming via WebSockets with moving map markers.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 flex items-start gap-3">
            <Bell className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-900">Push Notifications</h3>
              <p className="text-xs text-slate-500 mt-1">
                Browser web push and SMS notifications when nearby requests are broadcast or claimed.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-900">In-App Secure Chat</h3>
              <p className="text-xs text-slate-500 mt-1">
                Private messaging between active courier and seller for delivery instructions.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 flex items-start gap-3">
            <Layers className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-slate-900">Multi-Drop Batching</h3>
              <p className="text-xs text-slate-500 mt-1">
                Route optimization allowing drivers to collect multiple parcels along a shared path.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center pt-4">
        <Link to="/">
          <Button variant="outline" size="md">
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
};
