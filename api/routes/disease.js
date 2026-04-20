const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

// Configure multer to temporarily store uploaded files
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /api/disease/scan
router.post("/scan", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Prepare form data for FastAPI
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // Send request to ML Microservice
    const response = await axios.post("http://localhost:8000/predict", form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    // Return the response directly to the React frontend
    res.status(200).json(response.data);
  } catch (error) {
    fs.writeFileSync("disease_debug.txt", "ERROR: " + (error.message || "") + "\nAxios Data: " + JSON.stringify(error.response?.data || {}) + "\nCode: " + error.code);
    console.error("ML Service error:", error.message);
    if (error.response) {
      console.error("FastAPI error data:", error.response.data);
    }
    // If the fastapi server is not running
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: "Machine Learning Service is currently offline. Please try again later.",
      });
    }
    
    res.status(500).json({ error: "Failed to process the image for disease detection: " + error.message });
  }
});

module.exports = router;
