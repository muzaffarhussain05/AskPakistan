import fs from 'fs';
import path from 'path';

// Load env files FIRST before importing mongo library
try {
  const envLocal = path.join(process.cwd(), '.env.local');
  const env = path.join(process.cwd(), '.env');
  if (fs.existsSync(envLocal)) {
    process.loadEnvFile(envLocal);
  } else if (fs.existsSync(env)) {
    process.loadEnvFile(env);
  }
} catch (e) {}

import { MongoClient } from 'mongodb';

async function testConnection() {
  console.log('=== MONGODB DIAGNOSTIC TOOL ===');
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'askpakistan';

  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  // Mask password for display
  const maskedUri = uri.replace(/\/\/(.*):(.*)@/, '//***:***@');
  console.log(`Connecting to: ${maskedUri}`);
  console.log(`Database name: ${dbName}`);

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 10000,
  });

  try {
    await client.connect();
    console.log('✅ Connection successful!');
    const adminDb = client.db().admin();
    const ping = await adminDb.ping();
    console.log('✅ MongoDB Ping Response:', ping);

    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log(`✅ Database "${dbName}" collections:`, collections.map(c => c.name));

    await client.close();
    console.log('\n🎉 MongoDB connection is working perfectly!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ MongoDB Connection Error Details:');
    console.error('Message:', err.message);
    console.error('Code:', err.code);

    if (err.message.includes('querySrv ENOTFOUND') || err.message.includes('ENOTFOUND')) {
      console.error('\n💡 Diagnosis: DNS resolution failed.');
      console.error('- Check if your connection string hostname is correct.');
      console.error('- If using Atlas cloud, make sure your internet connection can resolve SRV DNS records.');
    } else if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
      console.error('\n💡 Diagnosis: Authentication failed.');
      console.error('- Verify your database username and password in .env.local');
      console.error('- If your password contains special characters like "@", "#", ":", "/", replace them with URL encoding (e.g. @ becomes %40).');
    } else if (err.message.includes('selection timed out') || err.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Diagnosis: Network selection timed out or connection refused.');
      console.error('- If using Atlas cloud: Go to mongodb.com/atlas -> Network Access -> Add IP Address -> Allow Access from Anywhere (0.0.0.0/0).');
      console.error('- If using Local MongoDB: Ensure MongoDB service is running locally (`mongod` or MongoDB Windows Service).');
      console.error('- Try using `mongodb://127.0.0.1:27017` instead of `localhost`.');
    }
    process.exit(1);
  }
}

testConnection();
