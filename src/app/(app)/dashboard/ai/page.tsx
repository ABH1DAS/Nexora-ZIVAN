"use client";

import { Button } from "@/components/ui/Button";
import { aiService } from "@/services/ai";
import { cn } from "@/lib/utils";
import { AlertCircle, Bot, Send, Sparkles, User, RefreshCw } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const SAMPLE_PROMPTS = [
  "How can I improve my sleep quality?",
  "What are good breathing exercises for stress relief?",
  "How much water should I drink during workouts?",
  "Tips for maintaining a healthy daily routine?",
];

const HEALTH_KNOWLEDGE_BASE: Record<string, string> = {
  sleep: "To improve sleep quality, try maintaining a consistent sleep schedule (going to bed and waking up at the same time), keeping your bedroom cool and quiet, and avoiding screen exposure 30–60 minutes before bedtime.",
  stress: "For stress reduction, box breathing (4s inhale, 4s hold, 4s exhale) is highly effective. Regular physical activity, mindful journaling, and 10-minute nature walks also significantly lower cortisol levels.",
  water: "As a general guideline, aim for 2.0 to 2.5 Liters of water daily. During workouts, add an extra 350–500 ml for every 30 minutes of vigorous exercise to replace sweat losses.",
  routine: "Building a sustainable routine starts with small habits: log your water intake, complete a daily 5-minute mood check-in, aim for 7–8 hours of sleep, and get at least 30 minutes of daily physical activity.",
};

export default function DashboardAiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        id: "msg_init_1",
        role: "assistant",
        content: "Hello Abhi! I am ZIVAN AI, your personal health and wellbeing companion. How can I support your health journey today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function handleSend(userText: string) {
    if (!userText.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      content: userText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI Health Companion Response
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let reply = "That is a great question regarding your health. Focusing on consistent daily habits—such as adequate sleep, balanced nutrition, staying hydrated, and regular movement—plays a vital role in maintaining optimal wellbeing.";

      if (lower.includes("sleep")) reply = HEALTH_KNOWLEDGE_BASE.sleep;
      else if (lower.includes("stress") || lower.includes("breath")) reply = HEALTH_KNOWLEDGE_BASE.stress;
      else if (lower.includes("water") || lower.includes("hydrat")) reply = HEALTH_KNOWLEDGE_BASE.water;
      else if (lower.includes("routine") || lower.includes("habit")) reply = HEALTH_KNOWLEDGE_BASE.routine;

      const aiMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        role: "assistant",
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    handleSend(input);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-900">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" aria-hidden />
          AI Health & Wellness Companion
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
          AI Health Assistant
        </h1>
        <p className="mt-1 text-sm text-muted">
          Ask questions about health habits, sleep, stress management, and daily wellness.
        </p>
      </div>

      {/* Prominent Medical Disclaimer Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-sm">
        <AlertCircle className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong className="font-bold">Medical Disclaimer: </strong>
          {aiService.disclaimer} ZIVAN AI provides general health and lifestyle guidance. In case of medical emergencies or symptoms, please call emergency services immediately or contact a qualified physician.
        </div>
      </div>

      {/* Main Chat Interface Container */}
      <section className="flex flex-col h-[580px] rounded-[2.25rem] border border-border bg-white shadow-sm overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-border bg-[#0f2420] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-400/20 text-teal-300 border border-teal-400/30">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display font-bold text-base text-white">ZIVAN AI Health Companion</p>
              <p className="text-xs text-teal-200/70">Always available · General Wellness</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMessages([messages[0]])}
            className="flex items-center gap-1 text-xs font-semibold text-teal-200/80 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Clear Chat
          </button>
        </div>

        {/* Message Thread Box */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto flex-row",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-sm",
                    isUser ? "bg-primary text-white" : "bg-[#0f2420] text-teal-300",
                  )}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div>
                  <div
                    className={cn(
                      "rounded-2xl p-4 text-sm leading-relaxed shadow-sm",
                      isUser
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-white border border-border text-slate-800 rounded-tl-none",
                    )}
                  >
                    {msg.content}
                  </div>
                  <span className="block mt-1 text-[10px] text-muted font-medium px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 mr-auto max-w-[80%] items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0f2420] text-teal-300">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-none border border-border bg-white p-3 text-xs text-muted font-medium animate-pulse">
                ZIVAN AI is typing guidance...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Sample Prompts Row */}
        <div className="border-t border-border bg-white px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          {SAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              className="shrink-0 rounded-full border border-border bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-primary hover:bg-primary-soft hover:text-primary transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={onSubmit} className="p-4 border-t border-border bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask ZIVAN AI a general health or wellbeing question..."
            className="h-12 flex-1 rounded-2xl border border-border bg-[#fbfefd] px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <Button type="submit" disabled={!input.trim() || isTyping}>
            <Send className="h-4 w-4" /> Send
          </Button>
        </form>
      </section>
    </div>
  );
}
