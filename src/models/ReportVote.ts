import { ObjectId } from 'mongodb';

export interface ReportVote {
  _id: ObjectId;
  reviewId: ObjectId;
  userId: ObjectId;
  value: 1 | -1;
  createdAt: Date;
  updatedAt: Date;
}
