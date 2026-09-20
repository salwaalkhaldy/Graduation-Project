import { GeoPoint, VehicleType } from '../types/domain';

export const NEARBY_RADIUS_KM = 25;
export const PROXIMITY_RADIUS_KM = NEARBY_RADIUS_KM;
export const ROAD_FACTOR = 1.3;
export const AVG_SPEED_KMH = 45;
export const SELLER_POLL_MS = 5000;
export const DRIVER_POLL_MS = 10000;

export const MIN_OFFERED_FEE_JOD = 0.5;
export const MAX_OFFERED_FEE_JOD = 150.0;

export const ADMIN_DRIVERS_PER_PAGE = 8;

// Coordinate bounds for the entire Hashemite Kingdom of Jordan
export const JORDAN_BOUNDS = {
  minLat: 29.20,
  maxLat: 32.85,
  minLng: 34.80,
  maxLng: 37.30,
};

export interface JordanLocation extends GeoPoint {
  governorate: string;
  region: 'North' | 'Central' | 'South' | 'East';
  isMajorCity?: boolean;
}

export const JORDAN_PRESET_AREAS: Record<string, JordanLocation> = {
  // --- Greater Amman Governorate ---
  Abdali: { lat: 31.9539, lng: 35.9106, label: 'Abdali, Amman', governorate: 'Amman', region: 'Central', isMajorCity: true },
  Shmeisani: { lat: 31.9680, lng: 35.9070, label: 'Shmeisani, Amman', governorate: 'Amman', region: 'Central' },
  'Jabal Amman': { lat: 31.9530, lng: 35.9240, label: 'Jabal Amman (Rainbow St.), Amman', governorate: 'Amman', region: 'Central' },
  Downtown: { lat: 31.9515, lng: 35.9380, label: 'Downtown (Al-Balad), Amman', governorate: 'Amman', region: 'Central', isMajorCity: true },
  Abdoun: { lat: 31.9410, lng: 35.8880, label: 'Abdoun, Amman', governorate: 'Amman', region: 'Central' },
  Sweifieh: { lat: 31.9370, lng: 35.8590, label: 'Sweifieh, Amman', governorate: 'Amman', region: 'Central' },
  "Tla' Al-Ali": { lat: 31.9900, lng: 35.8700, label: "Tla' Al-Ali, Amman", governorate: 'Amman', region: 'Central' },
  Khalda: { lat: 31.9930, lng: 35.8330, label: 'Khalda, Amman', governorate: 'Amman', region: 'Central' },
  Marka: { lat: 31.9750, lng: 35.9900, label: 'Marka, Amman', governorate: 'Amman', region: 'Central' },
  Jubeiha: { lat: 32.0170, lng: 35.8730, label: 'Jubeiha, Amman', governorate: 'Amman', region: 'Central' },
  'Airport (QAIA)': { lat: 31.7226, lng: 35.9932, label: 'Queen Alia International Airport (QAIA)', governorate: 'Amman', region: 'Central' },

  // --- Zarqa Governorate ---
  'Zarqa City': { lat: 32.0608, lng: 36.0942, label: 'Zarqa City Center', governorate: 'Zarqa', region: 'Central', isMajorCity: true },
  'New Zarqa': { lat: 32.0833, lng: 36.0833, label: 'New Zarqa (Zarqa Al-Jadida)', governorate: 'Zarqa', region: 'Central' },
  Russeifa: { lat: 32.0178, lng: 36.0464, label: 'Russeifa, Zarqa', governorate: 'Zarqa', region: 'Central' },

  // --- Balqa Governorate ---
  'Al-Salt': { lat: 32.0392, lng: 35.7272, label: 'Al-Salt City Center', governorate: 'Balqa', region: 'Central', isMajorCity: true },
  Fuheis: { lat: 32.0033, lng: 35.7725, label: 'Fuheis, Balqa', governorate: 'Balqa', region: 'Central' },

  // --- Madaba Governorate ---
  Madaba: { lat: 31.7195, lng: 35.7941, label: 'Madaba City Center', governorate: 'Madaba', region: 'Central', isMajorCity: true },
  'Mount Nebo': { lat: 31.7683, lng: 35.7253, label: 'Mount Nebo, Madaba', governorate: 'Madaba', region: 'Central' },

  // --- Dead Sea & Jordan Valley ---
  'Dead Sea': { lat: 31.7200, lng: 35.5800, label: 'Dead Sea Hotels & Resort Strip', governorate: 'Balqa', region: 'Central', isMajorCity: true },
  'Ghor Al-Safi': { lat: 31.0360, lng: 35.4850, label: 'Ghor Al-Safi, Southern Jordan Valley', governorate: 'Karak', region: 'South' },

  // --- North Region: Irbid, Jerash, Ajloun, Mafraq ---
  Irbid: { lat: 32.5568, lng: 35.8469, label: 'Irbid City Center (Yarmouk)', governorate: 'Irbid', region: 'North', isMajorCity: true },
  'Ar-Ramtha': { lat: 32.5570, lng: 36.0070, label: 'Ar-Ramtha, Irbid', governorate: 'Irbid', region: 'North' },
  Jerash: { lat: 32.2723, lng: 35.8914, label: 'Jerash City Center (Roman Ruins)', governorate: 'Jerash', region: 'North', isMajorCity: true },
  Ajloun: { lat: 32.3326, lng: 35.7517, label: 'Ajloun (Castle & City Center)', governorate: 'Ajloun', region: 'North', isMajorCity: true },
  'Al-Mafraq': { lat: 32.3438, lng: 36.2081, label: 'Al-Mafraq City Center', governorate: 'Mafraq', region: 'North', isMajorCity: true },

  // --- South Region: Karak, Tafilah, Ma'an, Petra, Aqaba ---
  'Al-Karak': { lat: 31.1853, lng: 35.7048, label: 'Al-Karak (Castle & City Center)', governorate: 'Karak', region: 'South', isMajorCity: true },
  'At-Tafilah': { lat: 30.8375, lng: 35.6044, label: 'At-Tafilah City Center', governorate: 'Tafilah', region: 'South', isMajorCity: true },
  "Ma'an": { lat: 30.1927, lng: 35.7360, label: "Ma'an City Center", governorate: "Ma'an", region: 'South', isMajorCity: true },
  'Petra': { lat: 30.3285, lng: 35.4444, label: 'Wadi Musa / Petra', governorate: "Ma'an", region: 'South', isMajorCity: true },
  Aqaba: { lat: 29.5321, lng: 35.0063, label: 'Aqaba City Center & Port', governorate: 'Aqaba', region: 'South', isMajorCity: true },
  'Tala Bay': { lat: 29.4120, lng: 34.9780, label: 'Tala Bay, Aqaba', governorate: 'Aqaba', region: 'South' },

  // --- Eastern Region ---
  'Al-Azraq': { lat: 31.8340, lng: 36.8200, label: 'Al-Azraq Oasis', governorate: 'Zarqa', region: 'East', isMajorCity: true },
};

// Backward-compatible alias for existing references
export const AMMAN_PRESET_AREAS: Record<string, GeoPoint> = {
  Abdali: JORDAN_PRESET_AREAS.Abdali,
  Shmeisani: JORDAN_PRESET_AREAS.Shmeisani,
  'Jabal Amman': JORDAN_PRESET_AREAS['Jabal Amman'],
  Downtown: JORDAN_PRESET_AREAS.Downtown,
  Abdoun: JORDAN_PRESET_AREAS.Abdoun,
  Sweifieh: JORDAN_PRESET_AREAS.Sweifieh,
  "Tla' Al-Ali": JORDAN_PRESET_AREAS["Tla' Al-Ali"],
  Khalda: JORDAN_PRESET_AREAS.Khalda,
  Marka: JORDAN_PRESET_AREAS.Marka,
  Jubeiha: JORDAN_PRESET_AREAS.Jubeiha,
  'Al-Salt': JORDAN_PRESET_AREAS['Al-Salt'],
};

export const DEFAULT_DRIVER_LOCATION: GeoPoint = JORDAN_PRESET_AREAS.Abdali;

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  CAR: 'Car',
  MOTORCYCLE: 'Motorcycle',
  VAN: 'Van',
  BICYCLE: 'Bicycle',
};

export const VEHICLE_TYPES: { value: VehicleType; label: string; capacityDescription: string }[] = [
  { value: 'CAR', label: 'Car', capacityDescription: 'Standard parcels & multi-drop' },
  { value: 'MOTORCYCLE', label: 'Motorcycle', capacityDescription: 'Fast courier & express' },
  { value: 'VAN', label: 'Van', capacityDescription: 'Bulky crates & cargo' },
  { value: 'BICYCLE', label: 'Bicycle', capacityDescription: 'Eco local courier' },
];
