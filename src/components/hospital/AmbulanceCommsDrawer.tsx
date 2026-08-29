"use client";

import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import { hospitalAudio } from "@/lib/hospitalAudio";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import {
  Mic,
  Radio,
  Send,
  Sparkles,
  Volume2,
  X,
  User,
  CheckCheck,
} from "lucide-react";

interface AmbulanceCommsDrawerProps {
  request: AmbulanceRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: "hospital" | "ambulance";
  senderName: string;
  text: string;
  timestamp: string;
  isAudio?: boolean;
}

const PRESET_MESSAGES = [
  "Trauma Bay 01 is prepared and awaiting arrival.",
  "Cross-matched blood units reserved at blood bank.",
  "Attending cardiologist is scrubbed and on standby.",
  "Please administer 15L O2 via non-rebreather mask.",
  "Confirmed en-route. Traffic clearance requested.",
];

export function AmbulanceCommsDrawer({
  request,
  isOpen,
  onClose,
}: AmbulanceCommsDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTransmitting, setIsTransmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (request) {
      // Seed realistic initial messages for the request
      setMessages([
        {
          id: "m1",
          sender: "ambulance",
          senderName: request.acceptedBy || "Paramedic Alpha-1",
          text: `Unit dispatched to ${request.locationLabel}. Patient initial assessment underway.`,
          timestamp: "12 mins ago",
        },
        {
          id: "m2",
          sender: "hospital",
          senderName: "ER Command Desk",
          text: `Roger Alpha-1. Patient flagged as ${request.priority.toUpperCase()} priority with blood group ${request.bloodGroup || "O+"}.`,
          timestamp: "10 mins ago",
        },
        {
          id: "m3",
          sender: "ambulance",
          senderName: request.acceptedBy || "Paramedic Alpha-1",
          text: `Patient loaded. Vitals transmitting on telemetry stream. ETA approx ${request.etaMinutes || 8} mins.`,
          timestamp: "4 mins ago",
        },
      ]);
    }
  }, [request]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen || !request) return null;

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    hospitalAudio.playRadioBeep();

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "hospital",
      senderName: "ER Command Desk",
      text,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Simulate auto-reply from paramedic crew after 3.5 seconds
    setTimeout(() => {
      hospitalAudio.playRadioBeep();
      const replyMsg: ChatMessage = {
        id: `msg_reply_${Date.now()}`,
        sender: "ambulance",
        senderName: request.acceptedBy || "Paramedic Alpha-1",
        text: `Copy that ER Command. Updating patient monitor now.`,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 3500);
  };

  const handleRadioTransmit = () => {
    setIsTransmitting(true);
    hospitalAudio.playRadioBeep();
    setTimeout(() => {
      setIsTransmitting(false);
      handleSend("🎙️ [Audio Radio Transmission - 4.2s recorded voice message]");
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-[#eef6f4] shadow-[0_25px_70px_rgba(13,143,122,0.28)] border-0 flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-0 bg-gradient-to-r from-slate-900 via-[#0f2420] to-slate-900 px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-xs shadow-primary/30">
                <Radio className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-bold">Tactical Ambulance Comms</h3>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <p className="text-xs text-slate-300">
                  Channel 4 · Patient: <strong className="text-white">{request.patientName}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#ebf5f2]">
            <div className="text-center my-2">
              <span className="rounded-full bg-slate-200/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted shadow-2xs">
                Secure Telemetry &amp; Radio Bridge
              </span>
            </div>

            {messages.map((msg) => {
              const isHospital = msg.sender === "hospital";
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    isHospital ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <span className="text-[10px] font-medium text-muted mb-1 px-1">
                    {msg.senderName} · {msg.timestamp}
                  </span>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 text-xs leading-relaxed",
                      isHospital
                        ? "bg-primary text-white rounded-br-xs shadow-[0_4px_16px_rgba(13,143,122,0.25)]"
                        : "bg-white border-0 text-foreground rounded-bl-xs shadow-[0_4px_16px_rgba(15,61,53,0.08)]"
                    )}
                  >
                    {msg.text}
                  </div>
                  {isHospital && (
                    <div className="flex items-center gap-1 text-[10px] text-muted mt-0.5 px-1 font-semibold">
                      <CheckCheck className="h-3 w-3 text-primary" />
                      Delivered to ambulance HUD
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Preset One-Tap Responses */}
          <div className="border-t border-black/5 bg-[#eef6f4] px-4 py-2.5 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
            {PRESET_MESSAGES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(preset)}
                className="shrink-0 rounded-full border-0 bg-white px-3 py-1 text-[11px] font-medium text-muted hover:bg-primary-soft hover:text-primary transition shadow-2xs"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="border-t border-black/5 bg-[#eef6f4] p-4 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type radio dispatch message..."
                className="flex-1 rounded-2xl border-0 bg-white px-4 py-2.5 text-xs text-foreground placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/20 shadow-[0_4px_14px_rgba(15,61,53,0.06)] transition"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-xs shadow-primary/30 hover:bg-primary/90 transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            {/* Simulated PTT Radio Button */}
            <button
              type="button"
              onClick={handleRadioTransmit}
              disabled={isTransmitting}
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all shadow-xs",
                isTransmitting
                  ? "bg-rose-600 text-white animate-pulse shadow-[0_4px_16px_rgba(217,53,74,0.35)]"
                  : "bg-white text-muted hover:bg-slate-100 hover:text-foreground"
              )}
            >
              <Mic className="h-3.5 w-3.5 text-rose-500" />
              <span>{isTransmitting ? "TRANSMITTING OVER FREQ 142.85 MHz..." : "Push to Talk (PTT Simulated Radio)"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
