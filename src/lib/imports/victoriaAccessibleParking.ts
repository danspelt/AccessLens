export const VICTORIA_ACCESSIBLE_PARKING = {
  provider: 'City of Victoria',
  dataset: 'OpenData Parking — Parking Spaces',
  layerUrl: 'https://maps.victoria.ca/server/rest/services/OpenData/OpenData_Parking/MapServer/6',
  queryUrl: "https://maps.victoria.ca/server/rest/services/OpenData/OpenData_Parking/MapServer/6/query?where=MapSymbol%3D%27ACCESSIBLE%27%20AND%20LifecycleStatus%3D%27ACT%27&outFields=*&returnGeometry=true&outSR=4326&orderByFields=OBJECTID&resultRecordCount=5&f=geojson",
  licenceName: 'Open Government Licence — City of Victoria',
  licenceUrl: 'https://opendata.victoria.ca/pages/open-data-licence',
  attribution: 'Contains information licensed under the Open Government Licence — City of Victoria.',
} as const;

export interface VictoriaParkingFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: Record<string, unknown> & {
    OBJECTID: number;
    InfrastructureID?: string | null;
    CivicAddress?: string | null;
    Location?: string | null;
  };
}

export interface VictoriaParkingCandidate {
  candidateType: 'accessible_public_parking';
  status: 'pending_community_verification';
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  officialAttributes: Record<string, unknown>;
  disclaimer: string;
  provenance: {
    provider: string; dataset: string; recordId: string; sourceUrl: string;
    licenceName: string; licenceUrl: string; attribution: string;
    importedAt: string; sourceUpdatedAt: null;
  };
}

export function toVictoriaParkingCandidate(feature: VictoriaParkingFeature, importedAt: string): VictoriaParkingCandidate {
  const [longitude, latitude] = feature.geometry.coordinates;
  const recordId = String(feature.properties.InfrastructureID || feature.properties.OBJECTID);
  const address = feature.properties.CivicAddress?.trim() || undefined;
  const location = feature.properties.Location?.trim() || undefined;
  return {
    candidateType: 'accessible_public_parking',
    status: 'pending_community_verification',
    name: location ? `Accessible parking — ${location}` : `Accessible parking space ${recordId}`,
    ...(address ? { address: `${address}, Victoria, BC` } : {}),
    latitude,
    longitude,
    officialAttributes: Object.fromEntries(Object.entries(feature.properties).filter(([, value]) => value !== null && value !== '')),
    disclaimer: 'Official-source candidate, not a guarantee of current accessibility. Confirm signage, dimensions, route conditions, availability, and parking rules before relying on this record.',
    provenance: {
      provider: VICTORIA_ACCESSIBLE_PARKING.provider,
      dataset: VICTORIA_ACCESSIBLE_PARKING.dataset,
      recordId,
      sourceUrl: VICTORIA_ACCESSIBLE_PARKING.layerUrl,
      licenceName: VICTORIA_ACCESSIBLE_PARKING.licenceName,
      licenceUrl: VICTORIA_ACCESSIBLE_PARKING.licenceUrl,
      attribution: VICTORIA_ACCESSIBLE_PARKING.attribution,
      importedAt,
      sourceUpdatedAt: null,
    },
  };
}
