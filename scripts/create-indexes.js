import fs from 'fs';
import path from 'path';
import { getDb } from '../src/lib/mongo.js';

// Auto-load .env.local or .env for standalone Node execution
try {
  const envLocal = path.join(process.cwd(), '.env.local');
  const env = path.join(process.cwd(), '.env');
  if (fs.existsSync(envLocal)) {
    process.loadEnvFile(envLocal);
  } else if (fs.existsSync(env)) {
    process.loadEnvFile(env);
  }
} catch (err) {
  // Ignore env loading errors
}

async function createIndexes() {
  console.log('Connecting to MongoDB...');

  if (!process.env.MONGODB_URI) {
    console.warn('\n[!] MONGODB_URI is not set in .env.local.');
    console.warn('To connect to MongoDB Atlas or local MongoDB:');
    console.warn('1. Open C:\\Users\\K Tech\\.gemini\\antigravity\\scratch\\ask-pakistan\\.env.local');
    console.warn('2. Set MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority');
    console.warn('   (or MONGODB_URI=mongodb://127.0.0.1:27017 if running local MongoDB)');
    console.warn('3. Re-run: npm run create-indexes\n');
    process.exit(0);
  }

  const db = await getDb();
  if (!db) {
    console.warn('\n[!] Unable to connect to MongoDB with current MONGODB_URI. Please verify connection credentials and network access.');
    process.exit(0);
  }

  console.log('Creating unique index on pages.url...');
  await db.collection('pages').createIndex({ url: 1 }, { unique: true });

  console.log('Creating standard indexes on chunks collection...');
  await db.collection('chunks').createIndex({ url: 1 });
  await db.collection('chunks').createIndex({ siteId: 1 });
  await db.collection('chunks').createIndex({ topic: 1 });

  console.log('Creating cache TTL index...');
  await db.collection('cache').createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // 24 hours

  console.log(`
============================================================
MongoDB standard indexes created successfully!

To set up Atlas Vector Search index 'chunks_vector' on MongoDB Atlas:
1. Log in to MongoDB Atlas UI (mongodb.com/atlas).
2. Select your Cluster -> Search -> Create Vector Search Index.
3. Choose JSON Editor and paste the following definition:

{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "siteId"
    },
    {
      "type": "filter",
      "path": "topic"
    },
    {
      "type": "filter",
      "path": "lang"
    }
  ]
}
============================================================
`);
  process.exit(0);
}

createIndexes().catch(console.error);
