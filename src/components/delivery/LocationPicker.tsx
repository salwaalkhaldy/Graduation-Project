import React, { useState } from 'react';
import { MapPin, Navigation, Search, Map as MapIcon, Check } from 'lucide-react';
import { JORDAN_PRESET_AREAS, JordanLocation } from '../../config/constants';
import { GeoPoint } from '../../types/domain';
import { MapView } from '../maps/MapView';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export interface LocationPickerProps {
  label: string;
  value: GeoPoint | null;
  onChange: (point: GeoPoint) => void;
  error?: string;
  allowCurrentLocation?: boolean;
  required?: boolean;
  hint?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  label,
  value,
  onChange,
  error,
  allowCurrentLocation = false,
  required = false,
  hint,
}) => {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [tempPoint, setTempPoint] = useState<GeoPoint | null>(value);
  const [isLocating, setIsLocating] = useState(false);

  // Filter preset areas based on search query across all Jordan
  const filteredPresets = Object.entries(JORDAN_PRESET_AREAS).filter(([name, pt]) => {
    const q = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(q) ||
      pt.label.toLowerCase().includes(q) ||
      pt.governorate.toLowerCase().includes(q) ||
      pt.region.toLowerCase().includes(q)
    );
  });

  const handleSelectPreset = (point: GeoPoint) => {
    onChange(point);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const pt: GeoPoint = {
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
          label: `GPS Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
        };
        onChange(pt);
      },
      () => {
        setIsLocating(false);
        // Fallback to Abdali preset in Amman
        onChange(JORDAN_PRESET_AREAS.Abdali);
      },
      { timeout: 7000 }
    );
  };

  const handleMapConfirm = () => {
    if (tempPoint) {
      onChange(tempPoint);
    }
    setIsMapModalOpen(false);
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 select-none">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
        {allowCurrentLocation && (
          <button
            type="button"
            onClick={handleCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1 text-xs text-teal-700 font-semibold hover:text-teal-800 transition-colors cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{isLocating ? 'Locating...' : 'Use current location'}</span>
          </button>
        )}
      </div>

      <div className="relative">
        <div className="flex items-center gap-2">
          {/* Main search / selection input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={value ? value.label : 'Search any Jordan city, governorate, or area...'}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className={`w-full rounded-lg border bg-white pl-9 pr-3 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 ${
                error
                  ? 'border-rose-400 focus:ring-rose-500'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            />
          </div>

          {/* Pick on map button */}
          <Button
            variant="outline"
            size="md"
            type="button"
            onClick={() => {
              setTempPoint(value);
              setIsMapModalOpen(true);
            }}
            leftIcon={<MapIcon className="w-4 h-4 text-teal-700" />}
          >
            Map
          </Button>
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-xl border border-slate-200 shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100">
              <div className="p-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 flex items-center justify-between">
                <span>Locations Across Jordan</span>
                <span className="text-[10px] text-slate-400 font-normal">All 12 Governorates</span>
              </div>
              {filteredPresets.map(([name, pt]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSelectPreset(pt)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-800 hover:bg-teal-50 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="font-semibold">{name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {pt.governorate}
                    </span>
                    <span className="text-slate-400 text-[11px] truncate">
                      ({pt.lat.toFixed(3)}, {pt.lng.toFixed(3)})
                    </span>
                  </div>
                  {value?.lat === pt.lat && value?.lng === pt.lng && (
                    <Check className="w-4 h-4 text-teal-600 shrink-0 ml-2" />
                  )}
                </button>
              ))}
              {filteredPresets.length === 0 && (
                <div className="p-3 text-xs text-slate-500 text-center">
                  No locations match your search. You can also click <strong>Map</strong> to drop a pin anywhere in Jordan.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Selected Location Pill */}
      {value && (
        <div className="flex items-center gap-1.5 text-xs text-teal-900 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
          <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
          <span className="font-semibold truncate">{value.label}</span>
        </div>
      )}

      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}

      {/* Map Pin Picker Modal */}
      <Modal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        title={`Pick ${label} on Jordan Map`}
        description="Click anywhere on the map of Jordan to place a precise pin or choose a city preset."
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-500 truncate">
              {tempPoint ? tempPoint.label : 'Click on map to drop pin'}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMapModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!tempPoint}
                onClick={handleMapConfirm}
              >
                Confirm Location
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-3">
          {/* Quick city presets in modal */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-semibold text-[11px] whitespace-nowrap">Quick Select:</span>
            {['Abdali', 'Downtown', 'Zarqa City', 'Irbid', 'Aqaba', 'Al-Salt', 'Madaba', 'Jerash', 'Al-Karak', 'Petra'].map((cityName) => {
              const pt = JORDAN_PRESET_AREAS[cityName];
              if (!pt) return null;
              return (
                <button
                  key={cityName}
                  type="button"
                  onClick={() => setTempPoint(pt)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-[11px] font-medium transition-colors border border-slate-200 shrink-0 cursor-pointer"
                >
                  {cityName}
                </button>
              );
            })}
          </div>

          <MapView
            pickup={tempPoint || undefined}
            height="360px"
            onPick={(pt) => setTempPoint(pt)}
            showControls={true}
          />
          <p className="text-[11px] text-slate-500 text-center">
            Click anywhere across Jordan to drop or reposition the pin. Coordinates and closest city will be calculated automatically.
          </p>
        </div>
      </Modal>
    </div>
  );
};
