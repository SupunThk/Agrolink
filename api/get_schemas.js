const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const {
  applyDnsServerOverride,
  mongoDriverLookup,
  logMongoConnectError,
} = require("./utils/mongo");

dotenv.config();

async function getSchemas() {
  if (!process.env.MONGO_URL) {
    console.error("Missing MONGO_URL in .env");
    process.exit(1);
  }

  applyDnsServerOverride();

  const client = new MongoClient(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    socketTimeoutMS: 8000,
    lookup: mongoDriverLookup,
  });

  try {
    await client.connect();

    const dbList = await client.db().admin().listDatabases();

    for (const dbInfo of dbList.databases) {
      const db = client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();

      for (const col of collections) {
        const sample = await db.collection(col.name).findOne();
        console.log(`\n=== ${dbInfo.name}.${col.name} ===`);
        console.log(JSON.stringify(sample, null, 2));
      }
    }
  } catch (err) {
    logMongoConnectError(err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

getSchemas();
