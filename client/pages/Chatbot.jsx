import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export default function Chatbot({ messages, input, setInput, sendMessage }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="bg-red-600 hover:bg-red-700 p-4 rounded-full shadow-lg text-white flex items-center justify-center backdrop-blur-sm"
        aria-label={isChatOpen ? "Close chat" : "Open chat"}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 
                        bg-black/70 backdrop-blur-md 
                        text-white shadow-2xl rounded-2xl 
                        flex flex-col overflow-hidden border border-red-600/40">
          {/* Header */}
          <div className="bg-red-600/90 backdrop-blur-md p-4 flex justify-between items-center font-bold">
            <span>Assistant</span>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:text-gray-200 transition"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-2 custom-scrollbar">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-xl max-w-[75%] shadow-md transition ${
                  msg.from === "bot"
                    ? "bg-red-600/80 text-white self-start"
                    : "bg-gray-800/70 text-white self-end ml-auto"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-2 border-t border-red-600/40 flex bg-black/60 backdrop-blur-sm">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => {
  if (e.key === "Enter") {
    sendMessage();
    setInput(""); // clear on Enter too
  }
}}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-white border border-red-600/50 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-600 placeholder-gray-400"
            />
            <button
  onClick={() => {
    sendMessage();
    setInput(""); // Clear input after sending
  }}
  className="ml-2 bg-red-600/90 hover:bg-red-700 px-3 rounded-lg text-white shadow transition"
>
  Send
</button>
          </div>
        </div>
      )}
    </div>
  );
}