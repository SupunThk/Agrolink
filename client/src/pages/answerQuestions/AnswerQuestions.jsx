import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../context/Context";
import "./answerQuestions.css";

export default function AnswerQuestions() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQA, setNewQA] = useState({ category: "", question: "", answer: "" });
  const { user } = useContext(Context);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get("/questions?status=Pending");
        setQuestions(res.data);
      } catch (err) {
        console.error("Failed to fetch pending questions", err);
      }
    };
    fetchQuestions();
  }, []);

  const handleAnswerChange = (qId, value) => {
    setAnswers({ ...answers, [qId]: value });
  };

  const handleAnswerSubmit = async (e, qId) => {
    e.preventDefault();
    const answerContent = answers[qId]?.trim();
    if (!answerContent) return;

    try {
      // Create answer and mark as accepted to change status to "Answered"
      await axios.put(`/questions/${qId}/answer`, {
        username: user.username,
        answer: answerContent,
        isAccepted: true // Making an expert answer accepted by default closes the question
      });

      // Remove the successfully answered question from the list
      setQuestions(questions.filter((q) => q._id !== qId));
      setAnswers({ ...answers, [qId]: "" });

    } catch (err) {
      console.error("Failed to submit answer", err);
      alert("Error submitting answer. Please try again.");
    }
  };

  const handleCustomQASubmit = async (e) => {
    e.preventDefault();
    if (!newQA.question.trim() || !newQA.answer.trim()) return;

    try {
      await axios.post("/questions/training-pair", {
        username: user.username,
        question: newQA.question,
        answer: newQA.answer,
        category: newQA.category || "General",
      });

      alert("Training pair added successfully!");
      setNewQA({ category: "", question: "", answer: "" });
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to submit custom Q&A", err);
      alert("Error submitting custom Q&A. Please try again.");
    }
  };

  return (
    <div className="answerQuestions">
      <div className="answerQuestionsHeader">
        <div className="aqHeaderMain">
          <h1 className="answerQuestionsTitle">Answer Community Questions</h1>
          <p className="answerQuestionsSubtitle">Help farmers by providing expert answers to questions our AI couldn't resolve.</p>
        </div>
        <button className="aqToggleAddBtn" onClick={() => setShowAddForm(!showAddForm)}>
          <i className={`fas fa-${showAddForm ? 'times' : 'plus'}`}></i> {showAddForm ? 'Cancel' : 'Add Training Q&A'}
        </button>
      </div>

      {showAddForm && (
        <div className="aqCustomFormContainer">
          <h2 className="aqCustomFormTitle">Add Custom Q&A Pair</h2>
          <form className="aqCustomForm" onSubmit={handleCustomQASubmit}>
            <div className="aqInputGroup">
              <label>Category (Optional):</label>
              <select
                value={newQA.category}
                onChange={(e) => setNewQA({ ...newQA, category: e.target.value })}
                className="aqSelectInput"
              >
                <option value="">General</option>
                <option value="Organic Farming">Organic Farming</option>
                <option value="Inorganic Farming">Inorganic Farming</option>
                <option value="Crop Diseases">Crop Diseases</option>
                <option value="Pest Management">Pest Management</option>
                <option value="Soil Management">Soil Management</option>
                <option value="Weather & Climate">Weather & Climate</option>
                <option value="Crop Growth">Crop Growth</option>
                <option value="Fertilizer Management">Fertilizer Management</option>
              </select>
            </div>
            <div className="aqInputGroup">
              <label>Question:</label>
              <textarea
                className="aqInput"
                placeholder="What is the question?"
                value={newQA.question}
                onChange={(e) => setNewQA({ ...newQA, question: e.target.value })}
                required
              ></textarea>
            </div>
            <div className="aqInputGroup">
              <label>Expert Answer:</label>
              <textarea
                className="aqInput aqAnswerArea"
                placeholder="Provide a detailed expert answer..."
                value={newQA.answer}
                onChange={(e) => setNewQA({ ...newQA, answer: e.target.value })}
                required
              ></textarea>
            </div>
            <button className="aqSubmit" type="submit" disabled={!newQA.question.trim() || !newQA.answer.trim()}>
              <i className="fas fa-save"></i> Save Training Pair
            </button>
          </form>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="noQuestions">
          <i className="fas fa-check-circle noQuestionsIcon"></i>
          <h2 className="noQuestionsText">All caught up!</h2>
          <p className="noQuestionsSubtext">There are no pending questions at the moment. Great job!</p>
        </div>
      ) : (
        <div className="aqList">
          {questions.map((q) => (
            <div className="aqItem" key={q._id}>
              <div className="aqHeaderInfo">
                <div className="aqUserInfo">
                  <div className="aqAvatar">
                    {q.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="aqUserDetails">
                    <span className="aqUser">{q.username}</span>
                    <span className="aqDate">{new Date(q.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="aqBadges">
                  <span className="aqCategory">{q.category || "General"}</span>
                  <span className="aqConfidence" title="AI Confidence Score">
                    <i className="fas fa-robot"></i> {q.chatbotConfidence || 0}%
                  </span>
                </div>
              </div>

              <div className="aqQuestionBody">
                <p className="aqQuestion">{q.question}</p>
              </div>

              <form className="aqForm" onSubmit={(e) => handleAnswerSubmit(e, q._id)}>
                <label className="aqFormLabel">
                  <i className="fas fa-pen"></i> Provide your expert answer:
                </label>
                <div className="aqInputWrapper">
                  <textarea
                    className="aqInput"
                    placeholder="Type a detailed and helpful answer..."
                    value={answers[q._id] || ""}
                    onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="aqActionRow">
                  <button className="aqSubmit" type="submit" disabled={!answers[q._id]?.trim()}>
                    <i className="fas fa-paper-plane"></i> Submit Answer
                  </button>
                </div>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
