import { MongoClient, Db, Collection, Document } from 'mongodb';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

function getMongoClient(): Promise<MongoClient> {
  // Check environment variables when connection is actually needed
  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (!process.env.MONGODB_DB) {
    throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
  }

  const uri = process.env.MONGODB_URI;

  const mongoOptions = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 10000,
  };

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, mongoOptions);
      globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
        globalWithMongo._mongoClientPromise = undefined;
        throw err;
      });
    }
    return globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    if (!clientPromise) {
      client = new MongoClient(uri, mongoOptions);
      clientPromise = client.connect().catch((err) => {
        clientPromise = null;
        throw err;
      });
    }
    return clientPromise;
  }
}

/**
 * Get the MongoDB database instance
 */
export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB;
  if (!dbName) {
    throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
  }
  return client.db(dbName);
}

/**
 * Get a MongoDB collection with type safety
 */
export async function getCollection<T extends Document>(
  collectionName: string
): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(collectionName);
}

// Export a function to get the client promise (lazy initialization)
export default function getClientPromise(): Promise<MongoClient> {
  return getMongoClient();
}

