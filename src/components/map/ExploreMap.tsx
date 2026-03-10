'use client';

import { useEffect, useRef } from 'react';

interface MapPlace {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  accessibilityScore?: number;
  category: string;
}

interface ExploreMapProps {
  places: MapPlace[];
  onPlaceClick?: (placeId: string) => void;
}

export function ExploreMap({ places, onPlaceClick }: ExploreMapProps) {
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const containerId = 'explore-map';

  useEffect(() => {
    let map: import('leaflet').Map | null = null;

    async function initMap() {
      const L = (await import('leaflet')).default;
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const container = document.getElementById(containerId);
      if (!container || mapRef.current) return;

      // Centre on Victoria, BC
      map = L.map(container, { zoomControl: true }).setView([48.4284, -123.3656], 13);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      places.forEach((place) => {
        const score = place.accessibilityScore;
        const color =
          score === undefined
            ? '#64748b'
            : score >= 70
            ? '#16a34a'
            : score >= 40
            ? '#ca8a04'
            : '#dc2626';

        const markerIcon = L.divIcon({
          className: '',
          html: `<div style="background:${color};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25);cursor:pointer" role="img" aria-label="${place.name}"></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });

        const scoreText =
          score !== undefined ? `<br><span style="font-size:11px;color:${color};font-weight:600">${score}/100 accessibility</span>` : '';

        const marker = L.marker([place.latitude, place.longitude], { icon: markerIcon })
          .addTo(map!)
          .bindPopup(
            `<div style="font-family:sans-serif;padding:4px 0;min-width:160px">
              <strong style="font-size:14px">${place.name}</strong>
              <br><small style="color:#64748b">${place.address}</small>
              ${scoreText}
              <br><a href="/places/${place.id}" style="font-size:12px;color:#0284c7;text-decoration:none;font-weight:500">View details →</a>
            </div>`,
            { maxWidth: 220 }
          );

        if (onPlaceClick) {
          marker.on('click', () => onPlaceClick(place.id));
        }
      });
    }

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      id={containerId}
      className="h-full w-full rounded-xl overflow-hidden"
      role="application"
      aria-label="Map of accessible places in Victoria BC. Green markers are highly accessible, yellow are partially accessible, red have accessibility barriers."
    />
  );
}
