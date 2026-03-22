const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const { syncCuratedKnowledge } = require("./scripts/syncCuratedKnowledge");

dotenv.config({ path: path.join(__dirname, ".env") });

async function seedExtraKnowledge() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB.");

        await syncCuratedKnowledge();

        console.log("Curated knowledge seed complete.");
        process.exit(0);
    } catch (error) {
        console.error("Extra knowledge seed failed:", error);
        process.exit(1);
    }
}

seedExtraKnowledge();
