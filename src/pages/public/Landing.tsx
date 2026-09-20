import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck,
  ShieldCheck,
  Compass,
  Clock,
  MapPin,
  ArrowRight,
  Package,
  UserCheck,
  Sparkles,
  Route,
} from 'lucide-react';
import { useAuth } from '../../services/auth/AuthContext';
import { Button } from '../../components/ui/Button';

export const Landing: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemoLogin = async (
    email: string,
    role: 'SELLER' | 'DRIVER' | 'ADMIN'
  ) => {
    try {
      const password =
        role === 'SELLER'
          ? 'Seller@123'
          : role === 'DRIVER'
          ? 'Driver@123'
          : 'Admin@123';
      const res = await login({ email, password });
      if (res.role === 'SELLER') navigate('/seller');
      else if (res.role === 'DRIVER') navigate('/driver');
      else navigate('/admin');
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col gap-12 sm:gap-20 pb-16">
      {/* "Try the Demo" Quick Bar */}
      <section className="bg-teal-900 text-white py-3.5 px-4 sm:px-8 border-b border-teal-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <p className="text-xs font-semibold text-teal-100">
              Interactive Graduation Project Demo · Pre-seeded with realistic Jordan delivery scenarios
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('seller@demo.com', 'SELLER')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Log in as Seller
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('driver@demo.com', 'DRIVER')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Log in as Driver
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin@demo.com', 'ADMIN')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Log in as Admin
            </button>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 sm:pt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 flex flex-col items-start gap-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
            <Compass className="w-3.5 h-3.5 text-teal-600" />
            <span>Location-Aware Intelligent Dispatching</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Nearby Sellers. <br />
            <span className="text-teal-700">Verified Drivers.</span> <br />
            Seamless Delivery.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
            Smart Delivery Platform pairs commercial sellers with nearby, admin-vetted drivers in Amman. View accurate travel distance and estimated arrival time upfront before accepting single-order delivery dispatches.
          </p>

          <div className="flex items-center gap-3 pt-2 w-full sm:w-auto">
            <Link to="/signup" className="flex-1 sm:flex-initial">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto shadow-md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Get Started
              </Button>
            </Link>
            <Link to="/login" className="flex-1 sm:flex-initial">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Demo
              </Button>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 w-full max-w-md">
            <div>
              <span className="block text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                10 km
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Proximity Radius
              </span>
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-extrabold text-teal-700 font-heading">
                100%
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Admin Verified
              </span>
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                2-Leg
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Live Route Display
              </span>
            </div>
          </div>
        </div>

        {/* Hero Visual: Illustrated Route & Map Graphic (Not stock photo!) */}
        <div className="lg:col-span-5 w-full">
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl p-5 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-800 font-mono">
                  DISPATCH #SDP-1002
                </span>
              </div>
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Proximity Match
              </span>
            </div>

            {/* Stylized Illustrated Route Graphic */}
            <div className="my-4 relative h-56 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center p-4">
              <svg viewBox="0 0 360 200" className="w-full h-full">
                {/* Roads */}
                <path
                  d="M 20 180 Q 90 120 170 140 T 340 70"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="8"
                />
                <path
                  d="M 60 20 Q 140 100 240 80 T 320 180"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="6"
                />

                {/* Animated active delivery route */}
                <path
                  d="M 60 140 Q 140 90 200 120 T 300 70"
                  fill="none"
                  stroke="#0F766E"
                  strokeWidth="3.5"
                  strokeDasharray="6 4"
                />

                {/* Driver Pin */}
                <g transform="translate(60, 140)">
                  <circle r="14" fill="#0284C7" fillOpacity="0.2" className="animate-ping" />
                  <circle r="7" fill="#0284C7" stroke="#FFF" strokeWidth="2" />
                  <text y="18" fontSize="9" fontWeight="700" fill="#0369A1" textAnchor="middle">
                    Driver
                  </text>
                </g>

                {/* Pickup Pin */}
                <g transform="translate(200, 120)">
                  <circle r="7" fill="#F59E0B" stroke="#FFF" strokeWidth="2" />
                  <text y="18" fontSize="9" fontWeight="700" fill="#B45309" textAnchor="middle">
                    Seller
                  </text>
                </g>

                {/* Dropoff Pin */}
                <g transform="translate(300, 70)">
                  <circle r="7" fill="#10B981" stroke="#FFF" strokeWidth="2" />
                  <text y="18" fontSize="9" fontWeight="700" fill="#047857" textAnchor="middle">
                    Customer
                  </text>
                </g>
              </svg>
            </div>

            {/* Live Metrics Strip */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-500 block">Distance to Seller</span>
                <span className="font-bold text-slate-800">2.1 km (7 min)</span>
              </div>
              <div className="p-2 bg-teal-50 rounded-lg border border-teal-100">
                <span className="text-[10px] text-teal-700 block">Delivery Fee</span>
                <span className="font-bold text-teal-900">3.5 JOD</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="bg-white py-12 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Designed for Urban Precision & Trust
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Every design decision addresses real logistical challenges for Jordanian sellers and drivers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Proximity Matching</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Drivers discover orders within an optimal 10 km radius of their active location, minimizing deadhead travel.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Upfront Distance & ETA</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clear pickup distance and estimated travel time are transparently calculated before order acceptance.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
                <Route className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Two-Leg Route Display</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seamless multi-point navigation from Driver → Seller (pickup) → Customer (final destination).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Verified Drivers Only</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stringent administrative vetting checks identity, driving licence, vehicle specifications, and plate numbers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section (3 steps for sellers, 3 for drivers, 1 for admin) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How The Platform Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            A balanced workflow providing efficiency for sellers, drivers, and platform operators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Sellers */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Package className="w-5 h-5 text-teal-700" />
              <h3 className="text-lg font-bold text-slate-900">For Sellers</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Create Delivery Request</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Specify package information, pickup location, drop-off location, recipient contact, and offered fee.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Nearby Driver Accepts</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    An approved driver in your vicinity claims the order. Instantly view driver details, phone, and vehicle information.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Track Progress to Delivery</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live timeline status updates automatically transition through Picked Up, On the Way, and Delivered.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* For Drivers */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Truck className="w-5 h-5 text-teal-700" />
              <h3 className="text-lg font-bold text-slate-900">For Drivers</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Register & Submit Verification</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Provide personal credentials, vehicle details, and photographs of your driver's licence for administrative audit.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Review Nearby Requests</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Browse orders near your current location. Inspect distance to pickup, estimated travel time, and fee upfront.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Execute Two-Leg Delivery</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Follow the guided route to the seller, retrieve package, and safely dispatch to the customer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Note on Admin Verification */}
        <div className="mt-8 p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-3 text-xs text-teal-900">
          <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0" />
          <p>
            <strong className="font-bold">Administrative Safeguard:</strong> All driver applications must be reviewed and approved by platform administrators before any access to delivery requests is granted.
          </p>
        </div>
      </section>
    </div>
  );
};
