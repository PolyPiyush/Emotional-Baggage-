/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChatMessage, Mentor } from "../types";
import { Send, Sparkles, User, Brain, AlertOctagon, RefreshCw, MessageSquare } from "lucide-react";

interface AIChatBuddyViewProps {
  mentor: Mentor;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const SUGGESTED_PROMPTS = [
  "Help me plan today",
  "Motivate me",
  "Review my progress",
  "Break my goal",
  "Analyse my productivity"
];

export default function AIChatBuddyView({
  mentor,
  chatHistory,
  setChatHistory
}: AIChatBuddyViewProps) {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      // Send past messages as context
      const chatContext = chatHistory.slice(-6).map(ch => ({
        sender: ch.sender,
        text: ch.text
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          mentorId: mentor.id,
          chatHistory: chatContext
        })
      });

      if (!response.ok) {
        throw new Error("Chat api failed");
      }

      const data = await response.json();
      
      const mentorMsg: ChatMessage = {
        id: `mentor-${Date.now()}`,
        sender: "mentor",
        text: data.text || "...",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory((prev) => [...prev, mentorMsg]);
    } catch (error) {
      console.error("AI Buddy error:", error);
      
      // Fallback response representing mentor
      let fallbackText = "Dojo connection failed, bro! Check your secrets configurations!";
      if (mentor.id === "savage_sister") {
        fallbackText = "Aww, are your server connections as sluggish as your work ethic? Sort your API secrets, lazy! 🙄";
      } else if (mentor.id === "strict_father") {
        fallbackText = "Dojo systems are offline. Rectify your credentials. Excuses do not bring progress.";
      } else if (mentor.id === "enforcer_mom") {
        fallbackText = "WHY IS THE SERVER DISCONNECTED?! DID YOU ACCIDENTALLY TRIP THE ROUTER WIRE? SET UP YOUR SECRETS NOW! 😡";
      } else if (mentor.id === "steven_he") {
        fallbackText = "EMOTIONAL DAMAGE! The server is offline, laa! What did you do, buy the router from Wish.com? Fix the secrets! 🩴";
      }

      const errorMsg: ChatMessage = {
        id: `mentor-err-${Date.now()}`,
        sender: "mentor",
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-chatbuddy-container" className="flex flex-col h-full text-white pb-24 relative overflow-hidden dot-grid">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#7B2EFF]/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <img
          src={mentor.avatar}
          alt={mentor.name}
          referrerPolicy="no-referrer"
          className="w-10 h-10 rounded-xl object-cover border border-[#7B2EFF]/35"
        />
        <div>
          <h3 className="text-xs font-black leading-none flex items-center gap-1.5 font-sans">
            {mentor.name.split(" ")[0]} <span className="text-[9px] font-mono uppercase bg-[#7B2EFF]/15 text-[#7B2EFF] px-1.5 py-0.5 rounded border border-[#7B2EFF]/30 font-black tracking-wider">Sensei AI</span>
          </h3>
          <span className="text-[10px] font-mono text-white/40 mt-1 block font-bold">Active personality: {mentor.personality}</span>
        </div>
      </div>

      {/* CHAT THREAD */}
      <div
        id="chat-history-thread"
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {chatHistory.length === 0 && (
          <div className="text-center py-8 max-w-xs mx-auto space-y-3">
            <MessageSquare className="w-8 h-8 text-[#7B2EFF]/50 mx-auto animate-pulse" />
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono purple-text-glow">Dōjō Coaching Session</h4>
            <p className="text-[10px] text-white/40 leading-normal font-mono font-bold">
              Ask your Sensei to structure your daily roadmap, boost your energy, or critique your latest habits!
            </p>
          </div>
        )}

        {chatHistory.map((message) => {
          const isUser = message.sender === "user";
          return (
            <div
              key={message.id}
              className={`flex gap-2 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {/* Profile Bubble Avatar */}
              <div className="shrink-0">
                {isUser ? (
                  <span className="w-7 h-7 bg-black/40 border border-white/10 text-white/60 rounded-full flex items-center justify-center text-xs">
                    <User className="w-4 h-4" />
                  </span>
                ) : (
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-lg object-cover border border-[#7B2EFF]/20"
                  />
                )}
              </div>

              {/* Speech Bubble */}
              <div className="space-y-1">
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed font-sans border shadow-md ${
                    isUser
                      ? "bg-[#7B2EFF]/20 border-[#7B2EFF]/35 text-white rounded-tr-none shadow-[0_4px_12px_rgba(123,46,255,0.15)]"
                      : "glass border-white/10 text-white/90 rounded-tl-none"
                  }`}
                >
                  {message.text}
                </div>
                <span className="text-[9px] font-mono text-white/30 block px-1 text-right font-semibold">
                  {message.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* LOADING INDICATOR / MENTOR TYPING */}
        {loading && (
          <div className="flex gap-2 max-w-[85%] mr-auto items-start">
            <img
              src={mentor.avatar}
              alt={mentor.name}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-lg object-cover border border-[#7B2EFF]/20 shrink-0"
            />
            <div className="space-y-1">
              <div className="bg-black/40 border border-white/10 p-3 rounded-2xl rounded-tl-none text-xxs font-mono text-[#7B2EFF] flex items-center gap-2 font-black uppercase">
                <span>{mentor.name.split(" ")[0]} is compiling response</span>
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-[#7B2EFF] rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 bg-[#7B2EFF] rounded-full animate-bounce delay-150"></span>
                  <span className="w-1 h-1 bg-[#7B2EFF] rounded-full animate-bounce delay-300"></span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QUICK CHIPS RECOMMENDATIONS */}
      {chatHistory.length > 0 && !loading && (
        <div className="flex gap-2 overflow-x-auto px-4 py-2 bg-black/40 border-t border-white/10 shrink-0 scrollbar-none">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              id={`quick-prompt-${prompt.replace(/\s+/g, "-")}`}
              onClick={() => handleSend(prompt)}
              className="bg-black/60 border border-[#7B2EFF]/25 text-[#7B2EFF] hover:text-white px-2.5 py-1 rounded-lg text-xxs font-mono font-black transition-colors shrink-0 flex items-center gap-1 uppercase tracking-wider"
            >
              <Sparkles className="w-2.5 h-2.5 text-[#7B2EFF]" /> {prompt}
            </button>
          ))}
        </div>
      )}

      {/* CHAT INPUT BAR */}
      <div className="p-3 border-t border-white/10 bg-black/60 shrink-0 flex gap-2">
        <input
          id="chat-message-input"
          type="text"
          placeholder={`Speak with ${mentor.name.split(" ")[0]} Sensei...`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(inputValue)}
          disabled={loading}
          className="flex-1 bg-black/50 border border-white/10 focus:border-[#7B2EFF] rounded-xl px-3 py-2.5 text-xs text-white outline-none placeholder-white/20 font-bold"
        />
        <button
          id="send-chat-message-btn"
          onClick={() => handleSend(inputValue)}
          disabled={loading || !inputValue.trim()}
          className="bg-[#7B2EFF] hover:brightness-110 disabled:bg-zinc-900 disabled:text-zinc-600 transition-all rounded-xl px-3 flex items-center justify-center text-white cursor-pointer shadow-[0_4px_12px_rgba(123,46,255,0.3)]"
        >
          <Send className="w-4 h-4 fill-current" />
        </button>
      </div>
    </div>
  );
}
