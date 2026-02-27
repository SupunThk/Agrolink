const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const multer = require("multer");
const path = require("path");

dotenv.config();

// ✅ Basic checks
if (!process.env.MONGO_URL) {
  console.warn("⚠️ MONGO_URL is missing in .env file");
}

// ✅ Middlewares
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "images")));

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ✅ Routes
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const categoryRoute = require("./routes/categories");
const eventRoute = require("./routes/events");

// ✅ Upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  }
});

const upload = multer({ storage });

// ✅ Upload endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
  return res.status(200).json("File has been uploaded");
});

// ✅ API endpoints
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/events", eventRoute);

// ✅ Health check (VERY useful to debug 404 / server down)
app.get("/api/health", (req, res) => {
  res.status(200).json({ ok: true, message: "API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend is running on port ${PORT}`));