import React, { useState, useRef, useEffect, useContext } from "react";
import "./askExpert.css";
import { Context } from "../../context/Context";
import { useNavigate } from "react-router-dom";

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

const AI_RESPONSES = [
  "Great question! Based on current agricultural best practices, I recommend starting with a soil test to understand your specific conditions. This gives you a baseline to tailor any treatment or planting strategy effectively.",
  "For sustainable farming, it's important to consider crop rotation and companion planting. These methods naturally reduce pests and improve soil fertility over time without heavy reliance on chemicals.",
  "I'd suggest monitoring your crops weekly, especially during growth peaks. Early detection of disease or pest pressure allows for targeted, lower-impact interventions that protect both yield and ecosystem health.",
  "Organic matter is key! Incorporating compost, cover crops, and mulch can dramatically improve soil structure, water retention, and microbial activity — all of which contribute to healthier plants and higher yields.",
  "Water management is critical. Drip irrigation systems can reduce water usage by up to 50% while keeping plant roots consistently moist. Pair that with mulching and you'll see significant improvements.",
  "That's a common challenge among farmers. The most effective approach combines integrated pest management (IPM) with regular scouting and threshold-based treatment decisions to minimize chemical use.",
];

let aiResponseIndex = 0;
function getAIResponse() {
  const resp = AI_RESPONSES[aiResponseIndex % AI_RESPONSES.length];
  aiResponseIndex++;
  return resp;
}

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

  const sendMessage = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    const userMsg = { id: Date.now(), from: "user", text: msg, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const aiMsg = {
        id: Date.now() + 1,
        from: "ai",
        text: getAIResponse(),
        time: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1600 + Math.random() * 800);
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
