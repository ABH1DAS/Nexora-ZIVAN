"use client";

import { Button } from "@/components/ui/Button";
import { aiService } from "@/services/ai";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertCircle,
  Bot,
  Check,
  Copy,
  Heart,
  Moon,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  User,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import React, { FormEvent, useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const SAMPLE_PROMPTS = [
  { label: "Sleep Quality", prompt: "How can I improve my deep REM sleep and wake up feeling refreshed?", icon: Moon },
  { label: "Blood Pressure", prompt: "What diet and lifestyle habits help naturally lower blood pressure?", icon: Heart },
  { label: "Stress & Anxiety", prompt: "Can you guide me through a 5-minute breathing technique for stress relief?", icon: Activity },
  { label: "Daily Hydration", prompt: "What is my optimal daily water intake during physical workouts?", icon: Zap },
];

function renderFormattedLine(text: string, isUser: boolean) {
  const parts: React.ReactNode[] = [];
  let keyIndex = 0;
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(
        <strong
          key={`b-${keyIndex++}`}
          className={cn("font-bold", isUser ? "text-white" : "text-slate-900")}
        >
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // *italic*
      parts.push(
        <em key={`i-${keyIndex++}`} className="italic opacity-90">
          {match[3]}
        </em>
      );
    } else if (match[4]) {
      // `code`
      parts.push(
        <code
          key={`c-${keyIndex++}`}
          className={cn(
            "rounded px-1.5 py-0.5 font-mono text-xs",
            isUser ? "bg-white/20 text-white" : "bg-slate-100 text-teal-800"
          )}
        >
          {match[4]}
        </code>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

function FormattedMessage({ content, isUser }: { content: string; isUser: boolean }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Heading ### or ##
        if (trimmed.startsWith("### ")) {
          return (
            <h4
              key={idx}
              className={cn(
                "mt-2.5 mb-1 font-bold text-sm tracking-tight",
                isUser ? "text-white" : "text-slate-900"
              )}
            >
              {renderFormattedLine(trimmed.replace(/^###\s+/, ""), isUser)}
            </h4>
          );
        }

        if (trimmed.startsWith("## ")) {
          return (
            <h3
              key={idx}
              className={cn(
                "mt-3 mb-1 font-bold text-base tracking-tight",
                isUser ? "text-white" : "text-slate-900"
              )}
            >
              {renderFormattedLine(trimmed.replace(/^##\s+/, ""), isUser)}
            </h3>
          );
        }

        // Bullet point • or - or *
        if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const bulletContent = trimmed.replace(/^[•\-\*]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-1">
              <span
                className={cn(
                  "mt-2 h-1.5 w-1.5 shrink-0 rounded-full",
                  isUser ? "bg-white" : "bg-teal-600"
                )}
              />
              <span className="flex-1">{renderFormattedLine(bulletContent, isUser)}</span>
            </div>
          );
        }

        // Numbered list item "1. ", "2. "
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-1">
              <span
                className={cn(
                  "font-bold text-xs shrink-0 mt-0.5",
                  isUser ? "text-white/90" : "text-teal-700"
                )}
              >
                {numMatch[1]}.
              </span>
              <span className="flex-1">{renderFormattedLine(numMatch[2], isUser)}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="m-0">
            {renderFormattedLine(line, isUser)}
          </p>
        );
      })}
    </div>
  );
}

export default function DashboardAiAssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message
    const firstName = user?.name ? user.name.split(" ")[0] : "Abhi";
    setMessages([
      {
        id: "msg_init_1",
        role: "assistant",
        content: `Hello **${firstName}**! 👋 I am **ZIVAN AI**, your personal assistant.\n\nAsk me anything about symptoms, nutrition plans, vitals analysis, sleep habits, stress reduction, or any daily questions. How can I assist you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [user?.name]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function handleSend(userText: string) {
    if (!userText.trim() || isTyping) return;

    const query = userText.trim();
    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        content: m.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      const reply = data.reply || "I am here to support your journey. How else can I help?";

      const aiMsg: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        role: "assistant",
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("AI chat communication error:", err);
      const fallbackMsg: ChatMessage = {
        id: `msg_ai_err_${Date.now()}`,
        role: "assistant",
        content:
          "I am here to assist you. Key pillars of good health include getting 7–8 hours of restorative sleep, drinking 2.5L+ of water daily, balanced nutrition, and active movement. What specific topic would you like to explore?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    handleSend(input);
  }

  function copyToClipboard(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function toggleSpeech(id: string, text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-50 px-3.5 py-1 text-xs font-bold text-teal-900">
            <Sparkles className="h-3.5 w-3.5 text-teal-600 animate-spin" />
            Powered by Google Gemini 1.5
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            AI Assistant
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Ask any questions regarding symptoms, nutrition, fitness, sleep, daily planning, or general assistance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
              window.speechSynthesis.cancel();
            }
            setMessages([messages[0]]);
          }}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-bold text-muted hover:text-foreground hover:bg-slate-50 transition shadow-2xs cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          New Conversation
        </button>
      </div>

      {/* Prominent Medical Disclaimer Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-amber-950 shadow-xs">
        <AlertCircle className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong className="font-bold">Medical Safety Note: </strong>
          ZIVAN AI provides intelligent clinical education and wellness guidance. In life-threatening emergencies (e.g. crushing chest pain, stroke symptoms, respiratory distress), please trigger the **Emergency SOS** hub immediately.
        </div>
      </div>

      {/* Main Chat Interface Container */}
      <section className="flex flex-col h-[620px] rounded-[2.5rem] border border-border bg-white shadow-xl overflow-hidden">
        {/* Chat Top Banner */}
        <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#0f2420] via-[#133830] to-[#0f2420] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-400/20 text-teal-300 border border-teal-400/30 shadow-inner">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display font-bold text-base text-white">ZIVAN AI Assistant</p>
                <span className="flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  GEMINI ONLINE
                </span>
              </div>
              <p className="text-xs text-teal-200/70">Health, Wellness &amp; General Assistance</p>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 max-w-[90%] sm:max-w-[80%]",
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto flex-row"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-bold shadow-xs",
                    isUser
                      ? "bg-teal-600 text-white"
                      : "bg-[#0f2420] text-teal-300 border border-teal-500/30"
                  )}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div className="space-y-1.5">
                  <div
                    className={cn(
                      "rounded-[1.5rem] p-4 text-sm leading-relaxed shadow-sm",
                      isUser
                        ? "rounded-tr-xs bg-teal-600 text-white"
                        : "rounded-tl-xs bg-white text-slate-800 border border-border/80"
                    )}
                  >
                    <FormattedMessage content={msg.content} isUser={isUser} />
                  </div>

                  {/* Actions for AI messages */}
                  {!isUser && (
                    <div className="flex items-center gap-3 px-2 text-xs text-muted">
                      <span>{msg.timestamp}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(msg.id, msg.content)}
                        className="flex items-center gap-1 hover:text-foreground transition cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleSpeech(msg.id, msg.content)}
                        className="flex items-center gap-1 hover:text-foreground transition cursor-pointer"
                        title="Read aloud"
                      >
                        {speakingId === msg.id ? (
                          <>
                            <VolumeX className="h-3 w-3 text-rose-500 animate-pulse" />
                            <span className="text-rose-500 font-bold">Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3 w-3" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#0f2420] text-teal-300 shadow-xs border border-teal-500/30">
                <Bot className="h-4 w-4 animate-spin" />
              </div>
              <div className="rounded-[1.5rem] rounded-tl-xs bg-white border border-border p-4 text-xs font-semibold text-muted shadow-sm flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-teal-500 animate-ping" />
                ZIVAN AI is typing with Gemini...
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="border-t border-border bg-white px-4 py-2.5 overflow-x-auto flex items-center gap-2 scrollbar-none">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider shrink-0">
            Quick Topics:
          </span>
          {SAMPLE_PROMPTS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleSend(item.prompt)}
                disabled={isTyping}
                className="flex items-center gap-1.5 shrink-0 rounded-xl border border-teal-500/20 bg-teal-50/70 px-3 py-1.5 text-xs font-semibold text-teal-900 hover:bg-teal-100 hover:border-teal-400 transition shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <Icon className="h-3 w-3 text-teal-700" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Input Bar */}
        <form onSubmit={onSubmit} className="border-t border-border bg-white p-3 sm:p-4 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask ZIVAN AI anything about your health, vitals, nutrition, or daily questions..."
            disabled={isTyping}
            className="flex-1 rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-teal-500 focus:bg-white focus:outline-hidden transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md hover:bg-teal-500 transition disabled:opacity-40 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </section>
    </div>
  );
}
