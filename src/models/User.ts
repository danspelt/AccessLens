import { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  email: string;
  passwordHash?: string;
  name: string;
  googleSub?: string;
  repScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

