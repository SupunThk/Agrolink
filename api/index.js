const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const categoryRoute = require("./routes/categories");
const multer = require("multer");
const path = require("path");

dotenv.config();
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "/images")));

mongoose.connect(process.env.MONGO_URL)
.then(console.log("Connected to MongoDB"))
.catch((err) => console.log(err));

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