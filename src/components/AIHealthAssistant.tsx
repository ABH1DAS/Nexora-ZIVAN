"use client";

import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { aiService } from "@/services/ai";
import { Bell, LineChart, Moon, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function AIHealthAssistant() {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  useEffect(() => {
    void aiService.getDemoConversation().then(setMessages);
  }, []);

  return (
    <Section
      id="ai"
      eyebrow="AI Companion"
      title="Meet Your Health Companion."
      description="ZIVAN AI helps explain everyday trends and suggests general wellbeing actions — clearly labeled as guidance, not medical advice."
    >
      <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <div className="overflow-hidden rounded-[2rem] border border-border bg-[#0f2420] shadow-[0_30px_70px_rgba(15,61,53,0.18)]">
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-400/20 text-teal-200">
                <Sparkles className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-white">
                  ZIVAN AI
                </p>
                <p className="text-xs text-white/55">Demo conversation</p>
              </div>
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              {messages.map((message) => (
                <div
                  key={`${message.role}-${message.content.slice(0, 16)}`}
                  className={
                    message.role === "user"
                      ? "ml-auto max-w-[90%] rounded-3xl rounded-br-lg bg-white px-4 py-3 text-sm text-foreground"
                      : "mr-auto max-w-[92%] rounded-3xl rounded-bl-lg bg-white/10 px-4 py-3 text-sm leading-relaxed text-white/90"
                  }
                >
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide opacity-60">
                    {message.role === "user" ? "You" : "ZIVAN AI"}
                  </p>
                  {message.content}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="rounded-[2rem] border border-border bg-white p-6 shadow-[0_20px_50px_rgba(15,61,53,0.06)] sm:p-8">
            <h3 className="font-display text-xl font-semibold">Suggested actions</h3>
            <div className="mt-5 grid gap-3">
              <Button variant="secondary" className="justify-start">
                <Moon className="h-4 w-4 text-primary" aria-hidden />
                Improve Sleep
              </Button>
              <Button variant="secondary" className="justify-start">
                <LineChart className="h-4 w-4 text-primary" aria-hidden />
                View Sleep Trends
              </Button>
              <Button variant="secondary" className="justify-start">
                <Bell className="h-4 w-4 text-primary" aria-hidden />
                Set Reminder
              </Button>
            </div>
            <p className="mt-6 rounded-2xl bg-primary-soft px-4 py-3 text-sm leading-relaxed text-primary-dark">
              {aiService.disclaimer}
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
