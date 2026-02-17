import mongoose, { type Mongoose } from 'mongoose';
import { GridFSBucket } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
    bucket: GridFSBucket | null;
  } | undefined;
}

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!process.env.MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

const globalWithMongoose = global as typeof globalThis & {
  __mongooseCache?: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
    bucket: GridFSBucket | null;
  };
};

const cached =
  globalWithMongoose.__mongooseCache ??
  (globalWithMongoose.__mongooseCache = { conn: null, promise: null, bucket: null });

async function connectMongoose() {
  if (cached.conn) {
    return { conn: cached.conn, bucket: cached.bucket };
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseConn) => {
      // Initialize GridFS bucket for photos
      const db = mongooseConn.connection.db;
      if (!db) {
        throw new Error('MongoDB connection database handle is not available');
      }
      const bucket = new GridFSBucket(db, { bucketName: 'photos' });
      cached.bucket = bucket;
      return mongooseConn;
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

