import {
  calculateHaversineDistanceKm,
  calculateRoadDistanceKm,
  calculateTravelTimeMin,
} from '../../services/maps/geo';
import {
  AdminStats,
  AuthSession,
  DeliveryRequest,
  DeliveryRequestWithDetails,
  DeliveryStatus,
  Driver,
  DriverDocument,
  DriverProfile,
  DriverStatus,
  DriverWithDetails,
  User,
  Vehicle,
} from '../../types/domain';
import { generateAvatarSvgDataUri } from '../../utils/image';
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
import {
  getStoredSessionToken,
  loadDatabase,
  MockApiException,
  saveDatabase,
  setStoredSessionToken,
} from './db';
import { simulateLatency } from './latency';
import { demoHashPassword } from './seed';

export class MockAdapter implements ApiClientContract {
  // Helper to extract currently authenticated user from token
  private getCurrentUserOrThrow(): { user: User; session: AuthSession } {
    const token = getStoredSessionToken();
    if (!token) {
      throw new MockApiException('UNAUTHENTICATED', 'No active session found. Please log in.');
    }

    const db = loadDatabase();
    // Token format: mock_token_{userId}_{timestamp}
    const parts = token.split('_');
    const userId = parts.length >= 3 ? `${parts[1]}_${parts[2]}` : token;
    const user = db.users.find((u) => u.userId === userId || token.includes(u.userId));

    if (!user) {
      setStoredSessionToken(null);
      throw new MockApiException('UNAUTHENTICATED', 'Session expired. Please log in again.');
    }

    const seller = db.sellers.find((s) => s.userId === user.userId);
    const driver = db.drivers.find((d) => d.userId === user.userId);

    const session: AuthSession = {
      token,
      user,
      role: user.role,
      driverStatus: driver?.accountStatus,
      sellerId: seller?.sellerId,
      driverId: driver?.driverId,
    };

    return { user, session };
  }

  // --- Auth Endpoints ---

  async registerSeller(dto: RegisterSellerDto): Promise<AuthSession> {
    await simulateLatency();
    const db = loadDatabase();

    const existing = db.users.find(
      (u) => u.email.toLowerCase() === dto.email.trim().toLowerCase()
    );
    if (existing) {
      throw new MockApiException(
        'CONFLICT',
        'An account with this email address already exists.'
      );
    }

    const userId = `usr_seller_${Date.now()}`;
    const sellerId = `seller_${Date.now()}`;
    const sellerPhone = (dto.phoneNumber || dto.phone || '').trim();
    const newUser: User = {
      userId,
      fullName: dto.fullName.trim(),
      email: dto.email.trim().toLowerCase(),
      phoneNumber: sellerPhone,
      phone: sellerPhone,
      passwordHash: demoHashPassword(dto.password),
      role: 'SELLER',
      createdAt: new Date().toISOString(),
    };

    const storeName = (dto.storeName || `${dto.fullName}'s Store`).trim();
    const storeCategory = (dto.storeCategory || 'General Retail').trim();
    const governorate = (dto.governorate || 'Amman').trim();
    const commercialRegistration = (dto.commercialRegistration || '').trim();
    const pickupAddress = (dto.pickupAddress || '').trim();
    const pickupPoint = (dto.pickupLat && dto.pickupLng) ? {
      lat: dto.pickupLat,
      lng: dto.pickupLng,
      label: dto.pickupLabel || pickupAddress || `${storeName} Hub`,
    } : undefined;

    db.users.push(newUser);
    db.sellers.push({
      sellerId,
      userId,
      storeName,
      storeCategory,
      governorate,
      commercialRegistration,
      phone: sellerPhone,
      pickupAddress,
      pickupPoint,
    });
    saveDatabase(db);

    if (pickupPoint || pickupAddress) {
      try {
        localStorage.setItem(
          'sdp_default_store_pickup',
          JSON.stringify({
            storeName,
            pickupAddress,
            pickupPoint: pickupPoint || {
              lat: 31.9566,
              lng: 35.9186,
              label: pickupAddress || `${storeName} Hub`,
            },
          })
        );
      } catch {
        // ignore
      }
    }

    const token = `mock_token_${newUser.userId}_${Date.now()}`;
    setStoredSessionToken(token);

    return {
      token,
      user: newUser,
      role: 'SELLER',
      sellerId,
    };
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
    await simulateLatency();
    const db = loadDatabase();

    const existing = db.users.find(
      (u) => u.email.toLowerCase() === dto.email.trim().toLowerCase()
    );
    if (existing) {
      throw new MockApiException(
        'CONFLICT',
        'An account with this email address already exists.'
      );
    }

    const userId = `usr_driver_${Date.now()}`;
    const driverId = `drv_${Date.now()}`;
    const vehicleId = `veh_${Date.now()}`;
    const applicationId = `APP-DRV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const userPhone = (dto.phoneNumber || dto.phone || '').trim();
    const nationalId = (dto.nationalIdNumber || dto.nationalId || '').trim();
    const photoUrl = (dto.personalPhotoUrl || '').trim();
    const vehicleModel = (dto.model || dto.vehicleModel || '').trim();
    const vehicleColour = (dto.colour || dto.vehicleColor || '').trim();
    const licenceUrl = (dto.licencePhotoUrl || dto.driverLicenseUrl || '').trim();
    const nationalIdCardUrl = (dto.nationalIdCardUrl || '').trim();
    const vehicleRegUrl = (dto.vehicleRegistrationUrl || '').trim();

    const newUser: User = {
      userId,
      fullName: dto.fullName.trim(),
      email: dto.email.trim().toLowerCase(),
      phoneNumber: userPhone,
      phone: userPhone,
      passwordHash: demoHashPassword(dto.password),
      role: 'DRIVER',
      createdAt: new Date().toISOString(),
    };

    const newDriver: Driver = {
      driverId,
      userId,
      nationalIdNumber: nationalId,
      personalPhotoUrl: photoUrl || generateAvatarSvgDataUri(dto.fullName),
      accountStatus: 'PENDING' as DriverStatus,
      applicationId,
      preferredGovernorate: dto.preferredGovernorate || 'Amman',
    };

    const newVehicle: Vehicle = {
      vehicleId,
      driverId,
      vehicleType: dto.vehicleType,
      model: vehicleModel,
      colour: vehicleColour,
      plateNumber: dto.plateNumber.trim(),
    };

    if (licenceUrl) {
      db.documents.push({
        documentId: `doc_lic_${Date.now()}`,
        driverId,
        documentType: 'LICENCE',
        fileUrl: licenceUrl,
        uploadedAt: new Date().toISOString(),
      });
    }

    if (nationalIdCardUrl) {
      db.documents.push({
        documentId: `doc_nid_${Date.now()}`,
        driverId,
        documentType: 'NATIONAL_ID',
        fileUrl: nationalIdCardUrl,
        uploadedAt: new Date().toISOString(),
      });
    }

    if (vehicleRegUrl) {
      db.documents.push({
        documentId: `doc_veh_${Date.now()}`,
        driverId,
        documentType: 'VEHICLE_REGISTRATION',
        fileUrl: vehicleRegUrl,
        uploadedAt: new Date().toISOString(),
      });
    }

    db.users.push(newUser);
    db.drivers.push(newDriver);
    db.vehicles.push(newVehicle);
    saveDatabase(db);

    const token = `mock_token_${newUser.userId}_${Date.now()}`;
    setStoredSessionToken(token);

    return {
      message:
        'Your driver application has been completed and submitted for review. Tracking ID: ' + applicationId,
      status: 'PENDING',
      driverId,
      applicationId,
      token,
      user: newUser,
    };
  }

  async login(dto: LoginDto): Promise<AuthSession> {
    await simulateLatency();
    const db = loadDatabase();

    const email = dto.email.trim().toLowerCase();
    const hash = demoHashPassword(dto.password);

    const user = db.users.find(
      (u) => u.email.toLowerCase() === email && u.passwordHash === hash
    );

    if (!user) {
      // Intentionally generic message (Section 5.1)
      throw new MockApiException('UNAUTHENTICATED', 'Email or password is incorrect.');
    }

    const seller = db.sellers.find((s) => s.userId === user.userId);
    const driver = db.drivers.find((d) => d.userId === user.userId);

    const token = `mock_token_${user.userId}_${Date.now()}`;
    setStoredSessionToken(token);

    return {
      token,
      user,
      role: user.role,
      driverStatus: driver?.accountStatus,
      sellerId: seller?.sellerId,
      driverId: driver?.driverId,
    };
  }

  async logout(): Promise<void> {
    await simulateLatency(100, 250);
    setStoredSessionToken(null);
  }

  async getMe(): Promise<User> {
    await simulateLatency(150, 300);
    const { user } = this.getCurrentUserOrThrow();
    return user;
  }

  // --- Seller Endpoints ---

  async createDeliveryRequest(
    dto: CreateDeliveryRequestDto
  ): Promise<DeliveryRequest> {
    await simulateLatency();
    const { user, session } = this.getCurrentUserOrThrow();
    if (user.role !== 'SELLER') {
      throw new MockApiException('FORBIDDEN', 'Only sellers can create delivery requests.');
    }

    const db = loadDatabase();
    const seller = db.sellers.find((s) => s.userId === user.userId);
    if (!seller) {
      throw new MockApiException('FORBIDDEN', 'Seller profile not found.');
    }

    const refNo = `SDP-${db.nextRefNumber}`;
    db.nextRefNumber += 1;

    const now = new Date().toISOString();
    const reqId = `req_${Date.now()}`;
    const newRequest: DeliveryRequest = {
      id: reqId,
      requestId: reqId,
      referenceNo: refNo,
      sellerId: seller.sellerId,
      productName: dto.productName.trim(),
      productDescription: dto.productDescription.trim(),
      productImageUrl: dto.productImageUrl,
      pickup: dto.pickup,
      delivery: dto.delivery,
      recipientName: dto.recipientName.trim(),
      recipientPhone: dto.recipientPhone.trim(),
      offeredFeeJod: Number(dto.offeredFeeJod.toFixed(1)),
      status: 'AVAILABLE',
      createdAt: now,
      updatedAt: now,
      statusHistory: [{ status: 'AVAILABLE', at: now }],
    };

    db.deliveryRequests.unshift(newRequest);
    saveDatabase(db);

    return newRequest;
  }

  async getSellerRequests(): Promise<DeliveryRequest[]> {
    await simulateLatency();
    const { user, session } = this.getCurrentUserOrThrow();
    if (user.role !== 'SELLER' || !session.sellerId) {
      throw new MockApiException('FORBIDDEN', 'Access denied to seller requests.');
    }

    const db = loadDatabase();
    return db.deliveryRequests
      .filter((r) => r.sellerId === session.sellerId)
      .map((r) => ({ ...r, id: r.requestId || r.id }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async getSellerRequestById(
    requestId: string
  ): Promise<DeliveryRequestWithDetails> {
    await simulateLatency();
    const { user, session } = this.getCurrentUserOrThrow();
    if (user.role !== 'SELLER' || !session.sellerId) {
      throw new MockApiException('FORBIDDEN', 'Access denied.');
    }

    const db = loadDatabase();
    const request = db.deliveryRequests.find((r) => r.requestId === requestId);

    if (!request || request.sellerId !== session.sellerId) {
      throw new MockApiException('NOT_FOUND', 'Delivery request not found.');
    }

    const result: DeliveryRequestWithDetails = { ...request };

    // Seller sees driver details ONLY after acceptance (Rule 8)
    if (request.driverId) {
      const driver = db.drivers.find((d) => d.driverId === request.driverId);
      if (driver) {
        const driverUser = db.users.find((u) => u.userId === driver.userId);
        const driverVehicle = db.vehicles.find(
          (v) => v.driverId === driver.driverId
        );
        if (driverUser && driverVehicle) {
          result.driver = {
            driverId: driver.driverId,
            fullName: driverUser.fullName,
            phoneNumber: driverUser.phoneNumber,
            personalPhotoUrl: driver.personalPhotoUrl,
            vehicle: driverVehicle,
          };
        }
      }
    }

    return result;
  }

  async getSellerProfile(): Promise<{
    user: User;
    sellerId: string;
    storeName?: string;
    storeCategory?: string;
    governorate?: string;
    commercialRegistration?: string;
    pickupAddress?: string;
    pickupPoint?: any;
  }> {
    await simulateLatency();
    const { user, session } = this.getCurrentUserOrThrow();
    if (user.role !== 'SELLER' || !session.sellerId) {
      throw new MockApiException('FORBIDDEN', 'Not a seller account.');
    }
    const db = loadDatabase();
    const seller = db.sellers.find(
      (s) => s.userId === user.userId || s.sellerId === session.sellerId
    );

    return {
      user,
      sellerId: session.sellerId,
      storeName: seller?.storeName || `${user.fullName}'s Store`,
      storeCategory: seller?.storeCategory || 'General Retail',
      governorate: seller?.governorate || 'Amman',
      commercialRegistration: seller?.commercialRegistration || '',
      pickupAddress: seller?.pickupAddress || '',
      pickupPoint: seller?.pickupPoint,
    };
  }

  async updateSellerProfile(dto: UpdateSellerProfileDto & {
    storeName?: string;
    storeCategory?: string;
    governorate?: string;
    commercialRegistration?: string;
    pickupAddress?: string;
    pickupPoint?: any;
  }): Promise<User> {
    await simulateLatency();
    const { user, session } = this.getCurrentUserOrThrow();
    if (user.role !== 'SELLER') {
      throw new MockApiException('FORBIDDEN', 'Only sellers can update seller profile.');
    }

    const db = loadDatabase();
    const userIndex = db.users.findIndex((u) => u.userId === user.userId);
    if (userIndex === -1) {
      throw new MockApiException('NOT_FOUND', 'User record not found.');
    }

    if (dto.fullName) {
      db.users[userIndex].fullName = dto.fullName.trim();
    }
    if (dto.phoneNumber) {
      db.users[userIndex].phoneNumber = dto.phoneNumber.trim();
      db.users[userIndex].phone = dto.phoneNumber.trim();
    }

    const sellerIndex = db.sellers.findIndex(
      (s) => s.userId === user.userId || s.sellerId === session?.sellerId
    );
    if (sellerIndex !== -1) {
      if (dto.storeName) db.sellers[sellerIndex].storeName = dto.storeName.trim();
      if (dto.storeCategory) db.sellers[sellerIndex].storeCategory = dto.storeCategory.trim();
      if (dto.governorate) db.sellers[sellerIndex].governorate = dto.governorate.trim();
      if (dto.commercialRegistration !== undefined) {
        db.sellers[sellerIndex].commercialRegistration = dto.commercialRegistration.trim();
      }
      if (dto.pickupAddress !== undefined) {
        db.sellers[sellerIndex].pickupAddress = dto.pickupAddress.trim();
      }
      if (dto.pickupPoint !== undefined) {
        db.sellers[sellerIndex].pickupPoint = dto.pickupPoint;
      }
    }

    saveDatabase(db);

    return db.users[userIndex];
  }

  // --- Driver Endpoints ---

  async getNearbyRequests(
    queryOrPoint: NearbyRequestsQuery | { lat: number; lng: number },
    radiusKm?: number
  ): Promise<NearbyRequestItem[]> {
    await simulateLatency();
    const { user, session } = this.getCurrentUserOrThrow();
    if (user.role !== 'DRIVER') {
      throw new MockApiException('FORBIDDEN', 'Only drivers can search nearby requests.');
    }

    const db = loadDatabase();
    const driver = db.drivers.find((d) => d.userId === user.userId);
    if (!driver || driver.accountStatus !== 'APPROVED') {
      throw new MockApiException(
        'ACCOUNT_NOT_APPROVED',
        'Your driver account is not approved yet. Access to delivery requests is restricted.'
      );
    }

    const lat = queryOrPoint.lat;
    const lng = queryOrPoint.lng;
    const radius = ('radiusKm' in queryOrPoint ? (queryOrPoint as any).radiusKm : radiusKm) || 10;

    const driverPoint = {
      lat,
      lng,
      label: 'Driver Current Location',
    };

    const available = db.deliveryRequests.filter((r) => r.status === 'AVAILABLE');

    const items: NearbyRequestItem[] = [];

    for (const req of available) {
      // Proximity check: straight-line distance must be within radius (Rule 7)
      const straightLineKm = calculateHaversineDistanceKm(
        driverPoint.lat,
        driverPoint.lng,
        req.pickup.lat,
        req.pickup.lng
      );

      if (straightLineKm <= radius) {
        const roadDistanceToPickup = calculateRoadDistanceKm(driverPoint, req.pickup);
        const durationToPickup = calculateTravelTimeMin(roadDistanceToPickup);
        const leg2RoadKm = calculateRoadDistanceKm(req.pickup, req.delivery);
        const leg2Duration = calculateTravelTimeMin(leg2RoadKm);

        // Strip recipient contact details for unaccepted list (Rule 9)
        const sanitizedReq: DeliveryRequest = {
          ...req,
          recipientName: '***',
          recipientPhone: '***',
        };

        items.push({
          ...sanitizedReq,
          distanceToPickupKm: roadDistanceToPickup,
          durationToPickupMin: durationToPickup,
          pickupToDeliveryKm: leg2RoadKm,
          pickupToDeliveryDurationMin: leg2Duration,
          totalDistanceKm: Number((roadDistanceToPickup + leg2RoadKm).toFixed(2)),
          totalDurationMin: durationToPickup + leg2Duration,
        });
      }
    }

    // Sort by distance to pickup ascending (Rule 7)
    items.sort((a, b) => a.distanceToPickupKm - b.distanceToPickupKm);
    return items;
  }

  async getDriverRequestById(
    requestId: string,
    driverLat?: number,
    driverLng?: number
  ): Promise<NearbyRequestItem & DeliveryRequestWithDetails> {
    await simulateLatency();
    const { user, session } = this.getCurrentUserOrThrow();
    if (user.role !== 'DRIVER') {
      throw new MockApiException('FORBIDDEN', 'Only drivers can view driver request details.');
    }

    const db = loadDatabase();
    const driver = db.drivers.find((d) => d.userId === user.userId);
    if (!driver || driver.accountStatus !== 'APPROVED') {
      throw new MockApiException(
        'ACCOUNT_NOT_APPROVED',
        'Your driver account is pending approval or has been rejected.'
      );
    }

    const request = db.deliveryRequests.find((r) => r.requestId === requestId);
    if (!request) {
      throw new MockApiException('NOT_FOUND', 'Delivery request not found.');
    }

    // If another driver accepted it, throw CONFLICT or notify UI (Rule 4)
    if (request.status !== 'AVAILABLE' && request.driverId !== driver.driverId) {
      throw new MockApiException(
        'CONFLICT',
        'This request was already accepted by another driver.'
      );
    }

    const dLat = driverLat ?? 31.9539;
    const dLng = driverLng ?? 35.9106;
    const driverPoint = { lat: dLat, lng: dLng, label: 'Driver Location' };

    const roadDistanceToPickup = calculateRoadDistanceKm(driverPoint, request.pickup);
    const durationToPickup = calculateTravelTimeMin(roadDistanceToPickup);
    const leg2RoadKm = calculateRoadDistanceKm(request.pickup, request.delivery);
    const leg2Duration = calculateTravelTimeMin(leg2RoadKm);

    const isDriverOwnAccepted =
      request.driverId === driver.driverId && request.status !== 'AVAILABLE';

    const result: NearbyRequestItem & DeliveryRequestWithDetails = {
      ...request,
      recipientName: isDriverOwnAccepted ? request.recipientName : 'Hidden until accepted',
      recipientPhone: isDriverOwnAccepted ? request.recipientPhone : 'Hidden until accepted',
      distanceToPickupKm: roadDistanceToPickup,
      durationToPickupMin: durationToPickup,
      pickupToDeliveryKm: leg2RoadKm,
      pickupToDeliveryDurationMin: leg2Duration,
      totalDistanceKm: Number((roadDistanceToPickup + leg2RoadKm).toFixed(2)),
      totalDurationMin: durationToPickup + leg2Duration,
    };

    // Populate seller contact info
    const seller = db.sellers.find((s) => s.sellerId === request.sellerId);
    if (seller) {
      const sellerUser = db.users.find((u) => u.userId === seller.userId);
      if (sellerUser) {
        result.seller = {
          sellerId: seller.sellerId,
          fullName: sellerUser.fullName,
          phoneNumber: sellerUser.phoneNumber,
          email: sellerUser.email,
        };
      }
    }

    return result;
  }

  async acceptDeliveryRequest(requestId: string): Promise<DeliveryRequest> {
    await simulateLatency(300, 600);
    const { user } = this.getCurrentUserOrThrow();
    if (user.role !== 'DRIVER') {
      throw new MockApiException('FORBIDDEN', 'Only drivers can accept requests.');
    }

    const db = loadDatabase();
    const driver = db.drivers.find((d) => d.userId === user.userId);
    if (!driver || driver.accountStatus !== 'APPROVED') {
      throw new MockApiException('ACCOUNT_NOT_APPROVED', 'Account not approved.');
    }

    // Atomic Rule 3: Driver cannot accept if they already have an active delivery
    const existingActive = db.deliveryRequests.find(
      (r) =>
        r.driverId === driver.driverId &&
        (r.status === 'ACCEPTED' || r.status === 'PICKED_UP' || r.status === 'ON_THE_WAY')
    );
    if (existingActive) {
      throw new MockApiException(
        'CONFLICT',
        'You already have an active delivery in progress. Complete it before accepting another.'
      );
    }

    // Atomic Rule 4: Request must still be AVAILABLE
    const reqIndex = db.deliveryRequests.findIndex((r) => r.requestId === requestId);
    if (reqIndex === -1) {
      throw new MockApiException('NOT_FOUND', 'Delivery request not found.');
    }

    const req = db.deliveryRequests[reqIndex];
    if (req.status !== 'AVAILABLE' || req.driverId) {
      throw new MockApiException(
        'CONFLICT',
        'This request was already accepted by another driver.'
      );
    }

    const now = new Date().toISOString();
    req.status = 'ACCEPTED';
    req.driverId = driver.driverId;
    req.updatedAt = now;
    req.statusHistory.push({ status: 'ACCEPTED', at: now });

    saveDatabase(db);
    return req;
  }

  async getActiveDelivery(): Promise<(DeliveryRequestWithDetails & {
    leg1DistanceKm: number;
    leg1DurationMin: number;
    leg2DistanceKm: number;
    leg2DurationMin: number;
    totalDistanceKm: number;
    totalDurationMin: number;
  }) | null> {
    await simulateLatency(150, 400);
    const { user } = this.getCurrentUserOrThrow();
    if (user.role !== 'DRIVER') return null;

    const db = loadDatabase();
    const driver = db.drivers.find((d) => d.userId === user.userId);
    if (!driver) return null;

    const active = db.deliveryRequests.find(
      (r) =>
        r.driverId === driver.driverId &&
        (r.status === 'ACCEPTED' || r.status === 'PICKED_UP' || r.status === 'ON_THE_WAY')
    );

    if (!active) return null;

    // Build details
    const seller = db.sellers.find((s) => s.sellerId === active.sellerId);
    let sellerInfo;
    if (seller) {
      const sellerUser = db.users.find((u) => u.userId === seller.userId);
      if (sellerUser) {
        sellerInfo = {
          sellerId: seller.sellerId,
          fullName: sellerUser.fullName,
          phoneNumber: sellerUser.phoneNumber,
          email: sellerUser.email,
        };
      }
    }

    // Coordinates calculations
    const leg1Distance = calculateRoadDistanceKm(active.pickup, active.delivery); // fallback or driver pos
    const leg1RoadKm = calculateRoadDistanceKm(active.pickup, active.pickup); // driver to pickup
    const leg2RoadKm = calculateRoadDistanceKm(active.pickup, active.delivery);

    const leg1Duration = calculateTravelTimeMin(leg1RoadKm);
    const leg2Duration = calculateTravelTimeMin(leg2RoadKm);

    return {
      ...active,
      seller: sellerInfo,
      leg1DistanceKm: leg1RoadKm,
      leg1DurationMin: leg1Duration,
      leg2DistanceKm: leg2RoadKm,
      leg2DurationMin: leg2Duration,
      totalDistanceKm: Number((leg1RoadKm + leg2RoadKm).toFixed(2)),
      totalDurationMin: leg1Duration + leg2Duration,
    };
  }

  async updateDeliveryStatus(
    dtoOrId: UpdateDeliveryStatusDto | string,
    status?: DeliveryStatus
  ): Promise<DeliveryRequest> {
    await simulateLatency(250, 500);
    const targetStatus: DeliveryStatus =
      typeof dtoOrId === 'string' ? (status as DeliveryStatus) : dtoOrId.status;
    const { user } = this.getCurrentUserOrThrow();
    if (user.role !== 'DRIVER') {
      throw new MockApiException('FORBIDDEN', 'Only drivers can update delivery status.');
    }

    const db = loadDatabase();
    const driver = db.drivers.find((d) => d.userId === user.userId);
    if (!driver) {
      throw new MockApiException('FORBIDDEN', 'Driver profile not found.');
    }

    const activeIndex = db.deliveryRequests.findIndex(
      (r) =>
        r.driverId === driver.driverId &&
        (r.status === 'ACCEPTED' || r.status === 'PICKED_UP' || r.status === 'ON_THE_WAY')
    );

    if (activeIndex === -1) {
      throw new MockApiException('NOT_FOUND', 'No active delivery found to update.');
    }

    const active = db.deliveryRequests[activeIndex];

    // Rule 5: Status progression forward-only, one step at a time
    const validNextStep: Record<DeliveryStatus, DeliveryStatus | null> = {
      AVAILABLE: 'ACCEPTED',
      ACCEPTED: 'PICKED_UP',
      PICKED_UP: 'ON_THE_WAY',
      ON_THE_WAY: 'DELIVERED',
      DELIVERED: null,
    };

    if (validNextStep[active.status] !== targetStatus) {
      throw new MockApiException(
        'CONFLICT',
        `Invalid status transition from ${active.status} to ${targetStatus}.`
      );
    }

    const now = new Date().toISOString();
    active.status = targetStatus;
    active.updatedAt = now;
    active.statusHistory.push({ status: targetStatus, at: now });

    saveDatabase(db);
    return active;
  }

  async getDriverProfile(): Promise<DriverWithDetails> {
    await simulateLatency();
    const { user } = this.getCurrentUserOrThrow();
    if (user.role !== 'DRIVER') {
      throw new MockApiException('FORBIDDEN', 'Not a driver account.');
    }

    const db = loadDatabase();
    const driver = db.drivers.find((d) => d.userId === user.userId);
    if (!driver) {
      throw new MockApiException('NOT_FOUND', 'Driver profile not found.');
    }

    const vehicle = db.vehicles.find((v) => v.driverId === driver.driverId) || {
      vehicleId: 'veh_none',
      driverId: driver.driverId,
      vehicleType: 'CAR',
      model: 'Standard',
      colour: 'White',
      plateNumber: '00-00000',
    };

    const docs = db.documents.filter((doc) => doc.driverId === driver.driverId);

    return {
      ...driver,
      user,
      vehicle,
      documents: docs,
    };
  }

  // --- Administrator Endpoints ---

  async getAdminStats(): Promise<AdminStats> {
    await simulateLatency();
    const { user } = this.getCurrentUserOrThrow();
    if (user.role !== 'ADMIN') {
      throw new MockApiException('FORBIDDEN', 'Administrator access required.');
    }

    const db = loadDatabase();
    const totalDrivers = db.drivers.length;
    const pendingDrivers = db.drivers.filter((d) => d.accountStatus === 'PENDING').length;
    const approvedDrivers = db.drivers.filter((d) => d.accountStatus === 'APPROVED').length;
    const rejectedDrivers = db.drivers.filter((d) => d.accountStatus === 'REJECTED').length;
    const totalSellers = db.sellers.length;
    const totalRequests = db.deliveryRequests.length;

    const requestsByStatus: Record<DeliveryStatus, number> = {
      AVAILABLE: 0,
      ACCEPTED: 0,
      PICKED_UP: 0,
      ON_THE_WAY: 0,
      DELIVERED: 0,
    };

    db.deliveryRequests.forEach((r) => {
      if (requestsByStatus[r.status] !== undefined) {
        requestsByStatus[r.status] += 1;
      }
    });

    return {
      totalDrivers,
      pendingDrivers,
      approvedDrivers,
      rejectedDrivers,
      totalSellers,
      totalRequests,
      requestsByStatus,
    };
  }

  async getAdminDrivers(query?: ListDriversQuery): Promise<DriverWithDetails[]> {
    await simulateLatency();
    const { user } = this.getCurrentUserOrThrow();
    if (user.role !== 'ADMIN') {
      throw new MockApiException('FORBIDDEN', 'Administrator access required.');
    }

    const db = loadDatabase();
    let drivers = [...db.drivers];

    if (query?.status) {
      drivers = drivers.filter((d) => d.accountStatus === query.status);
    }

    const results: DriverWithDetails[] = [];
    for (const d of drivers) {
      const u = db.users.find((user) => user.userId === d.userId);
      const v = db.vehicles.find((veh) => veh.driverId === d.driverId);
      const docs = db.documents.filter((doc) => doc.driverId === d.driverId);

      if (u && v) {
        if (query?.q) {
          const qLower = query.q.toLowerCase().trim();
          const matchName = u.fullName.toLowerCase().includes(qLower);
          const matchEmail = u.email.toLowerCase().includes(qLower);
          const matchPlate = v.plateNumber.toLowerCase().includes(qLower);
          if (!matchName && !matchEmail && !matchPlate) {
            continue;
          }
        }
        results.push({ ...d, user: u, vehicle: v, documents: docs });
      }
    }

    // Sort: Pending first, then by creation date descending
    results.sort((a, b) => {
      if (a.accountStatus === 'PENDING' && b.accountStatus !== 'PENDING') return -1;
      if (a.accountStatus !== 'PENDING' && b.accountStatus === 'PENDING') return 1;
      return (
        new Date(b.user.createdAt).getTime() - new Date(a.user.createdAt).getTime()
      );
    });

    return results;
  }

  async getAdminDriverById(driverId: string): Promise<DriverWithDetails> {
    await simulateLatency();
    const { user } = this.getCurrentUserOrThrow();
    if (user.role !== 'ADMIN') {
      throw new MockApiException('FORBIDDEN', 'Administrator access required.');
    }

    const db = loadDatabase();
    const driver = db.drivers.find((d) => d.driverId === driverId);
    if (!driver) {
      throw new MockApiException('NOT_FOUND', 'Driver not found.');
    }

    const u = db.users.find((user) => user.userId === driver.userId);
    const v = db.vehicles.find((veh) => veh.driverId === driver.driverId);
    const docs = db.documents.filter((doc) => doc.driverId === driver.driverId);

    if (!u || !v) {
      throw new MockApiException('NOT_FOUND', 'Driver records incomplete.');
    }

    return { ...driver, user: u, vehicle: v, documents: docs };
  }

  async approveDriver(driverId: string): Promise<DriverWithDetails> {
    await simulateLatency();
    const { user } = this.getCurrentUserOrThrow();
    if (user.role !== 'ADMIN') {
      throw new MockApiException('FORBIDDEN', 'Administrator access required.');
    }

    const db = loadDatabase();
    const driverIndex = db.drivers.findIndex((d) => d.driverId === driverId);
    if (driverIndex === -1) {
      throw new MockApiException('NOT_FOUND', 'Driver not found.');
    }

    const driver = db.drivers[driverIndex];
    if (driver.accountStatus !== 'PENDING') {
      throw new MockApiException(
        'CONFLICT',
        `Driver cannot be approved because their status is already ${driver.accountStatus}.`
      );
    }

    driver.accountStatus = 'APPROVED';
    driver.reviewedAt = new Date().toISOString();
    delete driver.rejectionReason;

    saveDatabase(db);
    return this.getAdminDriverById(driverId);
  }

  async rejectDriver(
    driverId: string,
    dto: RejectDriverDto | string
  ): Promise<DriverWithDetails> {
    await simulateLatency();
    const { user } = this.getCurrentUserOrThrow();
    if (user.role !== 'ADMIN') {
      throw new MockApiException('FORBIDDEN', 'Administrator access required.');
    }

    const rawReason = typeof dto === 'string' ? dto : dto.reason;
    const trimmedReason = (rawReason || '').trim();
    if (trimmedReason.length < 10) {
      throw new MockApiException(
        'VALIDATION_ERROR',
        'A written rejection reason of at least 10 characters is mandatory.'
      );
    }

    const db = loadDatabase();
    const driverIndex = db.drivers.findIndex((d) => d.driverId === driverId);
    if (driverIndex === -1) {
      throw new MockApiException('NOT_FOUND', 'Driver not found.');
    }

    const driver = db.drivers[driverIndex];
    if (driver.accountStatus !== 'PENDING') {
      throw new MockApiException(
        'CONFLICT',
        `Driver cannot be rejected because their status is already ${driver.accountStatus}.`
      );
    }

    driver.accountStatus = 'REJECTED';
    driver.rejectionReason = trimmedReason;
    driver.reviewedAt = new Date().toISOString();

    saveDatabase(db);
    return this.getAdminDriverById(driverId);
  }

  // Compatibility & convenience aliases
  async getDeliveryRequest(requestId: string): Promise<DeliveryRequestWithDetails> {
    const db = loadDatabase();
    const req = db.deliveryRequests.find(
      (r) => r.requestId === requestId || r.referenceNo === requestId || r.id === requestId
    );
    if (!req) {
      throw new MockApiException('NOT_FOUND', 'Delivery request not found.');
    }
    const sellerUser = db.users.find((u) => {
      const s = db.sellers.find((sel) => sel.sellerId === req.sellerId);
      return s ? u.userId === s.userId : false;
    });
    let driverDetail: any = undefined;
    if (req.driverId) {
      const d = db.drivers.find((dr) => dr.driverId === req.driverId);
      const du = d ? db.users.find((u) => u.userId === d.userId) : undefined;
      const dv = d ? db.vehicles.find((v) => v.driverId === d.driverId) : undefined;
      if (d && du && dv) {
        driverDetail = {
          driverId: d.driverId,
          fullName: du.fullName,
          phoneNumber: du.phoneNumber,
          personalPhotoUrl: d.personalPhotoUrl,
          vehicle: dv,
        };
      }
    }
    return {
      ...req,
      id: req.requestId,
      seller: sellerUser ? {
        sellerId: req.sellerId,
        fullName: sellerUser.fullName,
        phoneNumber: sellerUser.phoneNumber,
        email: sellerUser.email,
      } : undefined,
      driver: driverDetail,
    };
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
    const db = loadDatabase();
    const allDrivers = db.drivers.map((d) => {
      const u = db.users.find((user) => user.userId === d.userId);
      const v = db.vehicles.find((veh) => veh.driverId === d.driverId);
      const licDoc = db.documents.find(
        (doc) => doc.driverId === d.driverId && doc.documentType === 'LICENCE'
      );
      const nidDoc = db.documents.find(
        (doc) => doc.driverId === d.driverId && doc.documentType === 'NATIONAL_ID'
      );
      const vehDoc = db.documents.find(
        (doc) => doc.driverId === d.driverId && doc.documentType === 'VEHICLE_REGISTRATION'
      );

      const profile: DriverProfile = {
        id: d.driverId,
        userId: d.userId,
        fullName: u?.fullName || 'Unknown Driver',
        email: u?.email || '',
        phone: u?.phoneNumber || u?.phone || '',
        nationalId: d.nationalIdNumber || '',
        vehicleType: v?.vehicleType || 'CAR',
        vehicleModel: v?.model || '',
        vehicleColor: v?.colour || '',
        plateNumber: v?.plateNumber || '',
        personalPhotoUrl: d.personalPhotoUrl,
        driverLicenseUrl: licDoc?.fileUrl,
        nationalIdCardUrl: nidDoc?.fileUrl,
        vehicleRegistrationUrl: vehDoc?.fileUrl,
        applicationId: d.applicationId,
        preferredGovernorate: d.preferredGovernorate,
        status: d.accountStatus,
        rejectionReason: d.rejectionReason,
        createdAt: u?.createdAt || '',
      };
      return profile;
    });

    const counts = {
      total: allDrivers.length,
      pending: allDrivers.filter((d) => d.status === 'PENDING' || (d.status as any) === 'PENDING_APPROVAL').length,
      approved: allDrivers.filter((d) => d.status === 'APPROVED').length,
      rejected: allDrivers.filter((d) => d.status === 'REJECTED').length,
    };

    let filtered = allDrivers;
    if (status && status !== 'ALL') {
      filtered = filtered.filter((d) => d.status === status);
    }
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.fullName.toLowerCase().includes(q) ||
          d.email.toLowerCase().includes(q) ||
          d.phone.toLowerCase().includes(q) ||
          d.plateNumber.toLowerCase().includes(q)
      );
    }

    return {
      drivers: filtered,
      counts,
    };
  }

  async getDriverActiveDelivery(): Promise<any> {
    return this.getActiveDelivery();
  }
}
