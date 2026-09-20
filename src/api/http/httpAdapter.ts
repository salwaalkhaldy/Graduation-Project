import { API_BASE_URL } from '../../config/env';
import {
  AdminStats,
  AuthSession,
  DeliveryRequest,
  DeliveryRequestWithDetails,
  DeliveryStatus,
  DriverProfile,
  DriverStatus,
  DriverWithDetails,
  User,
} from '../../types/domain';
import {
  ApiClientContract,
  CreateDeliveryRequestDto,
  ListDriversQuery,
  LoginDto,
  NearbyRequestItem,
  NearbyRequestsQuery,
  RegisterDriverDto,
  RegisterSellerDto,
  RejectDriverDto,
  UpdateDeliveryStatusDto,
  UpdateSellerProfileDto,
} from '../contracts';
import { getStoredSessionToken, MockApiException } from '../mock/db';

/**
 * Production-ready HTTP Client hitting Java Spring Boot REST API
 */
export class HttpAdapter implements ApiClientContract {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = getStoredSessionToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch {
        // non-json response
      }

      const code =
        errorBody?.code ||
        (response.status === 401
          ? 'UNAUTHENTICATED'
          : response.status === 403
          ? 'FORBIDDEN'
          : response.status === 404
          ? 'NOT_FOUND'
          : response.status === 409
          ? 'CONFLICT'
          : 'VALIDATION_ERROR');

      const message =
        errorBody?.message ||
        (response.status === 401
          ? 'Session expired or unauthenticated.'
          : response.status === 403
          ? 'Access forbidden.'
          : 'An unexpected server error occurred.');

      throw new MockApiException(code, message, errorBody?.details);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async registerSeller(dto: RegisterSellerDto): Promise<AuthSession> {
    return this.request<AuthSession>('/auth/register/seller', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async registerDriver(
    dto: RegisterDriverDto
  ): Promise<{
    message: string;
    status: DriverStatus;
    driverId?: string;
    applicationId?: string;
    token?: string;
    user?: User;
  }> {
    return this.request<{
      message: string;
      status: DriverStatus;
      driverId?: string;
      applicationId?: string;
      token?: string;
      user?: User;
    }>('/auth/register/driver', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async login(dto: LoginDto): Promise<AuthSession> {
    return this.request<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout', { method: 'POST' });
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async createDeliveryRequest(
    dto: CreateDeliveryRequestDto
  ): Promise<DeliveryRequest> {
    return this.request<DeliveryRequest>('/seller/requests', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async getSellerRequests(): Promise<DeliveryRequest[]> {
    return this.request<DeliveryRequest[]>('/seller/requests');
  }

  async getSellerRequestById(
    requestId: string
  ): Promise<DeliveryRequestWithDetails> {
    return this.request<DeliveryRequestWithDetails>(`/seller/requests/${requestId}`);
  }

  async getSellerProfile(): Promise<{ user: User; sellerId: string }> {
    return this.request<{ user: User; sellerId: string }>('/seller/profile');
  }

  async updateSellerProfile(dto: UpdateSellerProfileDto): Promise<User> {
    return this.request<User>('/seller/profile', {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  }

  async getNearbyRequests(
    queryOrPoint: NearbyRequestsQuery | { lat: number; lng: number },
    radiusKm?: number
  ): Promise<NearbyRequestItem[]> {
    const lat = queryOrPoint.lat;
    const lng = queryOrPoint.lng;
    const radius = ('radiusKm' in queryOrPoint ? (queryOrPoint as any).radiusKm : radiusKm) || 10;
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radiusKm: radius.toString(),
    });
    return this.request<NearbyRequestItem[]>(`/driver/requests/nearby?${params}`);
  }

  async getDriverRequestById(
    requestId: string,
    driverLat?: number,
    driverLng?: number
  ): Promise<NearbyRequestItem & DeliveryRequestWithDetails> {
    const params = new URLSearchParams();
    if (driverLat !== undefined) params.append('lat', driverLat.toString());
    if (driverLng !== undefined) params.append('lng', driverLng.toString());
    const q = params.toString() ? `?${params.toString()}` : '';
    return this.request<NearbyRequestItem & DeliveryRequestWithDetails>(
      `/driver/requests/${requestId}${q}`
    );
  }

  async acceptDeliveryRequest(requestId: string): Promise<DeliveryRequest> {
    return this.request<DeliveryRequest>(`/driver/requests/${requestId}/accept`, {
      method: 'POST',
    });
  }

  async getActiveDelivery(): Promise<(DeliveryRequestWithDetails & {
    leg1DistanceKm: number;
    leg1DurationMin: number;
    leg2DistanceKm: number;
    leg2DurationMin: number;
    totalDistanceKm: number;
    totalDurationMin: number;
  }) | null> {
    return this.request('/driver/deliveries/active');
  }

  async updateDeliveryStatus(
    dtoOrId: UpdateDeliveryStatusDto | string,
    status?: DeliveryStatus
  ): Promise<DeliveryRequest> {
    const payload = typeof dtoOrId === 'string' ? { status } : dtoOrId;
    return this.request<DeliveryRequest>('/driver/deliveries/active/status', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async getDriverProfile(): Promise<DriverWithDetails> {
    return this.request<DriverWithDetails>('/driver/profile');
  }

  async getAdminStats(): Promise<AdminStats> {
    return this.request<AdminStats>('/admin/stats');
  }

  async getAdminDrivers(query?: ListDriversQuery): Promise<DriverWithDetails[]> {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.q) params.append('q', query.q);
    const q = params.toString() ? `?${params.toString()}` : '';
    return this.request<DriverWithDetails[]>(`/admin/drivers${q}`);
  }

  async getAdminDriverById(driverId: string): Promise<DriverWithDetails> {
    return this.request<DriverWithDetails>(`/admin/drivers/${driverId}`);
  }

  async approveDriver(driverId: string): Promise<DriverWithDetails> {
    return this.request<DriverWithDetails>(`/admin/drivers/${driverId}/approve`, {
      method: 'POST',
    });
  }

  async rejectDriver(
    driverId: string,
    dto: RejectDriverDto | string
  ): Promise<DriverWithDetails> {
    const payload = typeof dto === 'string' ? { reason: dto } : dto;
    return this.request<DriverWithDetails>(`/admin/drivers/${driverId}/reject`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Compatibility & convenience aliases
  async getDeliveryRequest(requestId: string): Promise<DeliveryRequestWithDetails> {
    return this.getSellerRequestById(requestId);
  }

  async getDriverDetails(driverId: string): Promise<DriverWithDetails> {
    return this.getAdminDriverById(driverId);
  }

  async getDriversList(
    status?: DriverStatus | string,
    query?: string,
    page?: number,
    limit?: number
  ): Promise<{
    drivers: DriverProfile[];
    counts: { total: number; pending: number; approved: number; rejected: number };
  }> {
    const driversWithDetails = await this.getAdminDrivers({
      status: status && status !== 'ALL' ? (status as DriverStatus) : undefined,
      q: query,
    });
    const drivers: DriverProfile[] = driversWithDetails.map((drv) => ({
      id: drv.driverId,
      userId: drv.userId,
      fullName: drv.user.fullName,
      email: drv.user.email,
      phone: drv.user.phoneNumber,
      nationalId: drv.nationalIdNumber,
      vehicleType: drv.vehicle.vehicleType,
      vehicleModel: drv.vehicle.model,
      vehicleColor: drv.vehicle.colour,
      plateNumber: drv.vehicle.plateNumber,
      personalPhotoUrl: drv.personalPhotoUrl,
      status: drv.accountStatus,
      createdAt: drv.user.createdAt,
    }));
    return {
      drivers,
      counts: {
        total: drivers.length,
        pending: drivers.filter((d) => d.status === 'PENDING_APPROVAL').length,
        approved: drivers.filter((d) => d.status === 'APPROVED').length,
        rejected: drivers.filter((d) => d.status === 'REJECTED').length,
      },
    };
  }

  async getDriverActiveDelivery(): Promise<any> {
    return this.getActiveDelivery();
  }
}
