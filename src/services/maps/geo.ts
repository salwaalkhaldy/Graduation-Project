import { AVG_SPEED_KMH, ROAD_FACTOR } from '../../config/constants';
import { GeoPoint } from '../../types/domain';

/**
 * Calculate Great-Circle (Haversine) distance in kilometers between two geo coordinates
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Estimated road distance applying the ROAD_FACTOR (1.3)
 */
export function calculateRoadDistanceKm(point1: GeoPoint, point2: GeoPoint): number {
  const straightLine = calculateHaversineDistanceKm(
    point1.lat,
    point1.lng,
    point2.lat,
    point2.lng
  );
  return Number((straightLine * ROAD_FACTOR).toFixed(2));
}

/**
 * Estimated travel time in minutes based on AVG_SPEED_KMH (30 km/h)
 * Minimum 1 minute, rounded up.
 */
export function calculateTravelTimeMin(distanceKm: number): number {
  if (distanceKm <= 0) return 1;
  let effectiveSpeed = AVG_SPEED_KMH;
  if (distanceKm < 10) {
    effectiveSpeed = 35; // Intra-city urban traffic
  } else if (distanceKm < 50) {
    effectiveSpeed = 55; // Metro corridor / suburban arterial
  } else if (distanceKm < 120) {
    effectiveSpeed = 75; // Inter-governorate highway (e.g. Amman-Irbid)
  } else {
    effectiveSpeed = 90; // Long-distance expressway (e.g. Desert Highway to Aqaba)
  }
  const timeHours = distanceKm / effectiveSpeed;
  const mins = Math.ceil(timeHours * 60);
  return Math.max(1, mins);
}
