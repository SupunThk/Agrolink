const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const categoryRoute = require("./routes/categories");
const Category = require("./models/Category");

// Prevent unhandled promise rejections from crashing the server
process.on("unhandledRejection", (reason) => {
  console.error("[UnhandledRejection]", reason instanceof Error ? reason.message : reason);
});
process.on("uncaughtException", (err) => {
  console.error("[UncaughtException]", err.message);
});

dotenv.config();

const multer = require("multer");
const path = require("path");

app.use(express.json());
// Serve files from api/images/ at /images
app.use("/images", express.static(path.join(__dirname, "/images")));

// Save uploaded files to api/images/ using the filename sent by the client
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, "images"); },
  filename:    (req, file, cb) => { cb(null, req.body.name); },
});
const upload = multer({ storage });

const DEFAULT_CATEGORIES = [
  "Organic Farming",
  "Inorganic Farming",
  "Crop Diseases",
  "Pest Management",
  "Soil Management",
  "Weather & Climate",
  "Crop Growth",
  "Fertilizer Management",
];

async function seedDefaultCategories() {
  try {
    await Promise.all(
      DEFAULT_CATEGORIES.map((name) =>
        Category.findOneAndUpdate(
          { name },
          { $setOnInsert: { name } },
          { upsert: true, new: true }
        )
      )
    );
  } catch (err) {
    console.error("Failed to seed default categories", err);
  }
}

async function startServer() {
  // ── Startup checks ────────────────────────────────────────────────────────
  if (!process.env.MONGO_URL) {
    console.error(
      "Missing MONGO_URL. Create api/.env and set MONGO_URL to your MongoDB connection string."
    );
    console.error("Starting backend without DB (API will return 503 for DB routes).");
  }


  try {
    if (process.env.MONGO_URL) {
      await mongoose.connect(process.env.MONGO_URL, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("Connected to MongoDB");
      await seedDefaultCategories();
    }
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    console.error("Continuing without DB (API will return 503 for DB routes).");
  }

  app.listen(5000, () => {
    console.log("Backend is running.");
  });
}

app.post("/api/upload", upload.single("file"), (req, res) => {
  res.status(200).json("File has been uploaded");
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/categories", categoryRoute);

// ── DB health check for admin settings ──────────────────────────────────────
app.get("/api/admin/db-status", (req, res) => {
  // mongoose.connection.readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const state = mongoose.connection.readyState;
  const stateMap = { 0: "Disconnected", 1: "Connected", 2: "Connecting", 3: "Disconnecting" };
  res.status(200).json({
    status: stateMap[state] || "Unknown",
    connected: state === 1,
    host: mongoose.connection.host || "—",
    name: mongoose.connection.name || "—",
  });
});

app.listen("5000", () => {
  console.log("Backend is running.");
});

startServer();