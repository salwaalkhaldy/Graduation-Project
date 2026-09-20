import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Navigation,
  MapPin,
  Flag,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Compass,
  Layers,
  Sparkles,
} from 'lucide-react';
import { JORDAN_BOUNDS, JORDAN_PRESET_AREAS } from '../../config/constants';
import { GOOGLE_MAPS_API_KEY } from '../../config/env';
import { calculateHaversineDistanceKm } from '../../services/maps/geo';
import { GeoPoint } from '../../types/domain';
import { GoogleJordanMap } from './GoogleJordanMap';

export interface MapViewProps {
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

const SVG_WIDTH = 700;
const SVG_HEIGHT = 750;

/**
 * Project Jordan geographic coordinates (lat, lng) to SVG pixel coordinates
 */
function projectToSvg(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - JORDAN_BOUNDS.minLng) / (JORDAN_BOUNDS.maxLng - JORDAN_BOUNDS.minLng)) * SVG_WIDTH;
  const y = (1 - (lat - JORDAN_BOUNDS.minLat) / (JORDAN_BOUNDS.maxLat - JORDAN_BOUNDS.minLat)) * SVG_HEIGHT;
  return { x, y };
}

/**
 * Inverse project SVG pixel coordinates back to Jordan geographic coordinates
 */
function unprojectFromSvg(x: number, y: number): { lat: number; lng: number } {
  const lng = JORDAN_BOUNDS.minLng + (x / SVG_WIDTH) * (JORDAN_BOUNDS.maxLng - JORDAN_BOUNDS.minLng);
  const lat = JORDAN_BOUNDS.minLat + (1 - y / SVG_HEIGHT) * (JORDAN_BOUNDS.maxLat - JORDAN_BOUNDS.minLat);
  return {
    lat: Number(Math.max(29.18, Math.min(32.90, lat)).toFixed(5)),
    lng: Number(Math.max(34.80, Math.min(37.40, lng)).toFixed(5)),
  };
}

export const MapView: React.FC<MapViewProps> = ({
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
  const [mapProvider, setMapProvider] = useState<'google' | 'vector'>('google');
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeRegion, setActiveRegion] = useState<'all' | 'amman' | 'north' | 'south'>('all');

  // Compute marker positions
  const driverPos = driver ? projectToSvg(driver.lat, driver.lng) : null;
  const pickupPos = pickup ? projectToSvg(pickup.lat, pickup.lng) : null;
  const deliveryPos = delivery ? projectToSvg(delivery.lat, delivery.lng) : null;

  // Auto focus on route when delivery points are passed and region is not manually set
  const fitToRoute = useCallback(() => {
    const points: { x: number; y: number }[] = [];
    if (driverPos) points.push(driverPos);
    if (pickupPos) points.push(pickupPos);
    if (deliveryPos) points.push(deliveryPos);

    if (points.length === 0) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setActiveRegion('all');
      return;
    }

    if (points.length === 1) {
      const p = points[0];
      const targetZoom = 1.8;
      const targetX = (SVG_WIDTH / 2 - p.x) * (targetZoom - 1);
      const targetY = (SVG_HEIGHT / 2 - p.y) * (targetZoom - 1);
      setZoom(targetZoom);
      setPan({ x: targetX, y: targetY });
      return;
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const p of points) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }

    const spanX = Math.max(80, maxX - minX);
    const spanY = Math.max(80, maxY - minY);
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    const scaleX = (SVG_WIDTH * 0.6) / spanX;
    const scaleY = (SVG_HEIGHT * 0.6) / spanY;
    const computedZoom = Math.min(2.8, Math.max(1.1, Math.min(scaleX, scaleY)));

    // Center the route
    const offsetX = (SVG_WIDTH / 2 - midX) * computedZoom;
    const offsetY = (SVG_HEIGHT / 2 - midY) * computedZoom;

    setZoom(Number(computedZoom.toFixed(2)));
    setPan({ x: Number(offsetX.toFixed(1)), y: Number(offsetY.toFixed(1)) });
  }, [driverPos, pickupPos, deliveryPos]);

  // Handle preset region view jumps
  const handleSelectRegion = (region: 'all' | 'amman' | 'north' | 'south') => {
    setActiveRegion(region);
    if (region === 'all') {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else if (region === 'amman') {
      // Zoom into Greater Amman & Central Hubs
      const p = projectToSvg(31.96, 35.92);
      setZoom(2.2);
      setPan({
        x: (SVG_WIDTH / 2 - p.x) * 1.2,
        y: (SVG_HEIGHT / 2 - p.y) * 1.2,
      });
    } else if (region === 'north') {
      // Zoom into Irbid, Jerash, Ajloun
      const p = projectToSvg(32.45, 35.85);
      setZoom(2.2);
      setPan({
        x: (SVG_WIDTH / 2 - p.x) * 1.2,
        y: (SVG_HEIGHT / 2 - p.y) * 1.2,
      });
    } else if (region === 'south') {
      // Zoom into Karak, Petra, Aqaba
      const p = projectToSvg(30.30, 35.35);
      setZoom(1.8);
      setPan({
        x: (SVG_WIDTH / 2 - p.x) * 0.9,
        y: (SVG_HEIGHT / 2 - p.y) * 0.9,
      });
    }
  };

  // Handle click on map for pin dropping
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onPick || isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - pan.x) / zoom;
    const clickY = (e.clientY - rect.top - pan.y) / zoom;

    const coords = unprojectFromSvg(clickX, clickY);

    // Find nearest Jordanian landmark or city
    let nearestName = 'Jordan';
    let nearestLabel = 'Jordan';
    let minDistance = Infinity;

    for (const [name, pt] of Object.entries(JORDAN_PRESET_AREAS)) {
      const dist = calculateHaversineDistanceKm(coords.lat, coords.lng, pt.lat, pt.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestName = name;
        nearestLabel = pt.label;
      }
    }

    let label = '';
    if (minDistance < 3.5) {
      label = nearestLabel;
    } else if (minDistance < 20.0) {
      label = `Near ${nearestName}, Jordan (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})`;
    } else {
      label = `Jordan (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`;
    }

    onPick({
      lat: coords.lat,
      lng: coords.lng,
      label,
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(false);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive || e.buttons !== 1) return;
    setIsDragging(true);
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setActiveRegion('all');
  };

  const hasRoutePoints = Boolean(pickup || delivery || driver);

  if (mapProvider === 'google') {
    return (
      <div className={`relative w-full ${className}`} style={{ height }}>
        <GoogleJordanMap
          driver={driver}
          pickup={pickup}
          delivery={delivery}
          activeLeg={activeLeg}
          onPick={onPick}
          height="100%"
          showControls={showControls}
          interactive={interactive}
        />
        {showControls && (
          <div className="absolute bottom-3 left-3 z-20">
            <button
              type="button"
              onClick={() => setMapProvider('vector')}
              className="px-2.5 py-1 bg-white/95 hover:bg-white text-slate-700 text-[11px] font-semibold rounded-lg shadow-sm border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 backdrop-blur-xs"
              title="Switch to Vector Schematic view"
            >
              <Layers className="w-3 h-3 text-slate-500" />
              Vector Schematic
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className={`relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner select-none ${className}`}
    >
      {/* Map provider status badge & Kingdom title */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMapProvider('google')}
          className="flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-xs text-[11px] font-semibold cursor-pointer transition-colors"
        >
          <Sparkles className="w-3 h-3 text-amber-300" />
          Actual Google Map
        </button>

        {/* Region Quick-Jump Chips */}
        {showControls && (
          <div className="hidden sm:flex items-center gap-1 bg-white/90 backdrop-blur-xs p-0.5 rounded-lg border border-slate-200/80 shadow-xs text-[11px]">
            <button
              type="button"
              onClick={() => handleSelectRegion('all')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                activeRegion === 'all'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All Jordan
            </button>
            <button
              type="button"
              onClick={() => handleSelectRegion('amman')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                activeRegion === 'amman'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Amman & Central
            </button>
            <button
              type="button"
              onClick={() => handleSelectRegion('north')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                activeRegion === 'north'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              North (Irbid)
            </button>
            <button
              type="button"
              onClick={() => handleSelectRegion('south')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                activeRegion === 'south'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              South (Aqaba)
            </button>
          </div>
        )}
      </div>

      {/* Map controls */}
      {showControls && (
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1">
          {hasRoutePoints && (
            <button
              type="button"
              onClick={fitToRoute}
              className="w-8 h-8 bg-white hover:bg-teal-50 text-teal-700 hover:text-teal-900 rounded-lg border border-slate-200 shadow-xs flex items-center justify-center transition-colors cursor-pointer"
              title="Focus on Delivery Route"
              aria-label="Focus on Delivery Route"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3.2, z + 0.3))}
            className="w-8 h-8 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 shadow-xs flex items-center justify-center transition-colors cursor-pointer"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.8, z - 0.3))}
            className="w-8 h-8 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 shadow-xs flex items-center justify-center transition-colors cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="w-8 h-8 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 shadow-xs flex items-center justify-center transition-colors cursor-pointer"
            title="Reset to Whole Jordan"
            aria-label="Reset map view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Interactive SVG Canvas */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-full transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
          onClick={handleSvgClick}
        >
          <defs>
            {/* Soft grid background */}
            <pattern id="jordan-grid" width="35" height="35" patternUnits="userSpaceOnUse">
              <path d="M 35 0 L 0 0 0 35" fill="none" stroke="#E2E8F0" strokeWidth="0.75" />
            </pattern>

            {/* Drop shadow for pins */}
            <filter id="map-pin-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodOpacity="0.28" />
            </filter>

            {/* Water gradient for Dead Sea and Gulf of Aqaba */}
            <linearGradient id="dead-sea-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="red-sea-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0369A1" stopOpacity="0.95" />
            </linearGradient>

            {/* Subtle terrain gradient for Jordan plateau */}
            <linearGradient id="jordan-terrain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FAF7F2" />
              <stop offset="60%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#F1F5F9" />
            </linearGradient>
          </defs>

          {/* Map canvas background */}
          <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#jordan-terrain)" />
          <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#jordan-grid)" />

          {/* Jordan Geographical Landmass Outline */}
          <path
            d="
              M 215 50
              L 280 50
              L 338 104
              L 440 100
              L 650 160
              L 670 280
              L 580 340
              L 460 550
              L 300 710
              L 55 720
              L 50 682
              L 65 620
              L 120 540
              L 165 420
              L 180 350
              L 190 280
              L 200 180
              L 210 100
              Z
            "
            fill="#FFFFFF"
            fillOpacity="0.85"
            stroke="#CBD5E1"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Water Bodies of Jordan */}
          {/* 1. Dead Sea (Al-Bahr Al-Mayyit) */}
          <g>
            <path
              d="
                M 195 235
                C 190 250, 192 270, 198 290
                C 202 305, 200 320, 192 335
                C 186 345, 178 350, 170 340
                C 165 325, 168 295, 172 270
                C 176 250, 180 235, 188 230
                Z
              "
              fill="url(#dead-sea-grad)"
              stroke="#0284C7"
              strokeWidth="1.5"
            />
            <text
              x="184"
              y="285"
              fontSize="9"
              fontFamily="sans-serif"
              fontWeight="700"
              fill="#0369A1"
              textAnchor="middle"
              transform="rotate(-85 184 285)"
              letterSpacing="0.08em"
              opacity="0.85"
            >
              DEAD SEA
            </text>
          </g>

          {/* 2. Gulf of Aqaba (Red Sea) */}
          <g>
            <path
              d="
                M 0 670
                L 50 682
                L 45 750
                L 0 750
                Z
              "
              fill="url(#red-sea-grad)"
              stroke="#0369A1"
              strokeWidth="1.5"
            />
            <text
              x="25"
              y="720"
              fontSize="8.5"
              fontFamily="sans-serif"
              fontWeight="700"
              fill="#FFFFFF"
              textAnchor="middle"
              opacity="0.9"
            >
              GULF OF AQABA
            </text>
          </g>

          {/* Major National Highway Corridors across Jordan */}
          <g strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Highway 15: Desert Highway (Aqaba -> Ma'an -> Qatraneh -> QAIA Airport -> Amman -> Zarqa -> Mafraq) */}
            <path
              d="
                M 50 682
                Q 140 600, 220 520
                T 260 400
                T 285 280
                T 266 184
                T 310 162
                T 338 104
              "
              stroke="#94A3B8"
              strokeWidth="4"
              opacity="0.8"
            />
            <path
              d="
                M 50 682
                Q 140 600, 220 520
                T 260 400
                T 285 280
                T 266 184
                T 310 162
                T 338 104
              "
              stroke="#CBD5E1"
              strokeWidth="2"
              opacity="0.9"
            />

            {/* Highway 35: King's Highway (Petra -> Tafilah -> Karak -> Madaba -> Amman) */}
            <path
              d="
                M 155 518
                Q 175 435, 195 385
                T 217 342
                T 238 232
                T 266 184
              "
              stroke="#CBD5E1"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              opacity="0.75"
            />

            {/* Highway 65: Jordan Valley & Dead Sea Highway (Aqaba -> Ghor Al-Safi -> Dead Sea Resorts -> North) */}
            <path
              d="
                M 50 682
                Q 110 560, 165 490
                T 170 340
                T 188 232
                T 210 100
              "
              stroke="#94A3B8"
              strokeWidth="2"
              opacity="0.65"
            />

            {/* Highway 35 North: Amman -> Jerash -> Irbid -> Ar-Ramtha */}
            <path
              d="
                M 266 184
                Q 260 145, 262 119
                T 251 60
                T 290 60
              "
              stroke="#94A3B8"
              strokeWidth="3.5"
              opacity="0.8"
            />

            {/* Highway 40: Amman/Zarqa -> Sahab -> Azraq Oasis */}
            <path
              d="
                M 266 184
                Q 350 190, 485 208
              "
              stroke="#CBD5E1"
              strokeWidth="2.5"
              opacity="0.7"
            />

            {/* Amman - Zarqa Expressway */}
            <path
              d="
                M 266 184
                Q 288 173, 310 162
              "
              stroke="#0D9488"
              strokeWidth="3"
              opacity="0.75"
            />

            {/* Amman - Salt Highway */}
            <path
              d="
                M 266 184
                Q 240 175, 222 167
              "
              stroke="#94A3B8"
              strokeWidth="2.5"
              opacity="0.75"
            />
          </g>

          {/* Highway Route Numbers (Badges) */}
          <g pointerEvents="none" opacity="0.7">
            {/* Route 15 Badge */}
            <rect x="235" y="325" width="22" height="12" rx="3" fill="#64748B" />
            <text x="246" y="334" fontSize="8" fontWeight="700" fill="#FFFFFF" textAnchor="middle">
              15
            </text>

            {/* Route 35 Badge */}
            <rect x="272" y="105" width="22" height="12" rx="3" fill="#64748B" />
            <text x="283" y="114" fontSize="8" fontWeight="700" fill="#FFFFFF" textAnchor="middle">
              35
            </text>

            {/* Route 65 Badge */}
            <rect x="150" y="440" width="22" height="12" rx="3" fill="#64748B" />
            <text x="161" y="449" fontSize="8" fontWeight="700" fill="#FFFFFF" textAnchor="middle">
              65
            </text>
          </g>

          {/* Major Jordanian Governorates & Cities Markers */}
          {Object.entries(JORDAN_PRESET_AREAS).map(([name, pt]) => {
            const pos = projectToSvg(pt.lat, pt.lng);
            const isCapital = name === 'Abdali' || name === 'Downtown';
            const isMajor = pt.isMajorCity;

            // Only show major city pins to keep map clear, unless zoomed in
            if (!isMajor && zoom < 1.6) return null;

            return (
              <g
                key={name}
                opacity={isCapital ? 1 : isMajor ? 0.9 : 0.65}
                pointerEvents="none"
              >
                {/* Node dot */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isCapital ? 4.5 : isMajor ? 3.5 : 2}
                  fill={isCapital ? '#0F766E' : isMajor ? '#475569' : '#94A3B8'}
                  stroke="#FFFFFF"
                  strokeWidth={isCapital ? 2 : 1.5}
                />

                {/* City name text label */}
                <text
                  x={pos.x}
                  y={pos.y - (isCapital ? 9 : 7)}
                  fontSize={isCapital ? '11.5' : isMajor ? '9.5' : '8'}
                  fontFamily="sans-serif"
                  fontWeight={isCapital ? '800' : isMajor ? '700' : '500'}
                  fill={isCapital ? '#0F766E' : isMajor ? '#1E293B' : '#64748B'}
                  textAnchor="middle"
                  paintOrder="stroke"
                  stroke="#FFFFFF"
                  strokeWidth={isCapital ? 3.5 : 2.5}
                  strokeLinejoin="round"
                >
                  {isCapital && name === 'Abdali' ? 'AMMAN (Capital)' : name === 'Downtown' ? '' : name}
                </text>
              </g>
            );
          })}

          {/* Route Leg 1: Driver -> Pickup */}
          {driverPos && pickupPos && (
            <g>
              <path
                d={`M ${driverPos.x} ${driverPos.y} Q ${(driverPos.x + pickupPos.x) / 2 + 10} ${
                  (driverPos.y + pickupPos.y) / 2 - 12
                } ${pickupPos.x} ${pickupPos.y}`}
                fill="none"
                stroke={activeLeg === 'TO_PICKUP' ? '#0F766E' : '#64748B'}
                strokeWidth={activeLeg === 'TO_PICKUP' ? '4.5' : '3'}
                strokeDasharray={activeLeg === 'TO_PICKUP' ? '7 4' : '4 4'}
                className={activeLeg === 'TO_PICKUP' ? 'animate-[dash_1s_linear_infinite]' : ''}
              />
            </g>
          )}

          {/* Route Leg 2: Pickup -> Delivery */}
          {pickupPos && deliveryPos && (
            <g>
              <path
                d={`M ${pickupPos.x} ${pickupPos.y} Q ${(pickupPos.x + deliveryPos.x) / 2 - 15} ${
                  (pickupPos.y + deliveryPos.y) / 2 + 15
                } ${deliveryPos.x} ${deliveryPos.y}`}
                fill="none"
                stroke={activeLeg === 'TO_DELIVERY' ? '#0F766E' : '#14B8A6'}
                strokeWidth={activeLeg === 'TO_DELIVERY' ? '4.5' : '3.5'}
                strokeDasharray={
                  activeLeg === 'TO_PICKUP'
                    ? '5 5'
                    : activeLeg === 'TO_DELIVERY'
                    ? 'none'
                    : 'none'
                }
                className={activeLeg === 'TO_DELIVERY' ? 'animate-[dash_1s_linear_infinite]' : ''}
              />
            </g>
          )}

          {/* Delivery Markers Layer */}

          {/* Driver Marker */}
          {driverPos && (
            <g transform={`translate(${driverPos.x}, ${driverPos.y})`} filter="url(#map-pin-shadow)">
              <circle r="16" fill="#0284C7" fillOpacity="0.25" className="animate-ping" />
              <circle r="10" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2.5" />
              <circle r="4.5" fill="#FFFFFF" />
              <text
                y="20"
                fontSize="10"
                fontWeight="800"
                fill="#0369A1"
                textAnchor="middle"
                paintOrder="stroke"
                stroke="#FFFFFF"
                strokeWidth="3"
              >
                Driver
              </text>
            </g>
          )}

          {/* Pickup Marker */}
          {pickupPos && (
            <g transform={`translate(${pickupPos.x}, ${pickupPos.y})`} filter="url(#map-pin-shadow)">
              <circle r="8" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M -5 -18 L 5 -18 L 0 -7 Z" fill="#F59E0B" />
              <circle cx="0" cy="-18" r="7" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="0" cy="-18" r="2.8" fill="#FFFFFF" />
              <text
                y="18"
                fontSize="10"
                fontWeight="800"
                fill="#B45309"
                textAnchor="middle"
                paintOrder="stroke"
                stroke="#FFFFFF"
                strokeWidth="3"
              >
                Pickup
              </text>
            </g>
          )}

          {/* Customer Delivery Marker */}
          {deliveryPos && (
            <g transform={`translate(${deliveryPos.x}, ${deliveryPos.y})`} filter="url(#map-pin-shadow)">
              <circle r="8" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M 0 0 L 0 -22 L 10 -16 L 0 -10 Z" fill="#10B981" stroke="#047857" strokeWidth="1.2" />
              <text
                y="18"
                fontSize="10"
                fontWeight="800"
                fill="#047857"
                textAnchor="middle"
                paintOrder="stroke"
                stroke="#FFFFFF"
                strokeWidth="3"
              >
                Delivery
              </text>
            </g>
          )}

          {/* Compass Rose */}
          <g transform="translate(640, 50)" opacity="0.65" pointerEvents="none">
            <circle r="14" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
            <path d="M 0 -11 L 3 0 L -3 0 Z" fill="#EF4444" />
            <path d="M 0 11 L 3 0 L -3 0 Z" fill="#94A3B8" />
            <text y="-14" fontSize="8" fontWeight="800" fill="#EF4444" textAnchor="middle">
              N
            </text>
          </g>
        </svg>
      </div>

      {/* Legend & Country Coverage Footer */}
      <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-2.5 px-3 py-1.5 bg-white/95 backdrop-blur-xs rounded-lg border border-slate-200 shadow-xs text-[11px] font-medium text-slate-700 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block ring-2 ring-sky-200" />
          <span>Driver</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block ring-2 ring-amber-200" />
          <span>Pickup</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-200" />
          <span>Delivery</span>
        </div>
        <span className="text-slate-300">|</span>
        <span className="text-slate-500 text-[10px]">
          Covers all 12 Jordanian Governorates
        </span>
      </div>
    </div>
  );
};
