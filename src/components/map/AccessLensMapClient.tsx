'use client';

import { useEffect, useMemo, useRef } from 'react';
import maplibregl, { Map as MlMap, GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getScoreLabel } from '@/models/Place';

type MapPlace = {
  id: string;
  name: string;
  address: string;
  category: string;
  accessibilityScore?: number;
  lng: number;
  lat: number;
};

export type AccessLensMapClientProps = {
  places: MapPlace[];
  /** If provided, map will request bounds-based data from this endpoint */
  boundsEndpoint?: string;
  className?: string;
  initialCenter?: { lng: number; lat: number; zoom: number };
  /** When true, clicking empty map drops a pin to add a place / review accessibility (Explore). */
  enableDropPin?: boolean;
  /** Optional id of page text that describes how to use the map (aria-describedby). */
  ariaDescribedBy?: string;
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const CHECKLIST_SNIPPETS: { key: string; label: string }[] = [
  { key: 'entranceRamp', label: 'Ramp or level access' },
  { key: 'accessibleWashroom', label: 'Accessible washroom' },
  { key: 'accessibleParking', label: 'Accessible parking' },
  { key: 'elevator', label: 'Elevator' },
  { key: 'automaticDoor', label: 'Automatic doors' },
  { key: 'transitAccessible', label: 'Transit accessible' },
  { key: 'serviceAnimalWelcome', label: 'Service animals welcome' },
];

function buildChecklistHtml(checklist: Record<string, boolean> | undefined): string {
  if (!checklist) {
    return '<p style="margin:6px 0 0;font-size:11px;color:#64748b">No accessibility checklist on file.</p>';
  }
  const yes = CHECKLIST_SNIPPETS.filter(({ key }) => checklist[key] === true).slice(0, 5);
  if (yes.length === 0) {
    return '<p style="margin:6px 0 0;font-size:11px;color:#64748b">No checklist items marked yes yet.</p>';
  }
  const items = yes.map(({ label }) => `<li style="margin:2px 0">${escapeHtml(label)}</li>`).join('');
  return `<ul style="margin:6px 0 0;padding-left:18px;font-size:11px;color:#334155;line-height:1.3">${items}</ul>`;
}

type PlaceApiResponse = {
  place: {
    _id: string;
    name: string;
    address: string;
    accessibilityScore?: number;
    checklist?: Record<string, boolean>;
  };
  stats: { reviewCount: number; avgRating: number | null };
};

let popupTitleSeq = 0;
function nextPopupTitleId() {
  return `al-map-popup-title-${++popupTitleSeq}`;
}

function wrapMapDialog(titleId: string, titleText: string, innerHtml: string, busy: boolean) {
  return `<div role="dialog" aria-modal="true" aria-labelledby="${titleId}" aria-busy="${busy}" tabindex="-1" style="outline:none;font:13px system-ui,sans-serif;line-height:1.35">
    <h2 id="${titleId}" style="margin:0 0 6px;font-size:14px;font-weight:600;line-height:1.25">${escapeHtml(titleText)}</h2>
    ${innerHtml}
  </div>`;
}

function focusPopupContent(popup: maplibregl.Popup) {
  requestAnimationFrame(() => {
    const root = popup.getElement()?.querySelector('.maplibregl-popup-content');
    const dialog = root?.querySelector<HTMLElement>('[role="dialog"]');
    const target =
      dialog?.querySelector<HTMLElement>('a[href],button:not([disabled])') || dialog;
    target?.focus();
  });
}

const POPUP_OPTIONS: maplibregl.PopupOptions = {
  offset: 12,
  maxWidth: 'min(280px,calc(100vw - 32px))',
  closeButton: true,
  closeOnClick: false,
  focusAfterOpen: true,
};

export function AccessLensMapClient({
  places,
  boundsEndpoint,
  className,
  initialCenter = { lng: -123.3656, lat: 48.4284, zoom: 12 },
  enableDropPin = true,
  ariaDescribedBy,
}: AccessLensMapClientProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MlMap | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const draftMarkerRef = useRef<maplibregl.Marker | null>(null);
  const enableDropPinRef = useRef(enableDropPin);
  enableDropPinRef.current = enableDropPin;

  const geojson = useMemo(() => {
    return {
      type: 'FeatureCollection' as const,
      features: places.map((p) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] as [number, number] },
        properties: {
          id: p.id,
          name: p.name,
          address: p.address,
        },
      })),
    };
  }, [places]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      center: [initialCenter.lng, initialCenter.lat],
      zoom: initialCenter.zoom,
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
              '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
          places: {
            type: 'geojson',
            data: geojson as unknown as GeoJSON.GeoJSON,
          },
        },
        layers: [
          { id: 'osm', type: 'raster', source: 'osm' },
          {
            id: 'pins-hit',
            type: 'circle',
            source: 'places',
            paint: {
              'circle-radius': 18,
              'circle-color': '#000000',
              'circle-opacity': 0,
              'circle-stroke-width': 0,
            },
          },
          {
            id: 'pins',
            type: 'circle',
            source: 'places',
            paint: {
              'circle-radius': 7,
              'circle-color': '#0ea5e9',
              'circle-opacity': 0.92,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
            },
          },
        ],
      },
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'top-right',
    );

    const clearDraft = () => {
      draftMarkerRef.current?.remove();
      draftMarkerRef.current = null;
    };

    const openPlacePopup = (
      lng: number,
      lat: number,
      id: string,
      fallbackName: string,
      fallbackAddress: string,
    ) => {
      popupRef.current?.remove();
      const loadTitleId = nextPopupTitleId();
      const popup = new maplibregl.Popup({ ...POPUP_OPTIONS, offset: 10 })
        .setLngLat([lng, lat])
        .setHTML(
          wrapMapDialog(
            loadTitleId,
            'Place details',
            '<p style="margin:0;color:#64748b">Loading accessibility information…</p>',
            true,
          ),
        )
        .addTo(map);
      popupRef.current = popup;
      focusPopupContent(popup);

      fetch(`/api/places/${encodeURIComponent(id)}`)
        .then(async (res) => {
          const data = (await res.json()) as PlaceApiResponse & { error?: string };
          if (!res.ok) throw new Error(data.error || 'Failed');
          return data;
        })
        .then(({ place, stats }) => {
          if (popupRef.current !== popup) return;
          const name = place.name || fallbackName;
          const address = place.address || fallbackAddress;
          const score = place.accessibilityScore;
          const titleId = nextPopupTitleId();
          const detailsLabel = `View full accessibility details for ${name}`;
          const scoreBlock =
            score !== undefined && score !== null
              ? `<div style="margin-top:6px"><span style="display:inline-block;padding:2px 8px;border-radius:9999px;background:#f1f5f9;font-size:11px;font-weight:700">${score}</span> <span style="font-size:11px;color:#64748b">${escapeHtml(getScoreLabel(score))}</span></div>`
              : '<p style="margin:6px 0 0;font-size:11px;color:#64748b">Not yet scored</p>';
          const rating =
            stats.avgRating != null
              ? `<p style="margin:6px 0 0;font-size:11px;color:#64748b">${stats.avgRating}★ · ${stats.reviewCount} review${stats.reviewCount !== 1 ? 's' : ''}</p>`
              : '';

          const body = `<div style="margin-top:2px;font-size:12px;color:#64748b">${escapeHtml(address)}</div>
              ${scoreBlock}
              ${buildChecklistHtml(place.checklist)}
              ${rating}
              <div style="margin-top:8px"><a href="/places/${escapeHtml(id)}" aria-label="${escapeHtml(detailsLabel)}" style="color:#0284c7;font-weight:600">View full details</a></div>`;

          popup.setHTML(wrapMapDialog(titleId, name, body, false));
          focusPopupContent(popup);
        })
        .catch(() => {
          if (popupRef.current !== popup) return;
          const errTitleId = nextPopupTitleId();
          const errLabel = `View details for ${fallbackName}`;
          popup.setHTML(
            wrapMapDialog(
              errTitleId,
              fallbackName,
              `<p style="margin:6px 0 0;font-size:12px;color:#b91c1c">Could not load details.</p>
              <div style="margin-top:8px"><a href="/places/${escapeHtml(id)}" aria-label="${escapeHtml(errLabel)}" style="color:#0284c7;font-weight:600">View details</a></div>`,
              false,
            ),
          );
          focusPopupContent(popup);
        });
    };

    const openDraftPopup = (lng: number, lat: number) => {
      popupRef.current?.remove();
      clearDraft();

      const marker = new maplibregl.Marker({ color: '#f59e0b' }).setLngLat([lng, lat]).addTo(map);
      draftMarkerRef.current = marker;
      const markerEl = marker.getElement();
      markerEl.setAttribute('role', 'img');
      markerEl.setAttribute(
        'aria-label',
        'Orange pin marking where you chose to review accessibility for a new location.',
      );

      const addUrl = `/add-place?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`;
      const coordLine = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      const addLabel = `Add a new accessible place at coordinates ${coordLine}`;

      const reviewTitleId = nextPopupTitleId();
      const popup = new maplibregl.Popup(POPUP_OPTIONS)
        .setLngLat([lng, lat])
        .setHTML(
          wrapMapDialog(
            reviewTitleId,
            'Review accessible',
            `<p style="margin:6px 0 0;font-size:12px;color:#64748b">Looking up address…</p>
            <p style="margin:4px 0 0;font-size:11px;color:#94a3b8" aria-label="Coordinates">${escapeHtml(coordLine)}</p>
            <div style="margin-top:8px"><a href="${escapeHtml(addUrl)}" aria-label="${escapeHtml(addLabel)}" style="color:#0284c7;font-weight:600">Add place here</a></div>`,
            true,
          ),
        )
        .addTo(map);
      popupRef.current = popup;
      focusPopupContent(popup);

      fetch(
        `/api/geocode?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lng))}`,
      )
        .then(async (res) => {
          const data = (await res.json()) as {
            displayName?: string;
            error?: string;
          };
          if (!res.ok) throw new Error(data.error || 'Reverse geocode failed');
          return data;
        })
        .then((data) => {
          if (popupRef.current !== popup) return;
          const okTitleId = nextPopupTitleId();
          const placeName = data.displayName ? escapeHtml(data.displayName) : '';
          const addrBlock = placeName
            ? `<p style="margin:6px 0 0;font-size:12px;color:#475569">${placeName}</p>`
            : '<p style="margin:6px 0 0;font-size:12px;color:#64748b">Address not found for this point.</p>';

          popup.setHTML(
            wrapMapDialog(
              okTitleId,
              'Review accessible',
              `${addrBlock}
              <p style="margin:4px 0 0;font-size:11px;color:#94a3b8" aria-label="Coordinates">${escapeHtml(coordLine)}</p>
              <div style="margin-top:8px"><a href="${escapeHtml(addUrl)}" aria-label="${escapeHtml(addLabel)}" style="color:#0284c7;font-weight:600">Add place here</a></div>`,
              false,
            ),
          );
          focusPopupContent(popup);
        })
        .catch(() => {
          if (popupRef.current !== popup) return;
          const failTitleId = nextPopupTitleId();
          popup.setHTML(
            wrapMapDialog(
              failTitleId,
              'Review accessible',
              `<p style="margin:6px 0 0;font-size:12px;color:#64748b">Could not look up address. You can still add a place using the coordinates below.</p>
              <p style="margin:4px 0 0;font-size:11px;color:#94a3b8" aria-label="Coordinates">${escapeHtml(coordLine)}</p>
              <div style="margin-top:8px"><a href="${escapeHtml(addUrl)}" aria-label="${escapeHtml(addLabel)}" style="color:#0284c7;font-weight:600">Add place here</a></div>`,
              false,
            ),
          );
          focusPopupContent(popup);
        });
    };

    const onMapClick = (e: maplibregl.MapMouseEvent) => {
      const hits = map.queryRenderedFeatures(e.point, { layers: ['pins-hit'] });
      if (hits.length > 0) {
        const f = hits[0];
        const id = String(f.properties?.id ?? '');
        const name = String(f.properties?.name ?? 'Place');
        const address = String(f.properties?.address ?? '');
        const coords = (f.geometry as GeoJSON.Point).coordinates;
        if (!coords || coords.length < 2 || !id) return;
        clearDraft();
        openPlacePopup(coords[0], coords[1], id, name, address);
        return;
      }

      if (!enableDropPinRef.current) return;

      const { lng, lat } = e.lngLat;
      openDraftPopup(lng, lat);
    };

    map.on('click', onMapClick);

    const setPinCursor = () => {
      map.getCanvas().style.cursor = 'pointer';
    };
    const clearCursor = () => {
      map.getCanvas().style.cursor = '';
    };
    map.on('mouseenter', 'pins-hit', setPinCursor);
    map.on('mouseleave', 'pins-hit', clearCursor);

    mapRef.current = map;
    return () => {
      map.off('click', onMapClick);
      map.off('mouseenter', 'pins-hit', setPinCursor);
      map.off('mouseleave', 'pins-hit', clearCursor);
      popupRef.current?.remove();
      popupRef.current = null;
      clearDraft();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const src = map.getSource('places') as GeoJSONSource | undefined;
    if (!src) return;
    src.setData(geojson as unknown as GeoJSON.GeoJSON);
  }, [geojson]);

  useEffect(() => {
    if (!boundsEndpoint) return;
    const map = mapRef.current;
    if (!map) return;

    let t: ReturnType<typeof setTimeout> | null = null;
    const onMove = () => {
      if (t) clearTimeout(t);
      t = setTimeout(async () => {
        const b = map.getBounds();
        const url = new URL(boundsEndpoint, window.location.origin);
        url.searchParams.set('west', String(b.getWest()));
        url.searchParams.set('south', String(b.getSouth()));
        url.searchParams.set('east', String(b.getEast()));
        url.searchParams.set('north', String(b.getNorth()));
        const res = await fetch(url.toString());
        await res.json();
        if (!res.ok) return;
      }, 250);
    };

    map.on('moveend', onMove);
    return () => {
      if (t) clearTimeout(t);
      map.off('moveend', onMove);
    };
  }, [boundsEndpoint]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className={className || 'h-full w-full'}
        role="application"
        aria-label="Interactive map of Victoria. Use mouse or touch to pan and zoom. Pins show saved places."
        {...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : {})}
      />
    </div>
  );
}
