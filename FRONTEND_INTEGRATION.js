// Frontend Integration Guide for Question System

// ============================================================================
// 1. CHATBOT CALL - With question auto-save feature
// ============================================================================

// Example: Call chatbot and handle low confidence
const askChatbot = async (message, username = "User", category = "General") => {
  try {
    const response = await fetch(
      `/api/chatbot/chat?message=${encodeURIComponent(message)}&username=${encodeURIComponent(username)}&category=${encodeURIComponent(category)}`
    );
    
    const data = await response.json();
    
    console.log("Bot Response:", data.botResponse);
    console.log("Confidence:", data.confidence); // 0-100
    
    // If confidence is low, show "Ask Expert" button
    if (data.confidence < 50) {
      console.log("Question saved for expert review:", data.questionId);
      showAskExpertOption(message, data.questionId);
    }
    
    return data;
  } catch (err) {
    console.error("Chatbot error:", err);
  }
};

// ============================================================================
// 2. MANUALLY SAVE QUESTION - When user clicks "Ask Expert"
// ============================================================================

const askExpert = async (question, username, category = "General") => {
  try {
    const response = await fetch("/api/chatbot/ask-expert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        username,
        category,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Question saved! ID:", data.question._id);
      showNotification("Your question has been saved. Expert farmers will respond soon!");
      return data.question;
    } else {
      console.error("Error saving question:", data.error);
    }
  } catch (err) {
    console.error("Error:", err);
  }
};

// ============================================================================
// 3. FETCH ALL QUESTIONS - For admin/farmer dashboard
// ============================================================================

const fetchQuestions = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`/api/questions?${queryParams}`);
    const questions = await response.json();
    return questions;
  } catch (err) {
    console.error("Error fetching questions:", err);
  }
};

// Example filters:
// fetchQuestions({ status: "Pending" }) - Get pending questions
// fetchQuestions({ status: "Answered" }) - Get answered questions
// fetchQuestions({ category: "Pest Management" }) - Filter by category
// fetchQuestions({ username: "farmer_john" }) - Filter by user

// ============================================================================
// 4. FETCH PENDING QUESTIONS FOR TRAINING
// ============================================================================

const getPendingQuestionsForTraining = async (limit = 50) => {
  try {
    const response = await fetch(`/api/questions/pending?limit=${limit}`);
    const questions = await response.json();
    return questions;
  } catch (err) {
    console.error("Error fetching training questions:", err);
  }
};

// ============================================================================
// 5. GET SINGLE QUESTION WITH ANSWERS
// ============================================================================

const getQuestion = async (questionId) => {
  try {
    const response = await fetch(`/api/questions/${questionId}`);
    const question = await response.json();
    return question;
  } catch (err) {
    console.error("Error fetching question:", err);
  }
};

// ============================================================================
// 6. ADD ANSWER FROM EXPERT FARMER
// ============================================================================

const addExpertAnswer = async (questionId, username, answer, isAccepted = false) => {
  try {
    const response = await fetch(`/api/questions/${questionId}/answer`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        answer,
        isAccepted, // Set to true if this is the best answer
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Answer added successfully!");
      return data;
    } else {
      console.error("Error adding answer:", data.error);
    }
  } catch (err) {
    console.error("Error:", err);
  }
};

// ============================================================================
// 7. MARK QUESTION AS USED FOR AI TRAINING
// ============================================================================

const markForTraining = async (questionId) => {
  try {
    const response = await fetch(`/api/questions/${questionId}/mark-training`, {
      method: "PUT",
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Question marked for training!");
      return data;
    }
  } catch (err) {
    console.error("Error marking for training:", err);
  }
};

// ============================================================================
// 8. MARK ANSWER AS HELPFUL
// ============================================================================

const markAnswerHelpful = async (questionId, answerId) => {
  try {
    const response = await fetch(`/api/questions/${questionId}/helpful/${answerId}`, {
      method: "PUT",
    });
    
    const data = await response.json();
    console.log("Answer marked as helpful!");
    return data;
  } catch (err) {
    console.error("Error:", err);
  }
};

// ============================================================================
// 9. UPDATE QUESTION STATUS
// ============================================================================

const updateQuestionStatus = async (questionId, status) => {
  // status can be: "Pending", "Answered", "Rejected"
  try {
    const response = await fetch(`/api/questions/${questionId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    
    const data = await response.json();
    console.log("Question status updated!");
    return data;
  } catch (err) {
    console.error("Error:", err);
  }
};

// ============================================================================
// 10. DELETE QUESTION
// ============================================================================

const deleteQuestion = async (questionId) => {
  try {
    const response = await fetch(`/api/questions/${questionId}`, {
      method: "DELETE",
    });
    
    if (response.ok) {
      console.log("Question deleted!");
      return true;
    }
  } catch (err) {
    console.error("Error deleting question:", err);
  }
};

// ============================================================================
// REACT COMPONENT EXAMPLE - Ask Expert Modal
// ============================================================================

import React, { useState } from "react";

export const AskExpertModal = ({ show, onClose, defaultQuestion = "", username }) => {
  const [question, setQuestion] = useState(defaultQuestion);
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await askExpert(question, username, category);
      setQuestion("");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Ask Expert Farmers</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Your Question:</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your question here..."
              required
            />
          </div>

          <div>
            <label>Category:</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>General</option>
              <option>Pest Management</option>
              <option>Crop Diseases</option>
              <option>Soil Management</option>
              <option>Fertilizer Management</option>
              <option>Weather & Climate</option>
            </select>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Ask Experts"}
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};
