import { ObjectId } from 'mongodb';

export type PlacePhotoType =
  | 'entrance'
  | 'parking'
  | 'washroom'
  | 'interior'
  | 'signage'
  | 'other';

export type PlacePhotoStatus = 'pending' | 'approved' | 'rejected';

export const PHOTO_TYPE_LABELS: Record<PlacePhotoType, string> = {
  entrance: 'Entrance',
  parking: 'Parking',
  washroom: 'Washroom',
  interior: 'Interior / pathways',
  signage: 'Menu / signage',
  other: 'Other',
};

export interface PlacePhoto {
  _id: ObjectId;
  placeId: ObjectId;
  placeName: string;
  url: string;
  photoType: PlacePhotoType;
  status: PlacePhotoStatus;
  uploadedBy: {
    type: 'business' | 'community' | 'student';
    name?: string;
    email?: string;
  };
  reviewedBy?: ObjectId | null;
  reviewedAt?: Date | null;
  caption?: string;
  createdAt: Date;
  updatedAt: Date;
}
