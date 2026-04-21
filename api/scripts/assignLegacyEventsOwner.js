const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Event = require("../models/Event");
const User = require("../models/User");

dotenv.config();

function getArg(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : null;
}

async function run() {
  const userId = getArg("userId");
  if (!userId) {
    console.error("Missing required argument: --userId=<mongo_user_id>");
    process.exit(1);
  }

  if (!process.env.MONGO_URL) {
    console.error("Missing MONGO_URL in api/.env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 5000,
  });

  try {
    const user = await User.findById(userId).select("_id role isAdmin").lean();
    if (!user) {
      console.error("User not found for the provided --userId");
      process.exit(1);
    }

    const normalizedRole = user.isAdmin ? "admin" : (user.role || "user");
    const legacyFilter = {
      $or: [
        { createdBy: { $exists: false } },
        { createdBy: null },
      ],
    };

    const result = await Event.updateMany(legacyFilter, {
      $set: {
        createdBy: user._id,
        createdByRole: normalizedRole,
      },
    });

    console.log("Legacy ownership reassignment complete");
    console.log("------------------------------------");
    console.log(`Assigned owner userId: ${user._id}`);
    console.log(`Assigned owner role: ${normalizedRole}`);
    console.log(`Matched legacy events: ${result.matchedCount}`);
    console.log(`Modified events: ${result.modifiedCount}`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((err) => {
  console.error("Failed to assign legacy event ownership:", err.message || err);
  process.exit(1);
});
