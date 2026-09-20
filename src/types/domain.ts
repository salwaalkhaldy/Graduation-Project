export type Role = 'SELLER' | 'DRIVER' | 'ADMIN';
export type UserRole = Role;

export type DriverStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PENDING_APPROVAL';

export type DeliveryStatus = 'AVAILABLE' | 'ACCEPTED' | 'PICKED_UP' | 'ON_THE_WAY' | 'DELIVERED';

export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'VAN' | 'BICYCLE';

export interface User {
  userId: string;
  fullName: string;
  email: string;
  passwordHash: string; // DEMO ONLY: a real backend must use bcrypt/argon2. Never hash on client in production.
  phoneNumber: string;
  phone?: string;
  role: Role;
  createdAt: string;
}

export interface Seller {
  sellerId: string;
  userId: string;
  storeName?: string;
  storeCategory?: string;
  governorate?: string;
  commercialRegistration?: string;
  phone?: string;
  pickupAddress?: string;
  pickupPoint?: GeoPoint;
}

export interface Driver {
  driverId: string;
  userId: string;
  nationalIdNumber: string;
  personalPhotoUrl: string;
  accountStatus: DriverStatus;
  rejectionReason?: string;
  reviewedAt?: string;
  applicationId?: string;
  preferredGovernorate?: string;
}

export interface Vehicle {
  vehicleId: string;
  driverId: string;
  vehicleType: VehicleType;
  model: string;
  colour: string;
  plateNumber: string;
  manufacturingYear?: string;
}

export interface DriverDocument {
  documentId: string;
  driverId: string;
  documentType: 'LICENCE' | 'NATIONAL_ID' | 'VEHICLE_REGISTRATION';
  fileUrl: string;
  uploadedAt: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  label: string;
}

export interface DeliveryRequest {
  id?: string;
  requestId: string;
  referenceNo: string; // e.g. "SDP-1042"
  sellerId: string;
  driverId?: string; // driverId set on acceptance
  productName: string;
  productDescription: string;
  productImageUrl?: string;
  pickup: GeoPoint;
  delivery: GeoPoint;
  recipientName: string; // Section 2.3 addition
  recipientPhone: string; // Section 2.3 addition
  offeredFeeJod: number; // Section 2.3 addition (display only)
  status: DeliveryStatus;
  createdAt: string;
  updatedAt: string;
  statusHistory: { status: DeliveryStatus; at: string }[];
}

export interface RouteDetails {
  distanceKm: number;
  durationMin: number;
}

export interface DriverProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  nationalId: string;
  vehicleType: VehicleType;
  vehicleModel: string;
  vehicleColor: string;
  plateNumber: string;
  driverLicenseUrl?: string;
  nationalIdCardUrl?: string;
  vehicleRegistrationUrl?: string;
  personalPhotoUrl?: string;
  preferredGovernorate?: string;
  applicationId?: string;
  status: DriverStatus;
  rejectionReason?: string;
  createdAt: string;
}

export type ApiErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'ACCOUNT_NOT_APPROVED';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, string>;
}

export interface AuthSession {
  token: string;
  user: User;
  role: Role;
  driverStatus?: DriverStatus;
  sellerId?: string;
  driverId?: string;
}

export interface DriverWithDetails extends Driver {
  user: User;
  vehicle: Vehicle;
  documents: DriverDocument[];
}

export interface DeliveryRequestWithDetails extends DeliveryRequest {
  seller?: {
    sellerId: string;
    fullName: string;
    phoneNumber: string;
    email: string;
  };
  driver?: {
    driverId: string;
    fullName: string;
    phoneNumber: string;
    personalPhotoUrl: string;
    vehicle: Vehicle;
  };
}

export interface AdminStats {
  totalDrivers: number;
  pendingDrivers: number;
  approvedDrivers: number;
  rejectedDrivers: number;
  totalSellers: number;
  totalRequests: number;
  requestsByStatus: Record<DeliveryStatus, number>;
  availableRequests?: number;
  inTransitRequests?: number;
  deliveredRequests?: number;
}
