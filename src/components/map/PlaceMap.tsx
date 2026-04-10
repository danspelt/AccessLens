'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';

interface PlaceMapProps {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
  accessibilityScore?: number;
  autoLoad?: boolean;
}

type StoredPrefs = { mapAutoLoad?: boolean };

function getStoredMapAutoLoad(): boolean | undefined {
  try {
    const raw = localStorage.getItem('accesslens:prefs');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as StoredPrefs;
    return typeof parsed.mapAutoLoad === 'boolean' ? parsed.mapAutoLoad : undefined;
  } catch {
    return undefined;
  }
}

export function PlaceMap({ latitude, longitude, name, address, accessibilityScore, autoLoad }: PlaceMapProps) {
  const mapId = useMemo(
    () => `place-map-${Math.abs(Math.floor(latitude * 1000000))}-${Math.abs(Math.floor(longitude * 1000000))}`,
    [latitude, longitude]
  );
  const [enabled, setEnabled] = useState<boolean>(() => autoLoad ?? true);

  useEffect(() => {
    if (autoLoad !== undefined) {
      setEnabled(autoLoad);
      return;
    }
    const stored = getStoredMapAutoLoad();
    if (stored !== undefined) setEnabled(stored);
  }, [autoLoad]);

  useEffect(() => {
    if (!enabled) return;
    // Dynamically load leaflet only on client
    let map: import('leaflet').Map | null = null;

    async function initMap() {
      const L = (await import('leaflet')).default;
      // Fix default icon paths broken by webpack
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const container = document.getElementById(mapId);
      if (!container) return;

      map = L.map(container, { zoomControl: true }).setView([latitude, longitude], 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const scoreColor =
        accessibilityScore === undefined
          ? '#64748b'
          : accessibilityScore >= 70
          ? '#16a34a'
          : accessibilityScore >= 40
          ? '#ca8a04'
          : '#dc2626';

      const markerIcon = L.divIcon({
        className: '',
        html: `<div style="background:${scoreColor};width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);" role="img" aria-label="${name} location marker"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      L.marker([latitude, longitude], { icon: markerIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:sans-serif;padding:4px 0"><strong>${name}</strong><br><small style="color:#64748b">${address}</small></div>`,
          { maxWidth: 200 }
        )
        .openPopup();
    }

    initMap();

    return () => {
      if (map) {
        map.remove();
        map = null;
      }
    };
  }, [enabled, latitude, longitude, name, address, accessibilityScore, mapId]);

  if (!enabled) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <MapPin className="h-8 w-8 text-slate-400" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-slate-700">Map is turned off</p>
          <p className="mt-1 text-xs text-slate-500">Enable “Map auto-load” in Settings, or load it once.</p>
        </div>
        <button
          type="button"
          onClick={() => setEnabled(true)}
          className="link-cta-primary px-4 py-2 text-sm font-medium"
        >
          Load map
        </button>
      </div>
    );
  }

  return (
    <div
      id={mapId}
      className="h-64 w-full rounded-xl overflow-hidden border border-slate-200"
      role="application"
      aria-label={`Map showing location of ${name} at ${address}`}
    />
  );
}

interface NoMapProps {
  name: string;
  address: string;
}

export function NoMapPlaceholder({ name, address }: NoMapProps) {
  return (
    <div className="flex h-48 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50">
      <MapPin className="h-8 w-8 text-slate-400" aria-hidden="true" />
      <div className="text-center">
        <p className="text-sm font-medium text-slate-600">{name}</p>
        <p className="text-xs text-slate-500">{address}</p>
        <p className="mt-1 text-xs text-slate-400">No coordinates available</p>
      </div>
    </div>
  );
}
