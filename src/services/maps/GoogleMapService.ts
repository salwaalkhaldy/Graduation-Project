import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_API_KEY } from '../../config/env';
import { GeoPoint } from '../../types/domain';
import { MapService, RouteResult } from './MapService';
import { MockMapService } from './MockMapService';

declare const google: any;
declare global {
  interface Window {
    google?: any;
  }
}

export class GoogleMapService implements MapService {
  private fallbackService = new MockMapService();
  private isLoaded = false;
  private loadFailed = false;
  private optionsSet = false;

  constructor() {
    if (GOOGLE_MAPS_API_KEY && typeof window !== 'undefined') {
      try {
        setOptions({
          key: GOOGLE_MAPS_API_KEY,
          v: 'weekly',
        });
        this.optionsSet = true;
      } catch (err) {
        console.warn('Google Maps setOptions warning:', err);
      }
    } else if (!GOOGLE_MAPS_API_KEY) {
      this.loadFailed = true;
    }
  }

  private async ensureLoaded(): Promise<boolean> {
    if (this.loadFailed) return false;
    if (this.isLoaded) return true;
    if (typeof window === 'undefined') return false;

    if (window.google?.maps) {
      this.isLoaded = true;
      return true;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      this.loadFailed = true;
      return false;
    }

    try {
      if (!this.optionsSet) {
        setOptions({
          key: GOOGLE_MAPS_API_KEY,
          v: 'weekly',
        });
        this.optionsSet = true;
      }

      await Promise.allSettled([
        importLibrary('maps'),
        importLibrary('places'),
        importLibrary('routes'),
        importLibrary('geometry'),
      ]);

      if (window.google?.maps) {
        this.isLoaded = true;
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Google Maps JS API load failed, falling back to MockMapService', err);
      this.loadFailed = true;
      return false;
    }
  }

  async calculateRoute(
    from: GeoPoint,
    to: GeoPoint
  ): Promise<{ distanceKm: number; durationMin: number }> {
    return this.distanceAndTime(from, to);
  }

  async distanceAndTime(
    from: GeoPoint,
    to: GeoPoint
  ): Promise<{ distanceKm: number; durationMin: number }> {
    const loaded = await this.ensureLoaded();
    if (!loaded || !window.google?.maps) {
      return this.fallbackService.distanceAndTime(from, to);
    }

    try {
      const service = new google.maps.DistanceMatrixService();
      const response = await service.getDistanceMatrix({
        origins: [{ lat: from.lat, lng: from.lng }],
        destinations: [{ lat: to.lat, lng: to.lng }],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
      });

      const element = response.rows[0]?.elements[0];
      if (element?.status === 'OK' && element.distance && element.duration) {
        return {
          distanceKm: Number((element.distance.value / 1000).toFixed(2)),
          durationMin: Math.max(1, Math.ceil(element.duration.value / 60)),
        };
      }
    } catch (err) {
      console.warn('Google Maps distance matrix error, using fallback calculation', err);
    }

    return this.fallbackService.distanceAndTime(from, to);
  }

  async route(points: GeoPoint[]): Promise<RouteResult> {
    const loaded = await this.ensureLoaded();
    if (!loaded || !window.google?.maps || points.length < 2) {
      return this.fallbackService.route(points);
    }

    try {
      const directionsService = new google.maps.DirectionsService();
      const origin = { lat: points[0].lat, lng: points[0].lng };
      const destination = {
        lat: points[points.length - 1].lat,
        lng: points[points.length - 1].lng,
      };
      const waypoints = points.slice(1, -1).map((pt) => ({
        location: { lat: pt.lat, lng: pt.lng },
        stopover: true,
      }));

      const result = await directionsService.route({
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      const route = result.routes[0];
      if (route && route.legs) {
        let totalDist = 0;
        let totalDur = 0;
        const legs = route.legs.map((leg: any) => {
          const dKm = Number(((leg.distance?.value || 0) / 1000).toFixed(2));
          const dMin = Math.max(1, Math.ceil((leg.duration?.value || 0) / 60));
          totalDist += dKm;
          totalDur += dMin;
          const path = (leg.steps || []).flatMap((step: any) =>
            step.path.map((latLng: any) => ({ lat: latLng.lat(), lng: latLng.lng() }))
          );
          return {
            distanceKm: dKm,
            durationMin: dMin,
            path: path.length > 0 ? path : [{ lat: leg.start_location.lat(), lng: leg.start_location.lng() }, { lat: leg.end_location.lat(), lng: leg.end_location.lng() }],
          };
        });

        return {
          legs,
          totalDistanceKm: Number(totalDist.toFixed(2)),
          totalDurationMin: totalDur,
        };
      }
    } catch (err) {
      console.warn('Google Maps DirectionsService error, using fallback routing', err);
    }

    return this.fallbackService.route(points);
  }

  async searchPlaces(query: string): Promise<GeoPoint[]> {
    const loaded = await this.ensureLoaded();
    if (!loaded || !window.google?.maps?.places) {
      return this.fallbackService.searchPlaces(query);
    }

    try {
      const autocompleteService = new google.maps.places.AutocompleteService();
      const predictions = await autocompleteService.getPlacePredictions({
        input: query,
        componentRestrictions: { country: 'jo' },
      });

      if (predictions?.predictions?.length) {
        const geocoder = new google.maps.Geocoder();
        const results: GeoPoint[] = [];

        for (const pred of predictions.predictions.slice(0, 5)) {
          const geoRes = await geocoder.geocode({ placeId: pred.place_id });
          const loc = geoRes.results[0]?.geometry?.location;
          if (loc) {
            results.push({
              lat: loc.lat(),
              lng: loc.lng(),
              label: pred.description,
            });
          }
        }
        if (results.length > 0) return results;
      }
    } catch (err) {
      console.warn('Google Places search error, falling back', err);
    }

    return this.fallbackService.searchPlaces(query);
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    const loaded = await this.ensureLoaded();
    if (!loaded || !window.google?.maps) {
      return this.fallbackService.reverseGeocode(lat, lng);
    }

    try {
      const geocoder = new google.maps.Geocoder();
      const res = await geocoder.geocode({ location: { lat, lng } });
      if (res.results[0]?.formatted_address) {
        return res.results[0].formatted_address;
      }
    } catch (err) {
      console.warn('Google reverse geocode error, using fallback', err);
    }

    return this.fallbackService.reverseGeocode(lat, lng);
  }
}

export const activeMapService: MapService = GOOGLE_MAPS_API_KEY
  ? new GoogleMapService()
  : new MockMapService();
