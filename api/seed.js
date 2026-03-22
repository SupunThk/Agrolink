const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const { syncCuratedKnowledge } = require("./scripts/syncCuratedKnowledge");

dotenv.config({ path: path.join(__dirname, ".env") });

async function seedData() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB for knowledge seeding.");

        await syncCuratedKnowledge();

        console.log("Curated knowledge data is ready.");
        process.exit(0);
    } catch (err) {
        console.error("Knowledge seed failed:", err);
        process.exit(1);
    }
}

seedData();
