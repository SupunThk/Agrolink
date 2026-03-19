import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../context/Context";
import "./answerQuestions.css";

export default function AnswerQuestions() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
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

  return (
    <div className="answerQuestions">
      <div className="answerQuestionsHeader">
        <h1 className="answerQuestionsTitle">Answer Community Questions</h1>
        <p className="answerQuestionsSubtitle">Help farmers by providing expert answers to questions our AI couldn't resolve.</p>
      </div>
      
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
