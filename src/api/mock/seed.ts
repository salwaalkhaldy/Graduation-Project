import { AMMAN_PRESET_AREAS } from '../../config/constants';
import {
  DeliveryRequest,
  Driver,
  DriverDocument,
  Seller,
  User,
  Vehicle,
} from '../../types/domain';
import {
  generateAvatarSvgDataUri,
  generateLicenseSvgDataUri,
  generateProductPlaceholderSvg,
} from '../../utils/image';

export interface MockDatabaseState {
  users: User[];
  sellers: Seller[];
  drivers: Driver[];
  vehicles: Vehicle[];
  documents: DriverDocument[];
  deliveryRequests: DeliveryRequest[];
  nextRefNumber: number;
}

// Deterministic simple hash for demo purposes only
// DEMO ONLY: a real backend must use bcrypt/argon2. Never hash on the client in production.
export function demoHashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return `demo_hash_${Math.abs(hash)}`;
}

export function createInitialDatabaseSeed(): MockDatabaseState {
  const sellerPasswordHash = demoHashPassword('Seller@123');
  const driverPasswordHash = demoHashPassword('Driver@123');
  const adminPasswordHash = demoHashPassword('Admin@123');

  const now = new Date();
  const getPastIso = (minutesAgo: number) =>
    new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();

  // Users
  const users: User[] = [
    // Admin
    {
      userId: 'usr_admin_1',
      fullName: 'Platform Administrator',
      email: 'admin@demo.com',
      passwordHash: adminPasswordHash,
      phoneNumber: '+962 79 000 0000',
      role: 'ADMIN',
      createdAt: getPastIso(10080),
    },
    // Sellers
    {
      userId: 'usr_seller_1',
      fullName: 'Omar Nasser',
      email: 'seller@demo.com',
      passwordHash: sellerPasswordHash,
      phoneNumber: '+962 79 000 0001',
      role: 'SELLER',
      createdAt: getPastIso(10000),
    },
    {
      userId: 'usr_seller_2',
      fullName: 'Rana Khalil',
      email: 'seller2@demo.com',
      passwordHash: sellerPasswordHash,
      phoneNumber: '+962 79 000 0002',
      role: 'SELLER',
      createdAt: getPastIso(9500),
    },
    {
      userId: 'usr_seller_3',
      fullName: 'Tariq Boutique',
      email: 'tariq.seller@demo.com',
      passwordHash: sellerPasswordHash,
      phoneNumber: '+962 79 000 0003',
      role: 'SELLER',
      createdAt: getPastIso(9000),
    },
    {
      userId: 'usr_seller_4',
      fullName: 'Amman Artisan Goods',
      email: 'artisan@demo.com',
      passwordHash: sellerPasswordHash,
      phoneNumber: '+962 79 000 0004',
      role: 'SELLER',
      createdAt: getPastIso(8500),
    },
    {
      userId: 'usr_seller_5',
      fullName: 'Zaytouna Organics',
      email: 'zaytouna@demo.com',
      passwordHash: sellerPasswordHash,
      phoneNumber: '+962 79 000 0005',
      role: 'SELLER',
      createdAt: getPastIso(8000),
    },

    // Drivers
    // 1. Yousef Haddad (Approved)
    {
      userId: 'usr_driver_1',
      fullName: 'Yousef Haddad',
      email: 'driver@demo.com',
      passwordHash: driverPasswordHash,
      phoneNumber: '+962 79 000 0011',
      role: 'DRIVER',
      createdAt: getPastIso(7200),
    },
    // 2. Sami Odeh (Approved)
    {
      userId: 'usr_driver_2',
      fullName: 'Sami Odeh',
      email: 'driver2@demo.com',
      passwordHash: driverPasswordHash,
      phoneNumber: '+962 79 000 0012',
      role: 'DRIVER',
      createdAt: getPastIso(6800),
    },
    // 3. Dana Ayyad (Approved)
    {
      userId: 'usr_driver_3',
      fullName: 'Dana Ayyad',
      email: 'dana.driver@demo.com',
      passwordHash: driverPasswordHash,
      phoneNumber: '+962 79 000 0013',
      role: 'DRIVER',
      createdAt: getPastIso(6400),
    },
    // 4. Khaled Rimawi (Approved)
    {
      userId: 'usr_driver_4',
      fullName: 'Khaled Rimawi',
      email: 'khaled.driver@demo.com',
      passwordHash: driverPasswordHash,
      phoneNumber: '+962 79 000 0014',
      role: 'DRIVER',
      createdAt: getPastIso(6000),
    },
    // 5. Lina Barakat (Pending)
    {
      userId: 'usr_driver_5',
      fullName: 'Lina Barakat',
      email: 'pending.driver@demo.com',
      passwordHash: driverPasswordHash,
      phoneNumber: '+962 79 000 0015',
      role: 'DRIVER',
      createdAt: getPastIso(120),
    },
    // 6. Tariq Mansour (Pending)
    {
      userId: 'usr_driver_6',
      fullName: 'Tariq Mansour',
      email: 'tariq.driver@demo.com',
      passwordHash: driverPasswordHash,
      phoneNumber: '+962 79 000 0016',
      role: 'DRIVER',
      createdAt: getPastIso(240),
    },
    // 7. Mahmoud Saleh (Pending)
    {
      userId: 'usr_driver_7',
      fullName: 'Mahmoud Saleh',
      email: 'mahmoud.driver@demo.com',
      passwordHash: driverPasswordHash,
      phoneNumber: '+962 79 000 0017',
      role: 'DRIVER',
      createdAt: getPastIso(360),
    },
    // 8. Hadi Zoubi (Rejected)
    {
      userId: 'usr_driver_8',
      fullName: 'Hadi Zoubi',
      email: 'rejected.driver@demo.com',
      passwordHash: driverPasswordHash,
      phoneNumber: '+962 79 000 0018',
      role: 'DRIVER',
      createdAt: getPastIso(1440),
    },
    // 9. Ruba Fakhoury (Rejected)
    {
      userId: 'usr_driver_9',
      fullName: 'Ruba Fakhoury',
      email: 'ruba.driver@demo.com',
      passwordHash: driverPasswordHash,
      phoneNumber: '+962 79 000 0019',
      role: 'DRIVER',
      createdAt: getPastIso(2880),
    },
  ];

  // Sellers
  const sellers: Seller[] = [
    { sellerId: 'seller_1', userId: 'usr_seller_1' },
    { sellerId: 'seller_2', userId: 'usr_seller_2' },
    { sellerId: 'seller_3', userId: 'usr_seller_3' },
    { sellerId: 'seller_4', userId: 'usr_seller_4' },
    { sellerId: 'seller_5', userId: 'usr_seller_5' },
  ];

  // Drivers
  const drivers: Driver[] = [
    {
      driverId: 'drv_1',
      userId: 'usr_driver_1',
      nationalIdNumber: '9900000001',
      personalPhotoUrl: generateAvatarSvgDataUri('Yousef Haddad', '#0F766E'),
      accountStatus: 'APPROVED',
      reviewedAt: getPastIso(7000),
    },
    {
      driverId: 'drv_2',
      userId: 'usr_driver_2',
      nationalIdNumber: '9900000002',
      personalPhotoUrl: generateAvatarSvgDataUri('Sami Odeh', '#2563EB'),
      accountStatus: 'APPROVED',
      reviewedAt: getPastIso(6700),
    },
    {
      driverId: 'drv_3',
      userId: 'usr_driver_3',
      nationalIdNumber: '9900000003',
      personalPhotoUrl: generateAvatarSvgDataUri('Dana Ayyad', '#7C3AED'),
      accountStatus: 'APPROVED',
      reviewedAt: getPastIso(6300),
    },
    {
      driverId: 'drv_4',
      userId: 'usr_driver_4',
      nationalIdNumber: '9900000004',
      personalPhotoUrl: generateAvatarSvgDataUri('Khaled Rimawi', '#059669'),
      accountStatus: 'APPROVED',
      reviewedAt: getPastIso(5900),
    },
    {
      driverId: 'drv_5',
      userId: 'usr_driver_5',
      nationalIdNumber: '9900000005',
      personalPhotoUrl: generateAvatarSvgDataUri('Lina Barakat', '#D97706'),
      accountStatus: 'PENDING',
    },
    {
      driverId: 'drv_6',
      userId: 'usr_driver_6',
      nationalIdNumber: '9900000006',
      personalPhotoUrl: generateAvatarSvgDataUri('Tariq Mansour', '#0284C7'),
      accountStatus: 'PENDING',
    },
    {
      driverId: 'drv_7',
      userId: 'usr_driver_7',
      nationalIdNumber: '9900000007',
      personalPhotoUrl: generateAvatarSvgDataUri('Mahmoud Saleh', '#475569'),
      accountStatus: 'PENDING',
    },
    {
      driverId: 'drv_8',
      userId: 'usr_driver_8',
      nationalIdNumber: '9900000008',
      personalPhotoUrl: generateAvatarSvgDataUri('Hadi Zoubi', '#E11D48'),
      accountStatus: 'REJECTED',
      rejectionReason:
        "The driver's licence photograph is blurred and the expiry date cannot be read.",
      reviewedAt: getPastIso(1200),
    },
    {
      driverId: 'drv_9',
      userId: 'usr_driver_9',
      nationalIdNumber: '9900000009',
      personalPhotoUrl: generateAvatarSvgDataUri('Ruba Fakhoury', '#9333EA'),
      accountStatus: 'REJECTED',
      rejectionReason:
        'The plate number in the vehicle information does not match the vehicle documents provided.',
      reviewedAt: getPastIso(2500),
    },
  ];

  // Vehicles
  const vehicles: Vehicle[] = [
    {
      vehicleId: 'veh_1',
      driverId: 'drv_1',
      vehicleType: 'CAR',
      model: 'Toyota Prius 2021',
      colour: 'Silver',
      plateNumber: '50-84920',
    },
    {
      vehicleId: 'veh_2',
      driverId: 'drv_2',
      vehicleType: 'MOTORCYCLE',
      model: 'Honda CB500X',
      colour: 'Red',
      plateNumber: '32-11405',
    },
    {
      vehicleId: 'veh_3',
      driverId: 'drv_3',
      vehicleType: 'CAR',
      model: 'Hyundai Ioniq Hybrid',
      colour: 'White',
      plateNumber: '48-93210',
    },
    {
      vehicleId: 'veh_4',
      driverId: 'drv_4',
      vehicleType: 'VAN',
      model: 'Ford Transit Custom',
      colour: 'Dark Blue',
      plateNumber: '19-44021',
    },
    {
      vehicleId: 'veh_5',
      driverId: 'drv_5',
      vehicleType: 'CAR',
      model: 'Kia Niro 2022',
      colour: 'Grey',
      plateNumber: '52-98431',
    },
    {
      vehicleId: 'veh_6',
      driverId: 'drv_6',
      vehicleType: 'MOTORCYCLE',
      model: 'Yamaha MT-07',
      colour: 'Black',
      plateNumber: '34-89201',
    },
    {
      vehicleId: 'veh_7',
      driverId: 'drv_7',
      vehicleType: 'CAR',
      model: 'Nissan Leaf 2020',
      colour: 'Pearl White',
      plateNumber: '45-20184',
    },
    {
      vehicleId: 'veh_8',
      driverId: 'drv_8',
      vehicleType: 'CAR',
      model: 'Kia Cerato 2019',
      colour: 'Silver',
      plateNumber: '50-10928',
    },
    {
      vehicleId: 'veh_9',
      driverId: 'drv_9',
      vehicleType: 'VAN',
      model: 'Hyundai H-1',
      colour: 'Silver',
      plateNumber: '21-65490',
    },
  ];

  // Documents
  const documents: DriverDocument[] = drivers.map((d, index) => ({
    documentId: `doc_${d.driverId}`,
    driverId: d.driverId,
    documentType: 'LICENCE',
    fileUrl: generateLicenseSvgDataUri(
      users.find((u) => u.userId === d.userId)?.fullName || 'Driver Name',
      d.nationalIdNumber,
      `JO-DL-${8000 + index}`
    ),
    uploadedAt: getPastIso(1000 + index * 500),
  }));

  // Delivery Requests (12 requests)
  const deliveryRequests: DeliveryRequest[] = [
    {
      requestId: 'req_1001',
      referenceNo: 'SDP-1001',
      sellerId: 'seller_1',
      productName: 'Handmade leather wallet',
      productDescription:
        'Full-grain vegetable-tanned cowhide wallet in dark brown finish with gift box.',
      productImageUrl: generateProductPlaceholderSvg('Leather Wallet', '#78350F'),
      pickup: AMMAN_PRESET_AREAS.Abdali,
      delivery: AMMAN_PRESET_AREAS['Jabal Amman'],
      recipientName: 'Kareem Majali',
      recipientPhone: '+962 79 555 1001',
      offeredFeeJod: 2.5,
      status: 'AVAILABLE',
      createdAt: getPastIso(180),
      updatedAt: getPastIso(180),
      statusHistory: [{ status: 'AVAILABLE', at: getPastIso(180) }],
    },
    {
      requestId: 'req_1002',
      referenceNo: 'SDP-1002',
      sellerId: 'seller_1',
      productName: 'Box of 12 macarons',
      productDescription:
        'Fresh French assorted macarons (pistachio, raspberry, salted caramel). Temperature sensitive.',
      productImageUrl: generateProductPlaceholderSvg('Macarons Box', '#EC4899'),
      pickup: AMMAN_PRESET_AREAS.Shmeisani,
      delivery: AMMAN_PRESET_AREAS.Abdoun,
      recipientName: 'Noor Al-Hussein',
      recipientPhone: '+962 79 555 1002',
      offeredFeeJod: 3.5,
      status: 'AVAILABLE',
      createdAt: getPastIso(120),
      updatedAt: getPastIso(120),
      statusHistory: [{ status: 'AVAILABLE', at: getPastIso(120) }],
    },
    {
      requestId: 'req_1003',
      referenceNo: 'SDP-1003',
      sellerId: 'seller_2',
      productName: 'Laptop sleeve',
      productDescription:
        '14-inch padded neoprene water-resistant laptop sleeve with accessory pouch.',
      pickup: AMMAN_PRESET_AREAS.Downtown,
      delivery: AMMAN_PRESET_AREAS.Sweifieh,
      recipientName: 'Ahmad Tarawneh',
      recipientPhone: '+962 79 555 1003',
      offeredFeeJod: 3.0,
      status: 'AVAILABLE',
      createdAt: getPastIso(90),
      updatedAt: getPastIso(90),
      statusHistory: [{ status: 'AVAILABLE', at: getPastIso(90) }],
    },
    {
      requestId: 'req_1004',
      referenceNo: 'SDP-1004',
      sellerId: 'seller_1',
      productName: 'Phone case bundle',
      productDescription:
        'Two shockproof matte silicone phone cases with tempered glass screen protectors.',
      productImageUrl: generateProductPlaceholderSvg('Phone Cases', '#3B82F6'),
      pickup: AMMAN_PRESET_AREAS["Tla' Al-Ali"],
      delivery: AMMAN_PRESET_AREAS.Khalda,
      recipientName: 'Zaid Qasim',
      recipientPhone: '+962 79 555 1004',
      offeredFeeJod: 2.0,
      status: 'AVAILABLE',
      createdAt: getPastIso(60),
      updatedAt: getPastIso(60),
      statusHistory: [{ status: 'AVAILABLE', at: getPastIso(60) }],
    },
    {
      requestId: 'req_1005',
      referenceNo: 'SDP-1005',
      sellerId: 'seller_2',
      productName: 'Olive oil, 2 L',
      productDescription:
        'Cold-pressed extra virgin Jordanian olive oil in protective tin container.',
      pickup: AMMAN_PRESET_AREAS.Marka,
      delivery: AMMAN_PRESET_AREAS.Downtown,
      recipientName: 'Fatima Nabulsi',
      recipientPhone: '+962 79 555 1005',
      offeredFeeJod: 4.0,
      status: 'AVAILABLE',
      createdAt: getPastIso(45),
      updatedAt: getPastIso(45),
      statusHistory: [{ status: 'AVAILABLE', at: getPastIso(45) }],
    },
    {
      requestId: 'req_1006',
      referenceNo: 'SDP-1006',
      sellerId: 'seller_1',
      productName: 'Wall clock',
      productDescription:
        'Modern minimalist silent wall clock, 35cm diameter, packaged with foam cushioning.',
      productImageUrl: generateProductPlaceholderSvg('Wall Clock', '#6366F1'),
      pickup: AMMAN_PRESET_AREAS['Al-Salt'],
      delivery: AMMAN_PRESET_AREAS.Abdali,
      recipientName: 'Murad Haddadin',
      recipientPhone: '+962 79 555 1006',
      offeredFeeJod: 5.5,
      status: 'AVAILABLE',
      createdAt: getPastIso(30),
      updatedAt: getPastIso(30),
      statusHistory: [{ status: 'AVAILABLE', at: getPastIso(30) }],
    },
    {
      requestId: 'req_1007',
      referenceNo: 'SDP-1007',
      sellerId: 'seller_1',
      driverId: 'drv_2', // Sami Odeh has this in progress
      productName: 'Ceramic mug set',
      productDescription:
        'Set of 4 artisan handcrafted ceramic coffee mugs with matte glaze.',
      productImageUrl: generateProductPlaceholderSvg('Ceramic Mugs', '#0D9488'),
      pickup: AMMAN_PRESET_AREAS['Jabal Amman'],
      delivery: AMMAN_PRESET_AREAS.Shmeisani,
      recipientName: 'Layla Salti',
      recipientPhone: '+962 79 555 1007',
      offeredFeeJod: 2.8,
      status: 'ACCEPTED',
      createdAt: getPastIso(80),
      updatedAt: getPastIso(15),
      statusHistory: [
        { status: 'AVAILABLE', at: getPastIso(80) },
        { status: 'ACCEPTED', at: getPastIso(15) },
      ],
    },
    {
      requestId: 'req_1008',
      referenceNo: 'SDP-1008',
      sellerId: 'seller_1',
      driverId: 'drv_3', // Dana Ayyad
      productName: 'Scented candles',
      productDescription:
        'Soy wax lavender and cedarwood aromatherapy candles in amber glass jars.',
      pickup: AMMAN_PRESET_AREAS.Abdoun,
      delivery: AMMAN_PRESET_AREAS.Sweifieh,
      recipientName: 'Rami Habash',
      recipientPhone: '+962 79 555 1008',
      offeredFeeJod: 2.5,
      status: 'PICKED_UP',
      createdAt: getPastIso(110),
      updatedAt: getPastIso(20),
      statusHistory: [
        { status: 'AVAILABLE', at: getPastIso(110) },
        { status: 'ACCEPTED', at: getPastIso(45) },
        { status: 'PICKED_UP', at: getPastIso(20) },
      ],
    },
    {
      requestId: 'req_1009',
      referenceNo: 'SDP-1009',
      sellerId: 'seller_2',
      driverId: 'drv_4', // Khaled Rimawi
      productName: 'Board game',
      productDescription:
        'Family strategy board game brand new in factory plastic wrap.',
      productImageUrl: generateProductPlaceholderSvg('Board Game', '#F59E0B'),
      pickup: AMMAN_PRESET_AREAS.Khalda,
      delivery: AMMAN_PRESET_AREAS["Tla' Al-Ali"],
      recipientName: 'Bassem Rawashdeh',
      recipientPhone: '+962 79 555 1009',
      offeredFeeJod: 2.5,
      status: 'ON_THE_WAY',
      createdAt: getPastIso(95),
      updatedAt: getPastIso(10),
      statusHistory: [
        { status: 'AVAILABLE', at: getPastIso(95) },
        { status: 'ACCEPTED', at: getPastIso(50) },
        { status: 'PICKED_UP', at: getPastIso(25) },
        { status: 'ON_THE_WAY', at: getPastIso(10) },
      ],
    },
    {
      requestId: 'req_1010',
      referenceNo: 'SDP-1010',
      sellerId: 'seller_1',
      driverId: 'drv_1', // Yousef Haddad previously completed this
      productName: 'Silk scarf',
      productDescription:
        'Pure mulberry silk printed scarf with hand-rolled hems.',
      productImageUrl: generateProductPlaceholderSvg('Silk Scarf', '#8B5CF6'),
      pickup: AMMAN_PRESET_AREAS.Downtown,
      delivery: AMMAN_PRESET_AREAS.Jubeiha,
      recipientName: 'Mona Zeid',
      recipientPhone: '+962 79 555 1010',
      offeredFeeJod: 4.5,
      status: 'DELIVERED',
      createdAt: getPastIso(400),
      updatedAt: getPastIso(310),
      statusHistory: [
        { status: 'AVAILABLE', at: getPastIso(400) },
        { status: 'ACCEPTED', at: getPastIso(370) },
        { status: 'PICKED_UP', at: getPastIso(350) },
        { status: 'ON_THE_WAY', at: getPastIso(330) },
        { status: 'DELIVERED', at: getPastIso(310) },
      ],
    },
    {
      requestId: 'req_1011',
      referenceNo: 'SDP-1011',
      sellerId: 'seller_2',
      driverId: 'drv_3',
      productName: 'Herbal tea box',
      productDescription:
        'Specialty herbal loose leaf tea collection (sage, wild thyme, chamomile).',
      pickup: AMMAN_PRESET_AREAS.Abdali,
      delivery: AMMAN_PRESET_AREAS.Abdoun,
      recipientName: 'Salma Dajani',
      recipientPhone: '+962 79 555 1011',
      offeredFeeJod: 2.8,
      status: 'DELIVERED',
      createdAt: getPastIso(520),
      updatedAt: getPastIso(450),
      statusHistory: [
        { status: 'AVAILABLE', at: getPastIso(520) },
        { status: 'ACCEPTED', at: getPastIso(490) },
        { status: 'PICKED_UP', at: getPastIso(475) },
        { status: 'ON_THE_WAY', at: getPastIso(460) },
        { status: 'DELIVERED', at: getPastIso(450) },
      ],
    },
    {
      requestId: 'req_1012',
      referenceNo: 'SDP-1012',
      sellerId: 'seller_1',
      driverId: 'drv_2',
      productName: 'Notebook set',
      productDescription:
        'Three A5 dotted grid softcover journals with fountain-pen friendly 100gsm paper.',
      pickup: AMMAN_PRESET_AREAS.Shmeisani,
      delivery: AMMAN_PRESET_AREAS.Marka,
      recipientName: 'Walid Rifai',
      recipientPhone: '+962 79 555 1012',
      offeredFeeJod: 3.5,
      status: 'DELIVERED',
      createdAt: getPastIso(600),
      updatedAt: getPastIso(520),
      statusHistory: [
        { status: 'AVAILABLE', at: getPastIso(600) },
        { status: 'ACCEPTED', at: getPastIso(570) },
        { status: 'PICKED_UP', at: getPastIso(550) },
        { status: 'ON_THE_WAY', at: getPastIso(535) },
        { status: 'DELIVERED', at: getPastIso(520) },
      ],
    },
  ];

  return {
    users,
    sellers,
    drivers,
    vehicles,
    documents,
    deliveryRequests: deliveryRequests.map((r) => ({ ...r, id: r.requestId })),
    nextRefNumber: 1013,
  };
}
