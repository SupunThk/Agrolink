const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://it24102088_db_user:ToJLSPN8XZISFlAZ@cluster0.gvhad8t.mongodb.net/?appName=Cluster0";

async function getSchemas() {
  const client = new MongoClient(uri);
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
  
  await client.close();
}

getSchemas();
