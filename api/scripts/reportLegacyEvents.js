const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Event = require("../models/Event");

dotenv.config();

async function run() {
  if (!process.env.MONGO_URL) {
    console.error("Missing MONGO_URL in api/.env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 5000,
  });

  try {
    const legacyFilter = {
      $or: [
        { createdBy: { $exists: false } },
        { createdBy: null },
      ],
    };

    const totalEvents = await Event.countDocuments();
    const legacyCount = await Event.countDocuments(legacyFilter);
    const legacySamples = await Event.find(legacyFilter)
      .select("_id title date location")
      .sort({ date: 1 })
      .limit(20)
      .lean();

    console.log("Event ownership report");
    console.log("----------------------");
    console.log(`Total events: ${totalEvents}`);
    console.log(`Legacy (no owner): ${legacyCount}`);

    if (legacySamples.length > 0) {
      console.log("\nSample legacy events (up to 20):");
      legacySamples.forEach((ev) => {
        const eventDate = ev.date ? new Date(ev.date).toISOString().slice(0, 10) : "n/a";
        console.log(`- ${ev._id} | ${ev.title || "Untitled"} | ${eventDate} | ${ev.location || "-"}`);
      });
    }
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((err) => {
  console.error("Failed to generate event ownership report:", err.message || err);
  process.exit(1);
});
