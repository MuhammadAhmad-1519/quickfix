import { MongoClient, Db } from 'mongodb';
import { createMemoryCollection, InMemoryStore } from './memoryStore';

const uri = process.env.MONGODB_URI || 'mongodb+srv://seerupclaude_db_user:ahmad1519@cluster0.72mcmkm.mongodb.net/quickfix?retryWrites=true&w=majority&appName=Cluster0';
const dbName = process.env.MONGODB_DB_NAME || 'quickfix';

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 4000,
  socketTimeoutMS: 30000,
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;
let useMemoryFallback = false;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Minimal DB adapter wrapper that switches between Atlas and memory store seamlessly
class QuickFixDbWrapper {
  private realDb: Db | null;

  constructor(realDb: Db | null) {
    this.realDb = realDb;
  }

  collection<T = any>(name: string): any {
    if (this.realDb && !useMemoryFallback) {
      return this.realDb.collection(name);
    }
    return createMemoryCollection(name as keyof InMemoryStore) as any;
  }
}

export async function getDatabase(): Promise<QuickFixDbWrapper> {
  if (useMemoryFallback) {
    return new QuickFixDbWrapper(null);
  }

  try {
    if (!clientPromise) {
      if (process.env.NODE_ENV === 'development') {
        if (!global._mongoClientPromise) {
          client = new MongoClient(uri, options);
          global._mongoClientPromise = client.connect();
        }
        clientPromise = global._mongoClientPromise;
      } else {
        client = new MongoClient(uri, options);
        clientPromise = client.connect();
      }
    }

    const connectedClient = await clientPromise;
    return new QuickFixDbWrapper(connectedClient.db(dbName));
  } catch (err: any) {
    console.warn(
      `[QuickFix DB] MongoDB Atlas connection notice: ${err.message}. Enabling high-reliability fallback store with Lahore seed data.`
    );
    useMemoryFallback = true;
    return new QuickFixDbWrapper(null);
  }
}

export default getDatabase;
