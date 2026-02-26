const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const categoryRoute = require("./routes/categories");
const Category = require("./models/Category");
const multer = require("multer");
const path = require("path");

dotenv.config();
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "/images")));

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

const storage = multer.diskStorage({
  destination:(req,file,cb) =>{
    cb(null,"images")
  },
  filename:(req,file,cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({storage:storage});
app.post("/api/upload", upload.single("file"),(req,res) => {
  res.status(200).json("File has been uploaded");
});


app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/categories", categoryRoute);

startServer();