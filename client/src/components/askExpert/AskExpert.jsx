import React, { useState, useEffect, useRef } from "react";
import "./askExpert.css";

export default function AskExpert() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Agrobot. How can I help you with your agricultural questions today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message to chat
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      // Send message to chatbot API
      console.log("Sending message:", inputValue);
      const response = await fetch(
        `/api/chatbot/chat?message=${encodeURIComponent(inputValue)}`
      );

      if (!response.ok) {
        throw new Error("Failed to get response from chatbot");
      }

      const data = await response.json();
      console.log("Received response:", data);

      // Add bot response to chat
      const botMessage = {
        id: messages.length + 2,
        text: data.botResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      console.log("Adding bot message:", botMessage);
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I encountered an error. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="askExpert-container">
      <div className="askExpert-card">
        <div className="askExpert-header">
          <h2 className="askExpert-title">
            <i className="fas fa-robot"></i> Ask Agrobot
          </h2>
          <p className="askExpert-subtitle">
            Your AI Agricultural Assistant
          </p>
        </div>

        <div className="askExpert-chat-area">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`askExpert-message ${msg.sender === "user" ? "user-message" : "bot-message"}`}
            >
              <div className="askExpert-message-content">
                <p>{msg.text}</p>
                <span className="askExpert-timestamp">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="askExpert-message bot-message">
              <div className="askExpert-message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="askExpert-form" onSubmit={handleSendMessage}>
          <div className="askExpert-input-wrapper">
            <input
              type="text"
              className="askExpert-input"
              placeholder="Ask your agricultural question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={loading}
            />
            <button
              className="askExpert-btn"
              type="submit"
              disabled={loading || !inputValue.trim()}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
