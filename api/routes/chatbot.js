const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const path = require("path");
const Question = require("../models/Question");
const ChatConversation = require("../models/ChatConversation");
const requireDb = require("../middleware/requireDb");

const buildTitleFromQuestion = (text) => {
  const s = (text || "").toString().trim().replace(/\s+/g, " ");
  if (!s) return "New Conversation";
  return s.length > 60 ? s.slice(0, 57) + "…" : s;
};

// ── Conversations (MongoDB) ───────────────────────────────────────────────
// These endpoints are used by the /ask-expert page to persist chat history.

// GET /api/chatbot/conversations?ownerKey=...
router.get("/conversations", requireDb, async (req, res) => {
  try {
    const ownerKey = req.query.ownerKey;
    if (!ownerKey) {
      return res.status(400).json({ error: "ownerKey is required" });
    }

    const limit = Math.min(parseInt(req.query.limit || "50", 10) || 50, 200);
    const convs = await ChatConversation.find({ ownerKey })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select("_id title updatedAt lastMessageAt");

    return res.status(200).json(convs);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/chatbot/conversations
router.post("/conversations", requireDb, async (req, res) => {
  try {
    const { ownerKey, username, title } = req.body || {};
    if (!ownerKey) {
      return res.status(400).json({ error: "ownerKey is required" });
    }

    const conv = new ChatConversation({
      ownerKey,
      username: username || "",
      title: (title || "New Conversation").toString().trim() || "New Conversation",
      messages: [],
      lastMessageAt: null,
    });

    const saved = await conv.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating conversation:", err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/chatbot/conversations/:id?ownerKey=...
router.get("/conversations/:id", requireDb, async (req, res) => {
  try {
    const ownerKey = req.query.ownerKey;
    if (!ownerKey) {
      return res.status(400).json({ error: "ownerKey is required" });
    }

    const conv = await ChatConversation.findOne({
      _id: req.params.id,
      ownerKey,
    });

    if (!conv) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    return res.status(200).json(conv);
  } catch (err) {
    console.error("Error fetching conversation:", err);
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/chatbot/conversations/:id/clear?ownerKey=...
router.put("/conversations/:id/clear", requireDb, async (req, res) => {
  try {
    const ownerKey = req.query.ownerKey;
    if (!ownerKey) {
      return res.status(400).json({ error: "ownerKey is required" });
    }

    const conv = await ChatConversation.findOneAndUpdate(
      { _id: req.params.id, ownerKey },
      { $set: { messages: [], lastMessageAt: null } },
      { new: true },
    );

    if (!conv) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    return res.status(200).json(conv);
  } catch (err) {
    console.error("Error clearing conversation:", err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/chatbot/chat - Get response from chatbot (Python version)
router.get("/chat", async (req, res) => {
  try {
    const message = req.query.message || "";
    const username = req.query.username || "Anonymous";
    const category = req.query.category || "General";
    const conversationId = req.query.conversationId || null;
    const ownerKey = req.query.ownerKey || null;
    
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

        // Persist the chat exchange to MongoDB conversation if requested
        if (conversationId && ownerKey) {
          try {
            const conv = await ChatConversation.findOne({ _id: conversationId, ownerKey });
            if (conv) {
              const isFirstUserMessage = (conv.messages || []).filter((m) => m.from === "user").length === 0;
              if (isFirstUserMessage && (!conv.title || conv.title === "New Conversation")) {
                conv.title = buildTitleFromQuestion(message);
              }
              conv.username = conv.username || username;
              conv.messages.push(
                { from: "user", text: message, createdAt: new Date() },
                { from: "ai", text: result.botResponse || "", createdAt: new Date() },
              );
              conv.lastMessageAt = new Date();
              await conv.save();
            }
          } catch (convErr) {
            console.error("Failed to persist conversation:", convErr);
          }
        }
        
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
