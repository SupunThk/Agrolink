import React, { useState, useRef, useEffect, useContext } from "react";
import "./askExpert.css";
import { Context } from "../../context/Context";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AI_NAME = "AgroAI Expert";
const AI_AVATAR = "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=agroai&backgroundColor=d1fae5";

const SUGGESTED = [
  "How do I deal with aphid infestations?",
  "Best crops for clay soil?",
  "Organic fertilizer recommendations",
  "How to improve crop yield?",
  "Irrigation tips for dry seasons",
  "Signs of nutrient deficiency in plants",
];

const TOPICS = [
  { icon: "fas fa-bug", label: "Pest Control" },
  { icon: "fas fa-seedling", label: "Crop Growth" },
  { icon: "fas fa-tint", label: "Irrigation" },
  { icon: "fas fa-leaf", label: "Soil Health" },
  { icon: "fas fa-cloud-sun", label: "Weather & Climate" },
  { icon: "fas fa-microscope", label: "Plant Disease" },
];

export default function AskExpert() {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "ai",
      text: "Hello! I'm **AgroAI**, your personal agricultural expert. I'm here to help you with crop management, soil health, pest control, irrigation, and much more. What would you like to know today?",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeConv, setActiveConv] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const conversations = [
    { id: 0, title: "New Conversation", icon: "fas fa-comment-dots" },
    { id: 1, title: "Pest Control Tips", icon: "fas fa-bug" },
    { id: 2, title: "Soil Analysis", icon: "fas fa-leaf" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg = { id: Date.now(), from: "user", text: msg, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Call the Python chatbot API
      const apiUrl = `/chatbot/chat?message=${encodeURIComponent(msg)}`;
      console.log("Sending message to chatbot:", msg);
      console.log("API URL:", apiUrl);
      
      const response = await axios.get(apiUrl);
      
      console.log("Response status:", response.status);
      console.log("Response ok:", response.statusText);

      if (response.status !== 200) {
        const errorText = await response.data;
        console.error("API Error:", errorText);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const data = response.data;
      console.log("Received response:", data);
      setIsTyping(false);

      const aiMsg = {
        id: Date.now() + 1,
        from: "ai",
        text: data.botResponse,
        time: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);

      const errorMsg = {
        id: Date.now() + 1,
        from: "ai",
        text: "Backend not responding. Make sure the API server is running on port 5000.",
        time: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (d) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const renderText = (text) =>
    text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  return (
    <div className="ae-page-wrapper fadeIn">
      <div className="ae-root">
      {/* Left Sidebar */}
      <aside className="ae-sidebar glass-panel">
        <div className="ae-sidebar-header">
          <div className="ae-sidebar-logo">
            <i className="fas fa-robot"></i>
          </div>
          <div>
            <h3 className="ae-sidebar-title">AgroAI</h3>
            <span className="ae-sidebar-subtitle">Expert Assistant</span>
          </div>
        </div>

        <button className="ae-new-btn" onClick={() => setMessages([
          { id: 1, from: "ai", text: "Hello! I'm **AgroAI**, your personal agricultural expert. What would you like to know today?", time: new Date() }
        ])}>
          <i className="fas fa-plus"></i> New Conversation
        </button>

        <div className="ae-sidebar-section">
          <p className="ae-sidebar-section-label">Recent Chats</p>
          {conversations.map((c) => (
            <button
              key={c.id}
              className={"ae-conv-item" + (activeConv === c.id ? " active" : "")}
              onClick={() => setActiveConv(c.id)}
            >
              <i className={c.icon}></i>
              <span>{c.title}</span>
            </button>
          ))}
        </div>

        <div className="ae-sidebar-section">
          <p className="ae-sidebar-section-label">Browse Topics</p>
          <div className="ae-topics-grid">
            {TOPICS.map((t) => (
              <button
                key={t.label}
                className="ae-topic-chip"
                onClick={() => sendMessage("Tell me about " + t.label)}
              >
                <i className={t.icon}></i>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="ae-sidebar-footer">
          <div className="ae-user-row">
            <div className="ae-user-avatar">
              {user?.profilePic ? (
                <img src={"http://localhost:5000/images/" + user.profilePic} alt="You" />
              ) : (
                <i className="fas fa-user"></i>
              )}
            </div>
            <div>
              <p className="ae-user-name">{user?.username || "Guest"}</p>
              <p className="ae-user-role">Community Member</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="ae-main">
        {/* Chat Header */}
        <div className="ae-chat-header glass-panel">
          <div className="ae-chat-header-left">
            <img src={AI_AVATAR} alt="AI" className="ae-ai-avatar" />
            <div>
              <h4 className="ae-chat-name">{AI_NAME}</h4>
              <span className="ae-chat-status">
                <span className="ae-status-dot"></span> Online &amp; Ready
              </span>
            </div>
          </div>
          <div className="ae-chat-header-right">
            <button className="ae-header-icon-btn" title="Clear chat" onClick={() => setMessages([
              { id: 1, from: "ai", text: "Hello! I'm **AgroAI**, your personal agricultural expert. What would you like to know today?", time: new Date() }
            ])}>
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="ae-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={"ae-msg-row" + (msg.from === "user" ? " user" : "")}>
              {msg.from === "ai" && (
                <img src={AI_AVATAR} alt="AI" className="ae-msg-avatar" />
              )}
              <div className={"ae-bubble" + (msg.from === "user" ? " user" : " ai")}>
                <p
                  className="ae-bubble-text"
                  dangerouslySetInnerHTML={{ __html: renderText(msg.text) }}
                />
                <span className="ae-bubble-time">{formatTime(msg.time)}</span>
              </div>
              {msg.from === "user" && (
                <div className="ae-user-msg-avatar">
                  {user?.profilePic ? (
                    <img src={"http://localhost:5000/images/" + user.profilePic} alt="You" />
                  ) : (
                    <i className="fas fa-user"></i>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="ae-msg-row">
              <img src={AI_AVATAR} alt="AI" className="ae-msg-avatar" />
              <div className="ae-bubble ai ae-typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="ae-suggestions">
            <p className="ae-suggestions-label">Suggested questions</p>
            <div className="ae-suggestions-chips">
              {SUGGESTED.map((s) => (
                <button key={s} className="ae-suggestion-chip" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="ae-input-bar glass-panel">
          <textarea
            ref={inputRef}
            className="ae-input"
            placeholder="Ask about crops, pests, soil, irrigation..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            disabled={isTyping}
          />
          <button
            className={"ae-send-btn" + (input.trim() ? " active" : "")}
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
        <p className="ae-disclaimer">AgroAI may produce inaccurate information. Always consult a certified agronomist for critical decisions.</p>
      </main>
    </div>
    </div>
  );
}
