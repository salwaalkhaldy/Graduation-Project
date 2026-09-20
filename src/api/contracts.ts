import {
  AdminStats,
  AuthSession,
  DeliveryRequest,
  DeliveryRequestWithDetails,
  DeliveryStatus,
  DriverProfile,
  DriverStatus,
  DriverWithDetails,
  Role,
  User,
  VehicleType,
} from '../types/domain';

export type { AdminStats };

export interface RegisterSellerDto {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  phone?: string;
  storeName?: string;
  storeCategory?: string;
  governorate?: string;
  commercialRegistration?: string;
  pickupAddress?: string;
  pickupLat?: number;
  pickupLng?: number;
  pickupLabel?: string;
}

export interface RegisterDriverDto {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  phone?: string;
  nationalIdNumber?: string;
  nationalId?: string;
  personalPhotoUrl?: string;
  vehicleType: VehicleType;
  model?: string;
  vehicleModel?: string;
  colour?: string;
  vehicleColor?: string;
  plateNumber: string;
  licencePhotoUrl?: string;
  driverLicenseUrl?: string;
  nationalIdCardUrl?: string;
  vehicleRegistrationUrl?: string;
  preferredGovernorate?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateDeliveryRequestDto {
  productName: string;
  productDescription: string;
  productImageUrl?: string;
  pickup: {
    lat: number;
    lng: number;
    label: string;
  };
  delivery: {
    lat: number;
    lng: number;
    label: string;
  };
  recipientName: string;
  recipientPhone: string;
  offeredFeeJod: number;
}

export interface UpdateSellerProfileDto {
  fullName?: string;
  phoneNumber?: string;
}

export interface UpdateDeliveryStatusDto {
  status: DeliveryStatus;
}

export interface RejectDriverDto {
  reason: string;
}

export interface NearbyRequestsQuery {
  lat: number;
  lng: number;
  radiusKm: number;
}

export interface NearbyRequestItem extends DeliveryRequest {
  distanceToPickupKm: number;
  durationToPickupMin: number;
  pickupToDeliveryKm: number;
  pickupToDeliveryDurationMin: number;
  totalDistanceKm: number;
  totalDurationMin: number;
}

export interface ListDriversQuery {
  status?: DriverStatus;
  q?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * The REST Client Contract that both MockAdapter and HttpAdapter must implement.
 */
export interface ApiClientContract {
  // Auth
  registerSeller(dto: RegisterSellerDto): Promise<AuthSession>;
  registerDriver(
    dto: RegisterDriverDto
  ): Promise<{
    message: string;
    status: DriverStatus;
    driverId?: string;
    applicationId?: string;
    token?: string;
    user?: User;
  }>;
  login(dto: LoginDto): Promise<AuthSession>;
  logout(): Promise<void>;
  getMe(): Promise<User>;

  // Seller
  createDeliveryRequest(dto: CreateDeliveryRequestDto): Promise<DeliveryRequest>;
  getSellerRequests(): Promise<DeliveryRequest[]>;
  getSellerRequestById(requestId: string): Promise<DeliveryRequestWithDetails>;
  getSellerProfile(): Promise<{ user: User; sellerId: string }>;
  updateSellerProfile(dto: UpdateSellerProfileDto): Promise<User>;

  // Driver
  getNearbyRequests(
    queryOrPoint: NearbyRequestsQuery | { lat: number; lng: number },
    radiusKm?: number
  ): Promise<NearbyRequestItem[]>;
  getDriverRequestById(requestId: string, driverLat?: number, driverLng?: number): Promise<NearbyRequestItem & DeliveryRequestWithDetails>;
  acceptDeliveryRequest(requestId: string): Promise<DeliveryRequest>;
  getActiveDelivery(): Promise<(DeliveryRequestWithDetails & { leg1DistanceKm: number; leg1DurationMin: number; leg2DistanceKm: number; leg2DurationMin: number; totalDistanceKm: number; totalDurationMin: number }) | null>;
  updateDeliveryStatus(
    dtoOrId: UpdateDeliveryStatusDto | string,
    status?: DeliveryStatus
  ): Promise<DeliveryRequest>;
  getDriverProfile(): Promise<DriverWithDetails>;

  // Admin
  getAdminStats(): Promise<AdminStats>;
  getAdminDrivers(query?: ListDriversQuery): Promise<DriverWithDetails[]>;
  getAdminDriverById(driverId: string): Promise<DriverWithDetails>;
  // Compatibility & convenience aliases
  getDeliveryRequest(requestId: string): Promise<DeliveryRequestWithDetails>;
  getDriverDetails(driverId: string): Promise<DriverWithDetails>;
  getDriversList(
    status?: DriverStatus | string,
    query?: string,
    page?: number,
    limit?: number
  ): Promise<{
    drivers: DriverProfile[];
    counts: { total: number; pending: number; approved: number; rejected: number };
  }>;
  getDriverActiveDelivery(): Promise<(DeliveryRequestWithDetails & { leg1DistanceKm: number; leg1DurationMin: number; leg2DistanceKm: number; leg2DurationMin: number; totalDistanceKm: number; totalDurationMin: number }) | null>;
  approveDriver(driverId: string): Promise<DriverWithDetails>;
  rejectDriver(driverId: string, dto: RejectDriverDto | string): Promise<DriverWithDetails>;
}
