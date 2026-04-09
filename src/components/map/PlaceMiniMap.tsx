'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import maplibregl, { Map as MlMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react';

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

function subscribeMapPrefs(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getMapAutoLoadSnapshot(): boolean | undefined {
  return getStoredMapAutoLoad();
}

function getMapAutoLoadServerSnapshot(): boolean | undefined {
  return undefined;
}

export function PlaceMiniMap({
  lat,
  lng,
  name,
  address,
  autoLoad,
}: {
  lat: number;
  lng: number;
  name: string;
  address: string;
  autoLoad?: boolean;
}) {
  const id = useMemo(
    () => `place-mini-map-${Math.abs(Math.floor(lat * 1000000))}-${Math.abs(Math.floor(lng * 1000000))}`,
    [lat, lng]
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MlMap | null>(null);

  const storedPref = useSyncExternalStore(
    subscribeMapPrefs,
    getMapAutoLoadSnapshot,
    getMapAutoLoadServerSnapshot
  );

  const [userOverride, setUserOverride] = useState<boolean | null>(null);

  const enabled =
    userOverride !== null
      ? userOverride
      : autoLoad !== undefined
        ? autoLoad
        : storedPref !== undefined
          ? storedPref
          : true;

  useEffect(() => {
    if (!enabled) return;
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      center: [lng, lat],
      zoom: 15,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution:
              '© <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors',
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
    });

    map.addControl(new maplibregl.NavigationControl({ showZoom: true, showCompass: false }), 'top-right');

    const marker = document.createElement('div');
    marker.style.width = '18px';
    marker.style.height = '18px';
    marker.style.borderRadius = '9999px';
    marker.style.background = '#0ea5e9';
    marker.style.border = '3px solid white';
    marker.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)';

    new maplibregl.Marker({ element: marker })
      .setLngLat([lng, lat])
      .setPopup(new maplibregl.Popup({ offset: 16 }).setHTML(`<strong>${name}</strong><br/><small>${address}</small>`))
      .addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [enabled, lat, lng, name, address]);

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
          onClick={() => setUserOverride(true)}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          Load map
        </button>
      </div>
    );
  }

  return (
    <div
      id={id}
      ref={containerRef}
      className="h-64 w-full overflow-hidden rounded-xl border border-slate-200"
      role="application"
      aria-label={`Map showing location of ${name} at ${address}`}
    />
  );
}

