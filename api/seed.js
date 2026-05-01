const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const { syncCuratedKnowledge } = require("./scripts/syncCuratedKnowledge");
const { connectMongo, logMongoConnectError } = require("./utils/mongo");

dotenv.config({ path: path.join(__dirname, ".env") });

async function seedData() {
    try {
        await connectMongo(mongoose, process.env.MONGO_URL);
        console.log("Connected to MongoDB for knowledge seeding.");

        await syncCuratedKnowledge();

        console.log("Curated knowledge data is ready.");
        process.exit(0);
    } catch (err) {
        logMongoConnectError(err);
        console.error("Knowledge seed failed.");
        process.exit(1);
    }
}

seedData();
