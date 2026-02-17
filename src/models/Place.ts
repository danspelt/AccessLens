import { ObjectId } from 'mongodb';

export type PlaceCategory = 
  | 'arena'
  | 'pool'
  | 'rink'
  | 'park'
  | 'sidewalk'
  | 'business'
  | 'other';

export type GeoPoint = {
  type: 'Point';
  coordinates: [number, number];
};

export interface Place {
  _id: ObjectId;
  name: string;
  category: PlaceCategory;
  address: string;
  city: string;
  province?: string;
  country: string;
  description?: string;
  location?: GeoPoint;
  // Accessibility flags
  stepFreeAccess: boolean;
  accessibleWashroom: boolean;
  accessibleParking: boolean;
  indoor: boolean;
  // Location (optional for future map integration)
  latitude?: number;
  longitude?: number;
  // Metadata
  createdByUserId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

