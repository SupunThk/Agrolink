const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const path = require("path");
const Question = require("../models/Question");

// GET /api/chatbot/chat - Get response from chatbot (Python version)
router.get("/chat", async (req, res) => {
  try {
    const message = req.query.message || "";
    const username = req.query.username || "Anonymous";
    const category = req.query.category || "General";
    
    console.log("Received message:", message);
    
    if (!message.trim()) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // Fetch answered questions from the database to train the chatbot
    const answeredDocs = await Question.find({ status: "Answered" }).populate('answers');
    const dynamicTrainingData = answeredDocs.map(doc => {
      // Find accepted answer or just use the first answer
      let bestAnswer = doc.answers.find(a => a.isAccepted);
      if (!bestAnswer && doc.answers.length > 0) bestAnswer = doc.answers[0];
      
      if (bestAnswer) {
        return {
          question: doc.question,
          answer: bestAnswer.answer,
          priority: 5 // Default priority for user-generated Q&A
        };
      }
      return null;
    }).filter(qa => qa !== null);

    // Spawn Python process to run the chatbot
    const pythonPath = process.platform === "win32" ? "python" : "python3";
    const scriptPath = path.join(__dirname, "../services/chatbot.py");
    
    console.log("Running Python script:", scriptPath);
    console.log("Python command:", pythonPath);
    
    const pythonProcess = spawn(pythonPath, [scriptPath], {
      cwd: path.join(__dirname, "../services")
    });

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
      console.log("Python stdout:", data.toString());
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
      console.log("Python stderr:", data.toString());
    });

    pythonProcess.on("close", async (code) => {
      console.log("Python process closed with code:", code);
      console.log("Final output:", output);
      console.log("Final error:", errorOutput);
      
      if (code !== 0) {
        console.error("Python chatbot error:", errorOutput);
        return res.status(500).json({ 
          error: "Error processing your message",
          details: errorOutput
        });
      }

      try {
        const result = JSON.parse(output.trim());
        console.log("Parsed result:", result);
        
        // If confidence is low, auto-save the question for expert review
        if (result.confidence && result.confidence < 50) {
          try {
            const newQuestion = new Question({
              question: message,
              username: username,
              category: category,
              chatbotConfidence: result.confidence,
            });
            await newQuestion.save();
            result.questionSaved = true;
            result.questionId = newQuestion._id;
            console.log("Low confidence question saved for expert review");
          } catch (dbError) {
            console.error("Error saving question:", dbError);
            result.questionSaveError = "Could not save question for expert review";
          }
        }
        
        res.status(200).json(result);
      } catch (parseError) {
        console.error("Error parsing chatbot response:", parseError);
        console.error("Output was:", output);
        res.status(500).json({ error: "Error processing your message" });
      }
    });

    pythonProcess.on("error", (err) => {
      console.error("Failed to start chatbot process:", err);
      res.status(500).json({ error: "Error processing your message: " + err.message });
    });

    // Send message via stdin
    const inputPayload = JSON.stringify({
      message: message,
      trainingData: dynamicTrainingData
    });
    pythonProcess.stdin.write(inputPayload);
    pythonProcess.stdin.end();

  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ error: "Error processing your message" });
  }
});

// POST /api/chatbot/ask-expert - Manually save a question to ask an expert
router.post("/ask-expert", async (req, res) => {
  try {
    const { question, username, category } = req.body;

    if (!question || !username) {
      return res.status(400).json({ error: "Question and username are required" });
    }

    const newQuestion = new Question({
      question,
      username,
      category: category || "General",
      chatbotConfidence: 0,
    });

    const savedQuestion = await newQuestion.save();
    res.status(201).json({
      message: "Your question has been saved and will be reviewed by expert farmers",
      question: savedQuestion,
    });
  } catch (err) {
    console.error("Error saving question:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
