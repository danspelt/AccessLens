import { ObjectId } from 'mongodb';

export interface City {
  _id: ObjectId;
  slug: string;
  name: string;
  province: string;
  country: string;
  description: string;
  heroImageUrl?: string;
  /** Used to order city lists; lower = earlier. */
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CityPublic = Omit<City, '_id' | 'createdAt' | 'updatedAt'> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
