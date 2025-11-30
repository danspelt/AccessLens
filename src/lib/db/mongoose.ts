import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!process.env.MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, bucket: null };
}

async function connectMongoose() {
  if (cached.conn) {
    return { conn: cached.conn, bucket: cached.bucket };
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      // Initialize GridFS bucket for photos
      const db = mongoose.connection.db;
      const bucket = new GridFSBucket(db, { bucketName: 'photos' });
      cached.bucket = bucket;
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return { conn: cached.conn, bucket: cached.bucket };
}

export async function getMongooseConnection() {
  const { conn } = await connectMongoose();
  return conn;
}

export async function getGridFSBucket(): Promise<GridFSBucket> {
  const { bucket } = await connectMongoose();
  if (!bucket) {
    throw new Error('GridFS bucket not initialized');
  }
  return bucket;
}

export default connectMongoose;

