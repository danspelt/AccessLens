import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
    bucket: GridFSBucket | null;
  };
}

