import { JORDAN_PRESET_AREAS } from '../../config/constants';
import { GeoPoint } from '../../types/domain';
import {
  calculateHaversineDistanceKm,
  calculateRoadDistanceKm,
  calculateTravelTimeMin,
} from './geo';
import { MapService, RouteLeg, RouteResult } from './MapService';

export class MockMapService implements MapService {
  async distanceAndTime(
    from: GeoPoint,
    to: GeoPoint
  ): Promise<{ distanceKm: number; durationMin: number }> {
    const distanceKm = calculateRoadDistanceKm(from, to);
    const durationMin = calculateTravelTimeMin(distanceKm);
    return { distanceKm, durationMin };
  }

  async calculateRoute(
    from: GeoPoint,
    to: GeoPoint
  ): Promise<{ distanceKm: number; durationMin: number }> {
    return this.distanceAndTime(from, to);
  }

  async route(points: GeoPoint[]): Promise<RouteResult> {
    if (points.length < 2) {
      return { legs: [], totalDistanceKm: 0, totalDurationMin: 0 };
    }

    const legs: RouteLeg[] = [];
    let totalDistanceKm = 0;
    let totalDurationMin = 0;

    for (let i = 0; i < points.length - 1; i++) {
      const from = points[i];
      const to = points[i + 1];
      const legDist = calculateRoadDistanceKm(from, to);
      const legDur = calculateTravelTimeMin(legDist);

      totalDistanceKm += legDist;
      totalDurationMin += legDur;

      // Generate curved realistic waypoints
      const path: { lat: number; lng: number }[] = [];
      const steps = 8;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        // subtle curvature simulating roads
        const curveOffset = Math.sin(t * Math.PI) * 0.004 * ((i % 2 === 0) ? 1 : -1);
        const lat = from.lat + (to.lat - from.lat) * t + curveOffset;
        const lng = from.lng + (to.lng - from.lng) * t + curveOffset * 0.8;
        path.push({ lat, lng });
      }

      legs.push({
        distanceKm: legDist,
        durationMin: legDur,
        path,
      });
    }

    return {
      legs,
      totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
      totalDurationMin,
    };
  }

  async searchPlaces(query: string): Promise<GeoPoint[]> {
    const q = query.trim().toLowerCase();
    if (!q) {
      return Object.values(JORDAN_PRESET_AREAS).slice(0, 8);
    }
    return Object.entries(JORDAN_PRESET_AREAS)
      .filter(
        ([key, pt]) =>
          key.toLowerCase().includes(q) ||
          pt.label.toLowerCase().includes(q) ||
          pt.governorate.toLowerCase().includes(q) ||
          pt.region.toLowerCase().includes(q)
      )
      .map(([, pt]) => pt);
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    // Find closest preset area in Jordan
    let closestName = 'Jordan';
    let closestLabel = 'Jordan';
    let minDistance = Infinity;

    for (const [name, pt] of Object.entries(JORDAN_PRESET_AREAS)) {
      const dist = calculateHaversineDistanceKm(lat, lng, pt.lat, pt.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestName = name;
        closestLabel = pt.label;
      }
    }

    if (minDistance < 3.0) {
      return closestLabel;
    }
    if (minDistance < 15.0) {
      return `Near ${closestName}, Jordan (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
    }
    return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)}), Jordan`;
  }
}
