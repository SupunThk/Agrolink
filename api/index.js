const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const categoryRoute = require("./routes/categories");
const productRoute = require("./routes/products");
const multer = require("multer");
const path = require("path");

app.use(express.json());
// Serve files from api/images/ at /images
app.use("/images", express.static(path.join(__dirname, "/images")));

mongoose
  .connect(process.env.MONGO_URL)
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "agrolink_marketplace",
    allowedFormats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", (req, res) => {
  upload.single("file")(req, res, function (err) {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(500).json({ error: err.message, stack: err.stack });
    }
    // multer-storage-cloudinary automatically attaches the secure url to req.file.path
    if (req.file && req.file.path) {
      res.status(200).json({ url: req.file.path });
    } else {
      console.error("POST /upload error: No req.file or req.file.path");
      res.status(500).json("File upload failed");
    }
  });
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/products", productRoute);

app.listen("5000", () => {
  console.log("Backend is running.");
});

startServer();
