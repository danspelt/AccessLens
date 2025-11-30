import mongoose, { Schema, model, models } from 'mongoose';

export interface IReview extends mongoose.Document {
  placeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number; // 1-5
  comment: string;
  photoIds: string[]; // GridFS file IDs
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    placeId: {
      type: Schema.Types.ObjectId,
      ref: 'Place',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: { type: String, required: true },
    photoIds: [{ type: String }], // GridFS file IDs
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
ReviewSchema.index({ placeId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1 });

export const ReviewModel = models.Review || model<IReview>('Review', ReviewSchema);

