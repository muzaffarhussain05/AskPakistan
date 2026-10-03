import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';

// Ensure env variables are loaded if executing in standalone node script context
try {
  const envLocal = path.join(process.cwd(), '.env.local');
  const env = path.join(process.cwd(), '.env');
  if (fs.existsSync(envLocal)) {
    process.loadEnvFile(envLocal);
  } else if (fs.existsSync(env)) {
    process.loadEnvFile(env);
  }
} catch (e) {}

let cachedClient = null;
let cachedPromise = null;

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'askpakistan';

  if (!uri || uri.trim().length === 0) {
    return null;
  }

  if (cachedClient) {
    return cachedClient.db(dbName);
  }

  if (!cachedPromise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });

    cachedPromise = client.connect().then((c) => {
      cachedClient = c;
      return c;
    }).catch((err) => {
      console.warn(`[mongo.js] MongoDB connection failed: ${err.message}`);
      cachedPromise = null;
      return null;
    });
  }

  const connectedClient = await cachedPromise;
  if (!connectedClient) return null;
  return connectedClient.db(dbName);
}

export default getDb;
