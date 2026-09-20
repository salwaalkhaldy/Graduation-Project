/// <reference types="@types/google.maps" />
import React, { useEffect, useState, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
  ControlPosition,
  MapControl,
} from '@vis.gl/react-google-maps';
import {
  Store,
  Flag,
  Navigation,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { GOOGLE_MAPS_API_KEY } from '../../config/env';
import { GeoPoint } from '../../types/domain';
import { JORDAN_PRESET_AREAS } from '../../config/constants';
import { calculateHaversineDistanceKm } from '../../services/maps/geo';

export interface GoogleJordanMapProps {
  driver?: GeoPoint;
  pickup?: GeoPoint;
  delivery?: GeoPoint;
  activeLeg?: 'TO_PICKUP' | 'TO_DELIVERY' | 'ALL';
  onPick?: (point: GeoPoint) => void;
  height?: string;
  className?: string;
  showControls?: boolean;
  interactive?: boolean;
}

// Center of Jordan / Amman
const JORDAN_DEFAULT_CENTER = { lat: 31.9539, lng: 35.9106 };
const JORDAN_DEFAULT_ZOOM = 8;

/**
 * Reverse geocode click coordinates to closest Jordan area/city label
 */
function resolveJordanLabel(lat: number, lng: number): string {
  let minDistance = Infinity;
  let nearestName = 'Amman';
  let nearestLabel = 'Amman, Jordan';

  for (const [name, pt] of Object.entries(JORDAN_PRESET_AREAS)) {
    const dist = calculateHaversineDistanceKm(lat, lng, pt.lat, pt.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestName = name;
      nearestLabel = pt.label;
    }
  }

  if (minDistance < 3.5) {
    return nearestLabel;
  } else if (minDistance < 25.0) {
    return `Near ${nearestName}, Jordan (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
  }
  return `Jordan (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

/**
 * Bounds & Camera auto-adjuster
 */
function FitBoundsController({
  driver,
  pickup,
  delivery,
}: {
  driver?: GeoPoint;
  pickup?: GeoPoint;
  delivery?: GeoPoint;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const points: GeoPoint[] = [];
    if (pickup) points.push(pickup);
    if (delivery) points.push(delivery);
    if (driver) points.push(driver);

    if (points.length === 0) {
      map.setCenter(JORDAN_DEFAULT_CENTER);
      map.setZoom(JORDAN_DEFAULT_ZOOM);
      return;
    }

    if (points.length === 1) {
      map.setCenter({ lat: points[0].lat, lng: points[0].lng });
      map.setZoom(13);
      return;
    }

    // When multiple points exist, fit bounds with generous padding
    try {
      if (typeof google !== 'undefined' && google.maps?.LatLngBounds) {
        const bounds = new google.maps.LatLngBounds();
        points.forEach((pt) => bounds.extend({ lat: pt.lat, lng: pt.lng }));
        map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
      }
    } catch {
      // Fallback center
      map.setCenter({ lat: points[0].lat, lng: points[0].lng });
      map.setZoom(10);
    }
  }, [map, driver?.lat, driver?.lng, pickup?.lat, pickup?.lng, delivery?.lat, delivery?.lng]);

  return null;
}

/**
 * Driving directions renderer for Jordan road network
 */
function JordanDirectionsRenderer({
  driver,
  pickup,
  delivery,
  activeLeg = 'ALL',
  onRouteComputed,
}: {
  driver?: GeoPoint;
  pickup?: GeoPoint;
  delivery?: GeoPoint;
  activeLeg?: 'TO_PICKUP' | 'TO_DELIVERY' | 'ALL';
  onRouteComputed?: (info: { distanceText: string; durationText: string }) => void;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!routesLib || !map) return;

    if (!rendererRef.current) {
      rendererRef.current = new routesLib.DirectionsRenderer({
        map,
        suppressMarkers: true, // We render custom AdvancedMarkers
        preserveViewport: true,
        polylineOptions: {
          strokeColor: '#0D9488', // Emerald/teal
          strokeWeight: 5,
          strokeOpacity: 0.85,
        },
      });
    }

    const renderer = rendererRef.current;

    // Determine Origin and Destination based on activeLeg
    let origin: google.maps.LatLngLiteral | null = null;
    let destination: google.maps.LatLngLiteral | null = null;
    let waypoints: google.maps.DirectionsWaypoint[] = [];

    if (activeLeg === 'TO_PICKUP' && driver && pickup) {
      origin = { lat: driver.lat, lng: driver.lng };
      destination = { lat: pickup.lat, lng: pickup.lng };
    } else if (activeLeg === 'TO_DELIVERY' && driver && delivery) {
      origin = { lat: driver.lat, lng: driver.lng };
      destination = { lat: delivery.lat, lng: delivery.lng };
    } else if (pickup && delivery) {
      origin = { lat: pickup.lat, lng: pickup.lng };
      destination = { lat: delivery.lat, lng: delivery.lng };
      if (driver && activeLeg === 'ALL') {
        waypoints = [{ location: { lat: driver.lat, lng: driver.lng }, stopover: false }];
      }
    }

    if (!origin || !destination) {
      renderer.setDirections({ routes: [] } as any);
      return;
    }

    const directionsService = new routesLib.DirectionsService();
    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          renderer.setDirections(result);
          const leg = result.routes[0]?.legs[0];
          if (leg && onRouteComputed) {
            onRouteComputed({
              distanceText: leg.distance?.text || '',
              durationText: leg.duration?.text || '',
            });
          }
        }
      }
    );

    return () => {
      if (renderer) {
        renderer.setMap(null);
        rendererRef.current = null;
      }
    };
  }, [routesLib, map, driver?.lat, driver?.lng, pickup?.lat, pickup?.lng, delivery?.lat, delivery?.lng, activeLeg, onRouteComputed]);

  return null;
}

export const GoogleJordanMap: React.FC<GoogleJordanMapProps> = ({
  driver,
  pickup,
  delivery,
  activeLeg = 'ALL',
  onPick,
  height = '380px',
  className = '',
  showControls = true,
  interactive = true,
}) => {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [routeInfo, setRouteInfo] = useState<{ distanceText: string; durationText: string } | null>(null);
  const [activeRegion, setActiveRegion] = useState<string>('all');
  const mapRef = useRef<google.maps.Map | null>(null);

  const handleRegionJump = (regionKey: string, lat: number, lng: number, zoom: number) => {
    setActiveRegion(regionKey);
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(zoom);
    }
  };

  return (
    <div
      id="google-jordan-map-container"
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 ${className}`}
      style={{ height }}
    >
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          id="jordan-actual-google-map"
          mapId="sdp_jordan_map"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          defaultCenter={JORDAN_DEFAULT_CENTER}
          defaultZoom={JORDAN_DEFAULT_ZOOM}
          mapTypeId={mapType}
          gestureHandling={interactive ? 'greedy' : 'none'}
          disableDefaultUI={!showControls}
          fullscreenControl={false}
          streetViewControl={false}
          mapTypeControl={false}
          zoomControl={showControls}
          style={{ width: '100%', height: '100%' }}
          onClick={(e) => {
            if (interactive && onPick && e.detail.latLng) {
              const lat = Number(e.detail.latLng.lat.toFixed(5));
              const lng = Number(e.detail.latLng.lng.toFixed(5));
              const label = resolveJordanLabel(lat, lng);
              onPick({ lat, lng, label });
            }
          }}
        >
          {/* Automatic bounds framing */}
          <FitBoundsController driver={driver} pickup={pickup} delivery={delivery} />

          {/* Actual Jordan road navigation routing */}
          <JordanDirectionsRenderer
            driver={driver}
            pickup={pickup}
            delivery={delivery}
            activeLeg={activeLeg}
            onRouteComputed={setRouteInfo}
          />

          {/* Pickup Merchant Marker */}
          {pickup && (
            <AdvancedMarker
              position={{ lat: pickup.lat, lng: pickup.lng }}
              title="Pickup Location (Store / Hub)"
            >
              <div className="flex flex-col items-center group cursor-pointer">
                <div className="bg-emerald-600 text-white p-2 rounded-full shadow-lg border-2 border-white ring-2 ring-emerald-500/30 transition-transform group-hover:scale-110">
                  <Store className="w-4 h-4" />
                </div>
                <div className="bg-emerald-950/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 shadow-md whitespace-nowrap">
                  Pickup Hub
                </div>
              </div>
            </AdvancedMarker>
          )}

          {/* Delivery Destination Marker */}
          {delivery && (
            <AdvancedMarker
              position={{ lat: delivery.lat, lng: delivery.lng }}
              title="Customer Delivery Destination"
            >
              <div className="flex flex-col items-center group cursor-pointer">
                <div className="bg-amber-500 text-white p-2 rounded-full shadow-lg border-2 border-white ring-2 ring-amber-500/30 transition-transform group-hover:scale-110">
                  <Flag className="w-4 h-4" />
                </div>
                <div className="bg-amber-950/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 shadow-md whitespace-nowrap">
                  Delivery Drop-off
                </div>
              </div>
            </AdvancedMarker>
          )}

          {/* Courier Driver Marker */}
          {driver && (
            <AdvancedMarker
              position={{ lat: driver.lat, lng: driver.lng }}
              title="Active Delivery Driver"
            >
              <div className="relative flex flex-col items-center group cursor-pointer">
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                </span>
                <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white ring-2 ring-blue-500/30 transition-transform group-hover:scale-110">
                  <Navigation className="w-4 h-4" />
                </div>
                <div className="bg-blue-950/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 shadow-md whitespace-nowrap">
                  Courier
                </div>
              </div>
            </AdvancedMarker>
          )}

          {/* Map Controls */}
          {showControls && (
            <MapControl position={ControlPosition.TOP_LEFT}>
              <div className="m-3 flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-xl shadow-md border border-slate-200">
                <button
                  type="button"
                  onClick={() => setMapType('roadmap')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    mapType === 'roadmap'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Roadmap
                </button>
                <button
                  type="button"
                  onClick={() => setMapType('hybrid')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    mapType === 'hybrid'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Satellite
                </button>
              </div>
            </MapControl>
          )}
        </Map>
      </APIProvider>

      {/* Floating Jordan Region Quick Jumps */}
      {showControls && (
        <div className="absolute top-3 right-3 z-10 hidden sm:flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-xl shadow-md border border-slate-200">
          <button
            type="button"
            onClick={() => handleRegionJump('all', 31.9539, 35.9106, 8)}
            className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-colors ${
              activeRegion === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Jordan 🇯🇴
          </button>
          <button
            type="button"
            onClick={() => handleRegionJump('amman', 31.9539, 35.9106, 12)}
            className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-colors ${
              activeRegion === 'amman'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Amman
          </button>
          <button
            type="button"
            onClick={() => handleRegionJump('north', 32.5568, 35.8469, 11)}
            className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-colors ${
              activeRegion === 'north'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Irbid & North
          </button>
          <button
            type="button"
            onClick={() => handleRegionJump('south', 29.5319, 35.0061, 10)}
            className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-colors ${
              activeRegion === 'south'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Aqaba & South
          </button>
        </div>
      )}

      {/* Route distance and duration banner */}
      {routeInfo && (routeInfo.distanceText || routeInfo.durationText) && (
        <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 backdrop-blur-xs text-white px-3 py-1.5 rounded-xl shadow-lg border border-slate-700/50 flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Live Jordan Highway Route
          </span>
          <span className="text-slate-300">
            Distance: <strong className="text-white">{routeInfo.distanceText}</strong>
          </span>
          <span className="text-slate-300">
            ETA: <strong className="text-white">{routeInfo.durationText}</strong>
          </span>
        </div>
      )}

      {/* Location picker hint */}
      {interactive && onPick && (
        <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-xs text-slate-700 px-3 py-1 rounded-lg shadow-md border border-slate-200 text-[11px] flex items-center gap-1.5 font-medium">
          <MapPin className="w-3 h-3 text-emerald-600" />
          Click anywhere in Jordan to drop pin
        </div>
      )}
    </div>
  );
};
