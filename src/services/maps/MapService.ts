import { GeoPoint } from '../../types/domain';

export interface RouteLeg {
  distanceKm: number;
  durationMin: number;
  path: { lat: number; lng: number }[];
}

export interface RouteResult {
  legs: RouteLeg[];
  totalDistanceKm: number;
  totalDurationMin: number;
}

export interface MapService {
  distanceAndTime(
    from: GeoPoint,
    to: GeoPoint
  ): Promise<{ distanceKm: number; durationMin: number }>;
  calculateRoute(
    from: GeoPoint,
    to: GeoPoint
  ): Promise<{ distanceKm: number; durationMin: number }>;
  route(points: GeoPoint[]): Promise<RouteResult>;
  searchPlaces(query: string): Promise<GeoPoint[]>;
  reverseGeocode(lat: number, lng: number): Promise<string>;
}
