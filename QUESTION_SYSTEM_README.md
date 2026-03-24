# Question & Expert System - Implementation Summary

## ✅ What's Been Created

### 1. Database Model
- **File**: `api/models/Question.js`
- Stores questions that users ask when the chatbot can't answer well
- Tracks confidence scores, status, expert answers, and training data

### 2. API Routes
- **File**: `api/routes/questions.js`
- Full CRUD operations for managing questions
- Endpoints for adding expert answers and marking helpful responses
- Special endpoint for fetching pending questions for AI training

### 3. Chatbot Integration
- **File**: `api/services/chatbot.py` (Updated)
  - Now returns a confidence score (0-100) with each response
  - Indicates how reliable the answer is
  
- **File**: `api/routes/chatbot.js` (Updated)
  - Auto-saves questions with **confidence < 50%** to database
  - New endpoint: `POST /api/chatbot/ask-expert` for manual questions
  - Includes username and category in requests

### 4. API Registration
- **File**: `api/index.js` (Updated)
- Registered new question routes at `/api/questions`

### 5. Frontend Integration Guide
- **File**: `FRONTEND_INTEGRATION.js`
- Code examples for all operations
- React component template for "Ask Expert" modal

---

## 🚀 How to Use

### For Users (Frontend):

```javascript
// 1. Call chatbot - auto-saves if confidence is low
const response = await fetch(`/api/chatbot/chat?
  message=Your question
  &username=JohnDoe
  &category=Pest Management
`);
// Returns: botResponse, confidence, questionSaved, questionId

// 2. Manually ask expert (if needed)
await fetch("/api/chatbot/ask-expert", {
  method: "POST",
  body: JSON.stringify({
    question: "My question",
    username: "JohnDoe",
    category: "Soil Management"
  })
});
```

### For Expert Farmers (Dashboard):

```javascript
// 1. Get all pending questions
const questions = await fetch("/api/questions?status=Pending");

// 2. Provide an answer
await fetch(`/api/questions/{questionId}/answer`, {
  method: "PUT",
  body: JSON.stringify({
    username: "expert_farmer_name",
    answer: "Here's the solution...",
    isAccepted: true
  })
});

// 3. Mark question as used for AI training
await fetch(`/api/questions/{questionId}/mark-training`, {
  method: "PUT"
});
```

---

## 📊 Question Lifecycle

```
User asks chatbot
        ↓
[If confidence < 50%]
        ↓
Question saved to DB (Pending)
        ↓
Experts review & answer
        ↓
Answer marked as "accepted"
        ↓
Status changes to "Answered"
        ↓
[Optional] Mark for AI training
        ↓
Build better training dataset
```

---

## 🔗 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/questions` | Create question |
| GET | `/api/questions` | List all questions |
| GET | `/api/questions/pending` | Questions for training |
| GET | `/api/questions/:id` | Get single question |
| PUT | `/api/questions/:id/answer` | Add expert answer |
| PUT | `/api/questions/:id/status` | Change status |
| PUT | `/api/questions/:id/mark-training` | Mark for training |
| PUT | `/api/questions/:id/helpful/:answerId` | Mark helpful vote |
| DELETE | `/api/questions/:id` | Delete question |
| GET | `/api/chatbot/chat` | Chat with bot + confidence |
| POST | `/api/chatbot/ask-expert` | Manually save question |

---

## 💡 Key Features

✅ **Automatic Question Saving**: Low-confidence bot answers trigger database saves  
✅ **Expert Network**: Expert farmers can provide answers  
✅ **Training Data**: Answered Q&As can improve the AI model  
✅ **Confidence Scoring**: Every response includes a reliability score  
✅ **Community Knowledge**: Questions become a searchable knowledge base  
✅ **Status Tracking**: Monitor which questions are answered/pending/rejected  

---

## 📝 Next Steps

1. **Frontend Integration**: Use examples in `FRONTEND_INTEGRATION.js`
2. **UI Components**: Create "Ask Expert" button when bot confidence is low
3. **Expert Dashboard**: Build interface for farmers to manage questions
4. **Training Pipeline**: Periodically export answered questions to retrain the AI
5. **Notifications**: Set up alerts when experts answer questions

---

## 🔧 Database Collections

- **Users** - Existing user collection
- **Posts** - Existing blog posts
- **Categories** - Existing categories
- **Questions** - NEW: Stores Q&A for expert farmers
- **Disease** - Existing disease data
- **Knowledge** - Existing knowledge base

---

## ⚙️ Configuration

No additional environment variables needed. The system works with your existing MongoDB setup.

Schema includes timestamps and proper indexing for efficient queries.

---

## 📞 Support

For issues or enhancements:
- Check Question model schema in `api/models/Question.js`
- Review routes in `api/routes/questions.js`
- See chatbot logic in `api/services/chatbot.py`
