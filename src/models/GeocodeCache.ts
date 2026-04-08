import { ObjectId } from 'mongodb';

export interface GeocodeCacheEntry {
  _id: ObjectId;
  /** Normalized input query (lowercased, trimmed, collapsed whitespace) */
  q: string;
  /** Result payload we return to the client */
  result: {
    lat: number;
    lon: number;
    displayName: string;
    /** Optional extra fields from Nominatim */
    placeId?: string;
    osmType?: string;
    category?: string;
    type?: string;
    /** Present for reverse-geocode responses */
    address?: Record<string, string>;
  };
  createdAt: Date;
  /** TTL index targets this field */
  expiresAt: Date;
}

