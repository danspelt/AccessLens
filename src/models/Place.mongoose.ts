import mongoose, { Schema, model, models } from 'mongoose';

export type PlaceCategory = 
  | 'arena'
  | 'pool'
  | 'rink'
  | 'park'
  | 'sidewalk'
  | 'business'
  | 'other';

export interface IPlace extends mongoose.Document {
  name: string;
  category: PlaceCategory;
  address: string;
  city: string;
  province?: string;
  country: string;
  description?: string;
  stepFreeAccess: boolean;
  accessibleWashroom: boolean;
  accessibleParking: boolean;
  indoor: boolean;
  latitude?: number;
  longitude?: number;
  createdByUserId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PlaceSchema = new Schema<IPlace>(
  {
    name: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: ['arena', 'pool', 'rink', 'park', 'sidewalk', 'business', 'other'],
      required: true,
      index: true,
    },
    address: { type: String, required: true },
    city: { type: String, required: true, default: 'Victoria', index: true },
    province: { type: String, default: 'BC' },
    country: { type: String, default: 'Canada' },
    description: { type: String },
    stepFreeAccess: { type: Boolean, default: false },
    accessibleWashroom: { type: Boolean, default: false },
    accessibleParking: { type: Boolean, default: false },
    indoor: { type: Boolean, default: false },
    latitude: { type: Number },
    longitude: { type: Number },
    createdByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
PlaceSchema.index({ city: 1, category: 1 });
PlaceSchema.index({ createdAt: -1 });

export const PlaceModel = models.Place || model<IPlace>('Place', PlaceSchema);

