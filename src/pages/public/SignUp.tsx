import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  Truck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  MapPin,
  FileText,
  Sparkles,
  ExternalLink,
  Car,
  AlertCircle,
  FileCheck2,
  Briefcase,
  Check,
} from 'lucide-react';
import { VEHICLE_TYPES, JORDAN_PRESET_AREAS } from '../../config/constants';
import { useAuth } from '../../services/auth/AuthContext';
import { Role, VehicleType } from '../../types/domain';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { FileDrop } from '../../components/ui/FileDrop';
import { Stepper } from '../../components/ui/Stepper';
import { useToast } from '../../components/ui/Toast';
import {
  generateDrivingLicenceSvgDataUri,
  generateNationalIdSvgDataUri,
  generateMulkiyaSvgDataUri,
  generateAvatarSvgDataUri,
} from '../../utils/image';
import {
  sellerStep1Schema,
  sellerStep2Schema,
  sellerStep3Schema,
  driverStep1Schema,
  driverStep2Schema,
  driverStep3Schema,
} from '../../utils/validation';

const JORDAN_GOVERNORATES = [
  'Amman',
  'Zarqa',
  'Irbid',
  'Balqa',
  'Madaba',
  'Aqaba',
  'Karak',
  'Jerash',
  'Ajloun',
  'Mafraq',
  'Ma\'an',
  'Tafilah',
];

const STORE_CATEGORIES = [
  'Electronics & Gadgets',
  'Fashion & Apparel',
  'Groceries & Fresh Produce',
  'Pharmacy & Personal Care',
  'Restaurants & Baked Goods',
  'Home, Hardware & Decor',
  'Books & Stationery',
  'Gifts, Florist & Specialty',
  'General Retail Goods',
];

export const SignUp: React.FC = () => {
  const { registerSeller, registerDriver } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================
  // SELLER ONBOARDING WIZARD STATE
  // ==========================================
  const [sellerStep, setSellerStep] = useState(1);
  const [sellerForm, setSellerForm] = useState({
    // Step 1: Representative & Credentials
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Step 2: Store Particulars
    storeName: '',
    storeCategory: 'Electronics & Gadgets',
    governorate: 'Amman',
    commercialRegistration: '',
    businessPhone: '',
    // Step 3: Fulfillment Hub
    pickupAddress: '',
    pickupCity: 'Amman Center',
    pickupLat: 31.9539,
    pickupLng: 35.9106,
    // Step 4: Terms
    agreedToTerms: false,
  });
  const [sellerErrors, setSellerErrors] = useState<Record<string, string>>({});
  const [sellerCompletedData, setSellerCompletedData] = useState<{
    sellerId: string;
    storeName: string;
    email: string;
  } | null>(null);

  // ==========================================
  // DRIVER APPLICATION WIZARD STATE
  // ==========================================
  const [driverStep, setDriverStep] = useState(1);
  const [driverForm, setDriverForm] = useState({
    // Step 1: Personal Identification
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    nationalId: '',
    photoDataUrl: '',
    // Step 2: Vehicle & Zone
    vehicleType: 'CAR' as VehicleType,
    vehicleModel: '',
    vehicleColor: '',
    plateNumber: '',
    preferredGovernorate: 'Amman',
    // Step 3: Verification Documents
    licensePhotoDataUrl: '',
    nationalIdCardDataUrl: '',
    vehicleRegistrationDataUrl: '',
    // Step 4: Terms
    agreedToTerms: false,
  });
  const [driverErrors, setDriverErrors] = useState<Record<string, string>>({});
  const [driverSubmittedData, setDriverSubmittedData] = useState<{
    applicationId: string;
    driverId?: string;
    fullName: string;
    submittedAt: string;
  } | null>(null);

  // Quick Demo Auto-Fills
  const fillDemoSellerData = () => {
    setSellerForm({
      fullName: 'Omar Al-Nasser',
      email: `omar.store.${Math.floor(100 + Math.random() * 900)}@amman-tech.jo`,
      phone: '0795551234',
      password: 'Password123',
      confirmPassword: 'Password123',
      storeName: 'Al-Madina Electronics & Mobile',
      storeCategory: 'Electronics & Gadgets',
      governorate: 'Amman',
      commercialRegistration: 'CR-JO-2024-81923',
      businessPhone: '065601234',
      pickupAddress: 'Gardens St (Wasfi Al-Tal), Building 84, Amman',
      pickupCity: 'Abdali / Gardens, Amman',
      pickupLat: 31.9750,
      pickupLng: 35.8880,
      agreedToTerms: true,
    });
    setSellerErrors({});
    success('Sample Seller store data populated.');
  };

  const fillDemoDriverData = () => {
    const fullName = 'Tariq Al-Majali';
    const nationalId = '9941029481';
    const plate = '50-84920';
    const model = 'Toyota Prius 2022';
    setDriverForm({
      fullName,
      email: `tariq.driver.${Math.floor(100 + Math.random() * 900)}@delivery.jo`,
      phone: '0788884321',
      password: 'Password123',
      confirmPassword: 'Password123',
      nationalId,
      photoDataUrl: generateAvatarSvgDataUri(fullName),
      vehicleType: 'CAR',
      vehicleModel: model,
      vehicleColor: 'Silver Metallic',
      plateNumber: plate,
      preferredGovernorate: 'Amman',
      licensePhotoDataUrl: generateDrivingLicenceSvgDataUri(fullName, plate),
      nationalIdCardDataUrl: generateNationalIdSvgDataUri(fullName, nationalId),
      vehicleRegistrationDataUrl: generateMulkiyaSvgDataUri(plate, model, fullName),
      agreedToTerms: true,
    });
    setDriverErrors({});
    success('Sample Driver application with verified documents populated.');
  };

  // ----------------------------------------------------
  // SELLER STEP NAVIGATION & SUBMISSION
  // ----------------------------------------------------
  const handleSellerNext = () => {
    setSellerErrors({});
    if (sellerStep === 1) {
      const res = sellerStep1Schema.safeParse(sellerForm);
      if (!res.success) {
        const errMap: Record<string, string> = {};
        const issues = (res.error as any).issues || (res.error as any).errors || [];
        issues.forEach((err: any) => {
          if (err.path[0]) errMap[err.path[0] as string] = err.message;
        });
        setSellerErrors(errMap);
        return;
      }
      setSellerStep(2);
    } else if (sellerStep === 2) {
      const res = sellerStep2Schema.safeParse(sellerForm);
      if (!res.success) {
        const errMap: Record<string, string> = {};
        const issues = (res.error as any).issues || (res.error as any).errors || [];
        issues.forEach((err: any) => {
          if (err.path[0]) errMap[err.path[0] as string] = err.message;
        });
        setSellerErrors(errMap);
        return;
      }
      setSellerStep(3);
    } else if (sellerStep === 3) {
      const res = sellerStep3Schema.safeParse(sellerForm);
      if (!res.success) {
        const errMap: Record<string, string> = {};
        const issues = (res.error as any).issues || (res.error as any).errors || [];
        issues.forEach((err: any) => {
          if (err.path[0]) errMap[err.path[0] as string] = err.message;
        });
        setSellerErrors(errMap);
        return;
      }
      setSellerStep(4);
    }
  };

  const handleSellerSubmit = async () => {
    if (!sellerForm.agreedToTerms) {
      setSellerErrors({ agreedToTerms: 'Please accept the Merchant Agreement and Terms of Service.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await registerSeller({
        fullName: sellerForm.fullName,
        email: sellerForm.email,
        phone: sellerForm.phone,
        password: sellerForm.password,
        storeName: sellerForm.storeName,
        storeCategory: sellerForm.storeCategory,
        governorate: sellerForm.governorate,
        commercialRegistration: sellerForm.commercialRegistration,
        pickupAddress: sellerForm.pickupAddress,
        pickupLat: sellerForm.pickupLat,
        pickupLng: sellerForm.pickupLng,
        pickupLabel: `${sellerForm.storeName} (${sellerForm.pickupCity})`,
      });

      setSellerCompletedData({
        sellerId: res.sellerId || 'SELLER-ACTIVE',
        storeName: sellerForm.storeName,
        email: sellerForm.email,
      });
      success(`Congratulations! Store "${sellerForm.storeName}" has been successfully activated.`);
    } catch (err: any) {
      error(err.message || 'Seller registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // DRIVER STEP NAVIGATION & SUBMISSION
  // ----------------------------------------------------
  const handleDriverNext = () => {
    setDriverErrors({});
    if (driverStep === 1) {
      const res = driverStep1Schema.safeParse(driverForm);
      if (!res.success) {
        const errMap: Record<string, string> = {};
        const issues = (res.error as any).issues || (res.error as any).errors || [];
        issues.forEach((e: any) => {
          if (e.path[0]) errMap[e.path[0] as string] = e.message;
        });
        setDriverErrors(errMap);
        return;
      }
      setDriverStep(2);
    } else if (driverStep === 2) {
      const res = driverStep2Schema.safeParse(driverForm);
      if (!res.success) {
        const errMap: Record<string, string> = {};
        const issues = (res.error as any).issues || (res.error as any).errors || [];
        issues.forEach((e: any) => {
          if (e.path[0]) errMap[e.path[0] as string] = e.message;
        });
        setDriverErrors(errMap);
        return;
      }
      setDriverStep(3);
    } else if (driverStep === 3) {
      const res = driverStep3Schema.safeParse(driverForm);
      if (!res.success) {
        const errMap: Record<string, string> = {};
        const issues = (res.error as any).issues || (res.error as any).errors || [];
        issues.forEach((e: any) => {
          if (e.path[0]) errMap[e.path[0] as string] = e.message;
        });
        setDriverErrors(errMap);
        return;
      }
      setDriverStep(4);
    }
  };

  const handleDriverSubmit = async () => {
    if (!driverForm.agreedToTerms) {
      setDriverErrors({ agreedToTerms: 'You must certify that your documents and vehicle details are authentic.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await registerDriver({
        fullName: driverForm.fullName,
        email: driverForm.email,
        phone: driverForm.phone,
        password: driverForm.password,
        nationalId: driverForm.nationalId,
        personalPhotoUrl: driverForm.photoDataUrl || generateAvatarSvgDataUri(driverForm.fullName),
        vehicleType: driverForm.vehicleType,
        vehicleModel: driverForm.vehicleModel,
        vehicleColor: driverForm.vehicleColor,
        plateNumber: driverForm.plateNumber,
        driverLicenseUrl: driverForm.licensePhotoDataUrl,
        nationalIdCardUrl: driverForm.nationalIdCardDataUrl,
        vehicleRegistrationUrl: driverForm.vehicleRegistrationDataUrl,
        preferredGovernorate: driverForm.preferredGovernorate,
      });

      const appId = res.applicationId || `APP-DRV-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      setDriverSubmittedData({
        applicationId: appId,
        driverId: res.driverId,
        fullName: driverForm.fullName,
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      success('Driver application completed and submitted for verification!');
    } catch (err: any) {
      error(err.message || 'Driver registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sellerSteps = [
    { id: 1, label: 'Representative' },
    { id: 2, label: 'Store Profile' },
    { id: 3, label: 'Pickup Hub' },
    { id: 4, label: 'Activation' },
  ];

  const driverSteps = [
    { id: 1, label: 'Personal ID' },
    { id: 2, label: 'Vehicle' },
    { id: 3, label: 'Documents' },
    { id: 4, label: 'Certification' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 w-full">
      {/* ---------------------------------------------------- */}
      {/* ROLE SELECTION SCREEN */}
      {/* ---------------------------------------------------- */}
      {!selectedRole && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Hashemite Kingdom of Jordan Delivery Network
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create an Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Select your role to begin your tailored onboarding procedure
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {/* Seller Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedRole('SELLER')}
              className="p-6 rounded-2xl border-2 border-slate-200 hover:border-teal-600 bg-white hover:bg-teal-50/20 transition-all cursor-pointer flex flex-col items-center text-center group shadow-xs hover:shadow-md"
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center group-hover:scale-105 transition-transform mb-4 shadow-xs">
                <Store className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">I am a Seller / Merchant</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Register your store, establish your default pickup hub, and dispatch delivery orders across Amman and all Jordan governorates.
              </p>
              <div className="mt-5 text-xs font-bold text-teal-700 flex items-center gap-1">
                <span>Apply as Seller</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Driver Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedRole('DRIVER')}
              className="p-6 rounded-2xl border-2 border-slate-200 hover:border-amber-600 bg-white hover:bg-amber-50/20 transition-all cursor-pointer flex flex-col items-center text-center group shadow-xs hover:shadow-md"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform mb-4 shadow-xs">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">I am a Courier / Driver</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Earn money fulfilling local delivery requests nearby. Complete vehicle profile, verify driving credentials, and access jobs.
              </p>
              <div className="mt-5 text-xs font-bold text-amber-700 flex items-center gap-1">
                <span>Apply as Driver</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Already registered on the platform?{' '}
              <Link to="/login" className="text-teal-700 font-bold hover:underline">
                Log in to your account
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SELLER ONBOARDING PROCEDURE */}
      {/* ---------------------------------------------------- */}
      {selectedRole === 'SELLER' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs animate-in fade-in duration-200">
          {!sellerCompletedData ? (
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Seller Onboarding Procedure
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800">
                      Step {sellerStep} of 4
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {sellerSteps[sellerStep - 1].label}: Complete your store registration to begin dispatching
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fillDemoSellerData}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition-colors border border-teal-200"
                    title="Populate test seller data"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Fill Demo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole(null);
                      setSellerStep(1);
                    }}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-700 px-2 py-1.5 transition-colors"
                  >
                    Change Role
                  </button>
                </div>
              </div>

              <Stepper steps={sellerSteps} currentStep={sellerStep} className="mb-6" />

              {/* SELLER STEP 1: Representative & Credentials */}
              {sellerStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-2.5">
                    <Briefcase className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <span>
                      Enter the authorized business representative's name and login credentials for store administration.
                    </span>
                  </div>

                  <Input
                    label="Representative Full Name"
                    placeholder="e.g. Omar Nasser"
                    required
                    value={sellerForm.fullName}
                    onChange={(e) =>
                      setSellerForm((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    error={sellerErrors.fullName}
                  />

                  <Input
                    label="Official Business Email"
                    type="email"
                    placeholder="e.g. store@al-madina.jo"
                    required
                    value={sellerForm.email}
                    onChange={(e) =>
                      setSellerForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    error={sellerErrors.email}
                  />

                  <Input
                    label="Jordanian Mobile Number"
                    placeholder="e.g. 0791234567 or +962791234567"
                    required
                    hint="Format: 07XXXXXXXX (Orange, Zain, or Umniah)"
                    value={sellerForm.phone}
                    onChange={(e) =>
                      setSellerForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    error={sellerErrors.phone}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Account Password"
                      type="password"
                      placeholder="Min 8 chars with uppercase & number"
                      required
                      value={sellerForm.password}
                      onChange={(e) =>
                        setSellerForm((prev) => ({ ...prev, password: e.target.value }))
                      }
                      error={sellerErrors.password}
                    />

                    <Input
                      label="Confirm Password"
                      type="password"
                      placeholder="Re-enter password"
                      required
                      value={sellerForm.confirmPassword}
                      onChange={(e) =>
                        setSellerForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      error={sellerErrors.confirmPassword}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSellerNext}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Continue to Store Profile
                    </Button>
                  </div>
                </div>
              )}

              {/* SELLER STEP 2: Store Profile */}
              {sellerStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
                    <Building2 className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                    <span>
                      Define your store branding, primary retail category, and municipal operating zone in Jordan.
                    </span>
                  </div>

                  <Input
                    label="Store / Brand Commercial Name"
                    placeholder="e.g. Al-Madina Electronics & Mobile Accessories"
                    required
                    value={sellerForm.storeName}
                    onChange={(e) =>
                      setSellerForm((prev) => ({ ...prev, storeName: e.target.value }))
                    }
                    error={sellerErrors.storeName}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Business Category"
                      options={STORE_CATEGORIES.map((c) => ({ value: c, label: c }))}
                      value={sellerForm.storeCategory}
                      onChange={(e) =>
                        setSellerForm((prev) => ({ ...prev, storeCategory: e.target.value }))
                      }
                      error={sellerErrors.storeCategory}
                    />

                    <Select
                      label="Primary Governorate (Jordan)"
                      options={JORDAN_GOVERNORATES.map((g) => ({ value: g, label: `${g} Governorate` }))}
                      value={sellerForm.governorate}
                      onChange={(e) =>
                        setSellerForm((prev) => ({ ...prev, governorate: e.target.value }))
                      }
                      error={sellerErrors.governorate}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Commercial Registration / Tax ID (Optional)"
                      placeholder="e.g. CR-JO-2024-99182"
                      hint="Ministry of Industry & Trade registration number"
                      value={sellerForm.commercialRegistration}
                      onChange={(e) =>
                        setSellerForm((prev) => ({
                          ...prev,
                          commercialRegistration: e.target.value,
                        }))
                      }
                      error={sellerErrors.commercialRegistration}
                    />

                    <Input
                      label="Store Support Hotline (Optional)"
                      placeholder="e.g. 065601234 or 0790001111"
                      value={sellerForm.businessPhone}
                      onChange={(e) =>
                        setSellerForm((prev) => ({
                          ...prev,
                          businessPhone: e.target.value,
                        }))
                      }
                      error={sellerErrors.businessPhone}
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setSellerStep(1)}
                      leftIcon={<ArrowLeft className="w-4 h-4" />}
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSellerNext}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Set Pickup Hub
                    </Button>
                  </div>
                </div>
              )}

              {/* SELLER STEP 3: Store Fulfillment Hub */}
              {sellerStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <span>
                      Set your default pickup location where couriers will arrive to collect packages. This automatically populates when you create new delivery orders.
                    </span>
                  </div>

                  <Input
                    label="Store Physical Address / Landmark"
                    placeholder="e.g. Wasfi Al-Tal St. (Gardens), Building 42, Floor 1, Amman"
                    required
                    value={sellerForm.pickupAddress}
                    onChange={(e) =>
                      setSellerForm((prev) => ({
                        ...prev,
                        pickupAddress: e.target.value,
                      }))
                    }
                    error={sellerErrors.pickupAddress}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="City / Municipality Zone"
                      placeholder="e.g. Abdali / Gardens, Amman"
                      required
                      value={sellerForm.pickupCity}
                      onChange={(e) =>
                        setSellerForm((prev) => ({
                          ...prev,
                          pickupCity: e.target.value,
                        }))
                      }
                      error={sellerErrors.pickupCity}
                    />

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Preset Hub Location
                      </label>
                      <select
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                        onChange={(e) => {
                          const area = JORDAN_PRESET_AREAS[e.target.value];
                          if (area) {
                            setSellerForm((prev) => ({
                              ...prev,
                              pickupCity: area.label,
                              pickupLat: area.lat,
                              pickupLng: area.lng,
                              pickupAddress: prev.pickupAddress || `${area.label}, ${area.governorate}`,
                            }));
                          }
                        }}
                      >
                        <option value="">Choose preset municipal hub...</option>
                        {Object.entries(JORDAN_PRESET_AREAS).map(([key, loc]) => (
                          <option key={key} value={key}>
                            {loc.label} ({loc.governorate})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Coordinates Preview */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block">Dispatch Coordinates:</span>
                      <span className="font-mono text-slate-600">
                        {sellerForm.pickupLat.toFixed(4)}° N, {sellerForm.pickupLng.toFixed(4)}° E
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-200">
                      <Check className="w-3 h-3" />
                      Auto-Linked to Orders
                    </span>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setSellerStep(2)}
                      leftIcon={<ArrowLeft className="w-4 h-4" />}
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSellerNext}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Review & Activate
                    </Button>
                  </div>
                </div>
              )}

              {/* SELLER STEP 4: Activation & Review */}
              {sellerStep === 4 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <h3 className="text-sm font-bold text-slate-900">
                    Review Merchant Information
                  </h3>

                  {/* Summary Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">
                        Store Branding & Category:
                      </span>
                      <p className="text-slate-800 text-sm font-bold">
                        {sellerForm.storeName}
                      </p>
                      <p className="text-slate-500">
                        {sellerForm.storeCategory} · {sellerForm.governorate} Governorate
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-700 block mb-1">
                        Store Representative:
                      </span>
                      <p className="text-slate-700">
                        <strong>{sellerForm.fullName}</strong> · {sellerForm.email} · {sellerForm.phone}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-700 block mb-1">
                        Default Fulfillment & Pickup Location:
                      </span>
                      <p className="text-slate-700">
                        {sellerForm.pickupAddress}
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        {sellerForm.pickupCity} ({sellerForm.pickupLat.toFixed(4)}° N, {sellerForm.pickupLng.toFixed(4)}° E)
                      </p>
                    </div>
                  </div>

                  {/* Merchant Terms */}
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sellerForm.agreedToTerms}
                      onChange={(e) =>
                        setSellerForm((prev) => ({
                          ...prev,
                          agreedToTerms: e.target.checked,
                        }))
                      }
                      className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                    />
                    <span className="text-xs text-slate-700 leading-snug">
                      I accept the <strong>Smart Delivery Platform Merchant Terms of Service</strong>, ensuring goods packed for courier transit comply with Jordanian postal and transport safety standards.
                    </span>
                  </label>
                  {sellerErrors.agreedToTerms && (
                    <p className="text-xs font-medium text-rose-600">
                      {sellerErrors.agreedToTerms}
                    </p>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setSellerStep(3)}
                      leftIcon={<ArrowLeft className="w-4 h-4" />}
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSellerSubmit}
                      loading={isSubmitting}
                      rightIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Activate Seller Account
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* SELLER COMPLETED SUCCESS SCREEN */
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Seller Account Activated!
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Your store is now fully registered on the Smart Delivery network
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-left text-xs text-emerald-950 space-y-2">
                <div className="flex items-center justify-between font-bold border-b border-emerald-200/80 pb-2">
                  <span>Store Name:</span>
                  <span className="text-emerald-900 font-extrabold">{sellerCompletedData.storeName}</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-emerald-800">Merchant Reference:</span>
                  <span className="font-bold">{sellerCompletedData.sellerId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-800">Login ID:</span>
                  <span className="font-semibold">{sellerCompletedData.email}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-emerald-800">Account Status:</span>
                  <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
                    ACTIVE & READY
                  </span>
                </div>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/seller/create')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Create First Delivery Request
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate('/seller')}
                >
                  Go to Seller Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DRIVER APPLICATION PROCEDURE */}
      {/* ---------------------------------------------------- */}
      {selectedRole === 'DRIVER' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs animate-in fade-in duration-200">
          {!driverSubmittedData ? (
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Driver Application Procedure
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                      Step {driverStep} of 4
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {driverSteps[driverStep - 1].label}: Complete background & vehicle registration for Jordan
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fillDemoDriverData}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg transition-colors border border-amber-200"
                    title="Populate complete test driver data"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Fill Demo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole(null);
                      setDriverStep(1);
                    }}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-700 px-2 py-1.5 transition-colors"
                  >
                    Change Role
                  </button>
                </div>
              </div>

              <Stepper steps={driverSteps} currentStep={driverStep} className="mb-6" />

              {/* DRIVER STEP 1: Personal & Identification */}
              {driverStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      Provide your legal name matching your Jordanian Civil Status ID (الرقم الوطني) and active contact number.
                    </span>
                  </div>

                  <Input
                    label="Full Legal Name"
                    placeholder="e.g. Tariq Al-Majali"
                    required
                    value={driverForm.fullName}
                    onChange={(e) =>
                      setDriverForm((p) => ({ ...p, fullName: e.target.value }))
                    }
                    error={driverErrors.fullName}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="e.g. tariq@domain.jo"
                      required
                      value={driverForm.email}
                      onChange={(e) =>
                        setDriverForm((p) => ({ ...p, email: e.target.value }))
                      }
                      error={driverErrors.email}
                    />

                    <Input
                      label="Jordanian Mobile Number"
                      placeholder="e.g. 0791234567"
                      required
                      hint="10 digits Jordan mobile"
                      value={driverForm.phone}
                      onChange={(e) =>
                        setDriverForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      error={driverErrors.phone}
                    />
                  </div>

                  <Input
                    label="Jordanian National ID Number (الرقم الوطني)"
                    placeholder="e.g. 9941029481 (10 digits)"
                    required
                    hint="Civil Status & Passports Department 10-digit National ID"
                    value={driverForm.nationalId}
                    onChange={(e) =>
                      setDriverForm((p) => ({ ...p, nationalId: e.target.value }))
                    }
                    error={driverErrors.nationalId}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Password"
                      type="password"
                      placeholder="Min 8 chars, 1 uppercase, 1 digit"
                      required
                      value={driverForm.password}
                      onChange={(e) =>
                        setDriverForm((p) => ({ ...p, password: e.target.value }))
                      }
                      error={driverErrors.password}
                    />

                    <Input
                      label="Confirm Password"
                      type="password"
                      placeholder="Re-enter password"
                      required
                      value={driverForm.confirmPassword}
                      onChange={(e) =>
                        setDriverForm((p) => ({
                          ...p,
                          confirmPassword: e.target.value,
                        }))
                      }
                      error={driverErrors.confirmPassword}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleDriverNext}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Continue to Vehicle Details
                    </Button>
                  </div>
                </div>
              )}

              {/* DRIVER STEP 2: Vehicle Particulars & Operational Zone */}
              {driverStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
                    <Car className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                    <span>
                      Select the vehicle you will operate for platform deliveries and your primary operating governorate in Jordan.
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Vehicle Category <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {VEHICLE_TYPES.map((v) => {
                        const isSelected = driverForm.vehicleType === v.value;
                        return (
                          <button
                            key={v.value}
                            type="button"
                            onClick={() =>
                              setDriverForm((p) => ({ ...p, vehicleType: v.value }))
                            }
                            className={`p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? 'border-amber-600 bg-amber-50/70 text-amber-950 font-bold shadow-xs'
                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className="block text-xs font-bold">{v.label}</span>
                            <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                              {v.capacityDescription}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Vehicle Make & Model"
                      placeholder="e.g. Toyota Prius 2022"
                      required
                      value={driverForm.vehicleModel}
                      onChange={(e) =>
                        setDriverForm((p) => ({ ...p, vehicleModel: e.target.value }))
                      }
                      error={driverErrors.vehicleModel}
                    />

                    <Input
                      label="Vehicle Exterior Colour"
                      placeholder="e.g. Silver Metallic"
                      required
                      value={driverForm.vehicleColor}
                      onChange={(e) =>
                        setDriverForm((p) => ({ ...p, vehicleColor: e.target.value }))
                      }
                      error={driverErrors.vehicleColor}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Jordanian Plate Number"
                      placeholder="e.g. 50-84920"
                      required
                      hint="Jordan Traffic Dept format (e.g. 50-12345)"
                      value={driverForm.plateNumber}
                      onChange={(e) =>
                        setDriverForm((p) => ({ ...p, plateNumber: e.target.value }))
                      }
                      error={driverErrors.plateNumber}
                    />

                    <Select
                      label="Preferred Operating Governorate"
                      options={JORDAN_GOVERNORATES.map((g) => ({
                        value: g,
                        label: `${g} Governorate`,
                      }))}
                      value={driverForm.preferredGovernorate}
                      onChange={(e) =>
                        setDriverForm((p) => ({
                          ...p,
                          preferredGovernorate: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setDriverStep(1)}
                      leftIcon={<ArrowLeft className="w-4 h-4" />}
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleDriverNext}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Verification Documents
                    </Button>
                  </div>
                </div>
              )}

              {/* DRIVER STEP 3: Verification Documents Package */}
              {driverStep === 3 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-2.5">
                    <FileCheck2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <span>
                      Upload official documents for administrative safety audit. You can upload scanned photos or use the sample generators for instant testing.
                    </span>
                  </div>

                  {/* Document 1: Driving Licence (Required) */}
                  <div className="space-y-2 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          1. Jordanian Driving Licence <span className="text-rose-500">*</span>
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Legible front copy displaying licence category & expiry date
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const uri = generateDrivingLicenceSvgDataUri(
                            driverForm.fullName || 'Tariq Al-Majali',
                            driverForm.plateNumber || '50-84920'
                          );
                          setDriverForm((p) => ({ ...p, licensePhotoDataUrl: uri }));
                          success('Sample Jordanian Driver Licence generated.');
                        }}
                        className="text-[11px] font-bold text-teal-700 hover:text-teal-800 bg-white hover:bg-teal-50 border border-teal-200 px-2.5 py-1 rounded transition-colors"
                      >
                        Load Sample Licence
                      </button>
                    </div>

                    <FileDrop
                      label="Driver's Licence Upload"
                      required
                      hint="Upload JPG/PNG or generate sample"
                      value={driverForm.licensePhotoDataUrl}
                      onChange={(val) =>
                        setDriverForm((p) => ({
                          ...p,
                          licensePhotoDataUrl: val,
                        }))
                      }
                      onRemove={() =>
                        setDriverForm((p) => ({ ...p, licensePhotoDataUrl: '' }))
                      }
                      error={driverErrors.licensePhotoDataUrl}
                    />
                  </div>

                  {/* Document 2: National ID (Optional / Recommended) */}
                  <div className="space-y-2 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          2. Civil Status National ID Card (بطاقة الأحوال المدنية)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Matches 10-digit National ID {driverForm.nationalId && `(${driverForm.nationalId})`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const uri = generateNationalIdSvgDataUri(
                            driverForm.fullName || 'Tariq Al-Majali',
                            driverForm.nationalId || '9941029481'
                          );
                          setDriverForm((p) => ({ ...p, nationalIdCardDataUrl: uri }));
                          success('Sample Jordanian National ID card generated.');
                        }}
                        className="text-[11px] font-bold text-teal-700 hover:text-teal-800 bg-white hover:bg-teal-50 border border-teal-200 px-2.5 py-1 rounded transition-colors"
                      >
                        Load Sample Civil ID
                      </button>
                    </div>

                    <FileDrop
                      label="National ID Card Document"
                      hint="Upload JPG/PNG or generate sample"
                      value={driverForm.nationalIdCardDataUrl}
                      onChange={(val) =>
                        setDriverForm((p) => ({
                          ...p,
                          nationalIdCardDataUrl: val,
                        }))
                      }
                      onRemove={() =>
                        setDriverForm((p) => ({ ...p, nationalIdCardDataUrl: '' }))
                      }
                    />
                  </div>

                  {/* Document 3: Vehicle Registration (Mulkiya) */}
                  <div className="space-y-2 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          3. Vehicle Registration Card (الملكية)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Traffic Dept registration confirming vehicle plate & model
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const uri = generateMulkiyaSvgDataUri(
                            driverForm.plateNumber || '50-84920',
                            driverForm.vehicleModel || 'Toyota Prius 2022',
                            driverForm.fullName || 'Tariq Al-Majali'
                          );
                          setDriverForm((p) => ({ ...p, vehicleRegistrationDataUrl: uri }));
                          success('Sample Vehicle Registration (Mulkiya) generated.');
                        }}
                        className="text-[11px] font-bold text-teal-700 hover:text-teal-800 bg-white hover:bg-teal-50 border border-teal-200 px-2.5 py-1 rounded transition-colors"
                      >
                        Load Sample Mulkiya
                      </button>
                    </div>

                    <FileDrop
                      label="Vehicle Registration Card"
                      hint="Upload JPG/PNG or generate sample"
                      value={driverForm.vehicleRegistrationDataUrl}
                      onChange={(val) =>
                        setDriverForm((p) => ({
                          ...p,
                          vehicleRegistrationDataUrl: val,
                        }))
                      }
                      onRemove={() =>
                        setDriverForm((p) => ({ ...p, vehicleRegistrationDataUrl: '' }))
                      }
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setDriverStep(2)}
                      leftIcon={<ArrowLeft className="w-4 h-4" />}
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleDriverNext}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Review & Certification
                    </Button>
                  </div>
                </div>
              )}

              {/* DRIVER STEP 4: Review & Certification */}
              {driverStep === 4 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <h3 className="text-sm font-bold text-slate-900">
                    Review Driver Application Package
                  </h3>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">
                        Driver Identification:
                      </span>
                      <p className="text-slate-800 font-bold">
                        {driverForm.fullName}
                      </p>
                      <p className="text-slate-600">
                        {driverForm.email} · {driverForm.phone}
                      </p>
                      <p className="text-slate-500 font-mono mt-0.5">
                        National ID: {driverForm.nationalId}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-700 block mb-1">
                        Vehicle & Operational Coverage:
                      </span>
                      <p className="text-slate-700">
                        <strong>{driverForm.vehicleType}</strong>: {driverForm.vehicleModel} ({driverForm.vehicleColor})
                      </p>
                      <p className="text-slate-500 mt-0.5 font-mono">
                        Plate: <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{driverForm.plateNumber}</span> · Preferred Zone: {driverForm.preferredGovernorate}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-700 block mb-1">
                        Attached Documents Verification:
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold ${
                          driverForm.licensePhotoDataUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          <Check className="w-3 h-3" />
                          Driving Licence
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold ${
                          driverForm.nationalIdCardDataUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          <Check className="w-3 h-3" />
                          National ID Card
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold ${
                          driverForm.vehicleRegistrationDataUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          <Check className="w-3 h-3" />
                          Vehicle Mulkiya
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Legal Declaration Checkbox */}
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={driverForm.agreedToTerms}
                      onChange={(e) =>
                        setDriverForm((p) => ({
                          ...p,
                          agreedToTerms: e.target.checked,
                        }))
                      }
                      className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                    />
                    <span className="text-xs text-slate-700 leading-snug">
                      I certify under penalty of account forfeiture that all submitted credentials, identification numbers, and vehicle certificates are authentic, unexpired, and strictly belong to me.
                    </span>
                  </label>
                  {driverErrors.agreedToTerms && (
                    <p className="text-xs font-medium text-rose-600">
                      {driverErrors.agreedToTerms}
                    </p>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setDriverStep(3)}
                      leftIcon={<ArrowLeft className="w-4 h-4" />}
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleDriverSubmit}
                      loading={isSubmitting}
                      rightIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Submit Driver Application
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* DRIVER COMPLETED SUCCESS SCREEN */
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
                <Clock className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Application Completed & Submitted
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Your credentials have entered the administrative safety audit queue
                </p>
              </div>

              {/* Status Tracking Card */}
              <div className="max-w-md mx-auto p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-left text-xs text-amber-950 space-y-3">
                <div className="flex items-center justify-between font-bold border-b border-amber-200/80 pb-2">
                  <span>Tracking Reference ID:</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300 font-bold text-slate-900">
                    {driverSubmittedData.applicationId}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-amber-800">Applicant Name:</span>
                  <span className="font-semibold text-slate-900">{driverSubmittedData.fullName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-amber-800">Current Status:</span>
                  <span className="bg-amber-200/90 text-amber-900 px-2 py-0.5 rounded font-bold">
                    PENDING AUDIT
                  </span>
                </div>

                {/* Audit Pipeline Stages */}
                <div className="pt-2 border-t border-amber-200/80 space-y-2">
                  <span className="font-bold text-slate-800 block text-[11px]">
                    Verification Pipeline:
                  </span>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>1. Application Package Received ({driverSubmittedData.submittedAt})</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-800 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                      <span>2. Administrator Reviewing Driving Licence & Mulkiya</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                      <span>3. Platform Safety Approval & Activation</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for easy end-to-end evaluation */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/admin/drivers">
                  <Button
                    variant="primary"
                    size="md"
                    rightIcon={<ExternalLink className="w-4 h-4" />}
                  >
                    Open Admin Verification Panel
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="md">
                    Proceed to Driver Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
