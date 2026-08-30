"use client";

import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import { emergencyProfile } from "@/data/healthData";
import {
  createAmbulanceRequest,
  statusLabel,
  subscribeAmbulanceRequests,
} from "@/lib/ambulanceStore";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import {
  Ambulance,
  Hospital,
  MapPin,
  Phone,
  ShieldAlert,
  Siren,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const workflow = [
  { label: "SOS", icon: Siren },
  { label: "Emergency Contact", icon: UserRound },
  { label: "Ambulance", icon: Ambulance },
  { label: "Hospital", icon: Hospital },
];

const capabilities = [
  {
    title: "One-Tap SOS",
    description: "A dedicated emergency button designed for clarity under stress.",
    icon: Siren,
  },
  {
    title: "Live Location",
    description: "Share location with authorized emergency contacts and services.",
    icon: MapPin,
  },
  {
    title: "Smart Ambulance Assistance",
    description: "Request nearby available ambulances where supported.",
    icon: Ambulance,
  },
  {
    title: "Hospital Notification",
    description: "Notify a selected hospital where the required integration exists.",
    icon: Hospital,
  },
  {
    title: "Emergency Health Profile",
    description:
      "Provide authorized emergency information such as blood group, allergies, medications and important medical details.",
    icon: ShieldAlert,
  },
];

type StatusTone = "ok" | "busy" | "pending";

export function EmergencySection() {
  const reduce = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);
  const [sosActive, setSosActive] = useState(false);
  const [request, setRequest] = useState<AmbulanceRequest | null>(null);

  useEffect(() => {
    if (reduce) {
      setActiveStep(workflow.length - 1);
      return;
    }
    const id = setInterval(() => {
      setActiveStep((s) => (s + 1) % workflow.length);
    }, 1600);
    return () => clearInterval(id);
  }, [reduce]);

  useEffect(() => {
    if (!request?.id) return;
    const id = request.id;
    return subscribeAmbulanceRequests((all) => {
      setRequest(all.find((item) => item.id === id) ?? null);
    });
  }, [request?.id]);

  const ambulanceValue = !sosActive
    ? "Standby"
    : request
      ? statusLabel(request.status)
      : "Searching...";

  const ambulanceTone: StatusTone = !sosActive
    ? "pending"
    : !request || request.status === "searching"
      ? "busy"
      : request.status === "declined"
        ? "pending"
        : "ok";

  const hospitalValue = !sosActive
    ? "Standby"
    : request?.status === "searching"
      ? "Awaiting acceptance"
      : request?.status === "declined"
        ? "Declined"
        : request
          ? `${request.hospitalName} connected`
          : "Pending";

  const hospitalTone: StatusTone = !sosActive
    ? "pending"
    : request && request.status !== "searching" && request.status !== "declined"
      ? "ok"
      : "pending";

  const statuses: { label: string; value: string; tone: StatusTone }[] = [
    { label: "Location", value: sosActive ? "Sharing" : "Ready", tone: "ok" },
    {
      label: "Emergency Contact",
      value: sosActive ? "Notified" : "Configured",
      tone: "ok",
    },
    { label: "Ambulance", value: ambulanceValue, tone: ambulanceTone },
    { label: "Hospital", value: hospitalValue, tone: hospitalTone },
  ];

  return (
    <Section
      id="emergency"
      className="bg-[#0d1715] text-white"
      tone="dark"
      eyebrow="Emergency Ecosystem"
      title="When Seconds Matter."
      description="ZIVAN connects emergency contacts, ambulance assistance and hospitals through a single emergency ecosystem."
    >
      <div className="mb-10 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
        Real ambulance and hospital availability depends on connected services and
        regional infrastructure. This section is a product demonstration unless real
        emergency integrations are connected. In a real emergency, call your local
        emergency services immediately.
      </div>

      <Reveal>
        <div className="mb-12 flex flex-wrap items-center justify-center gap-3 md:gap-4">
          {workflow.map((step, index) => {
            const Icon = step.icon;
            const active = index <= activeStep;
            return (
              <div key={step.label} className="flex items-center gap-3 md:gap-4">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-2xl border px-4 py-3 transition",
                    active
                      ? "border-emergency/50 bg-emergency/20 text-white"
                      : "border-white/10 bg-white/5 text-white/50",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span className="text-sm font-semibold">{step.label}</span>
                </div>
                {index < workflow.length - 1 && (
                  <span className="hidden text-white/30 sm:inline" aria-hidden>
                    ↓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {capabilities.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.04}>
              <article className="h-full rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                <item.icon className="mb-3 h-5 w-5 text-rose-300" aria-hidden />
                <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  {item.description}
                </p>
              </article>
            </Reveal>
          ))}
          <Reveal delay={0.2}>
            <article className="h-full rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-5">
              <h3 className="font-display text-lg font-semibold">
                Emergency Health Profile
              </h3>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-white/55">Blood group</dt>
                  <dd className="font-semibold">{emergencyProfile.bloodGroup}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-white/55">Allergies</dt>
                  <dd className="font-semibold text-right">
                    {emergencyProfile.allergies.join(", ")}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-white/55">Medications</dt>
                  <dd className="font-semibold text-right">
                    {emergencyProfile.medications.join(", ")}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-white/55">Notes</dt>
                  <dd className="font-semibold text-right">{emergencyProfile.notes}</dd>
                </div>
              </dl>
            </article>
          </Reveal>
        </div>

        <Reveal>
          <div
            id="emergency-demo"
            className="relative rounded-[2rem] border border-rose-400/30 bg-[#1a0c10] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-7"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-300">
                  🚨 Emergency Mode
                </p>
                <p className="mt-2 font-display text-2xl font-bold">
                  {sosActive ? "SOS ACTIVE" : "SOS READY"}
                </p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                Demo only
              </span>
            </div>

            <ul className="space-y-3">
              {statuses.map((status) => (
                <li
                  key={status.label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="text-sm text-white/70">{status.label}</span>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        status.tone === "ok" && "bg-emerald-400",
                        status.tone === "busy" && "bg-amber-400",
                        status.tone === "pending" && "bg-white/35",
                      )}
                      aria-hidden
                    />
                    <span className="sr-only">
                      {status.tone === "ok"
                        ? "Active"
                        : status.tone === "busy"
                          ? "In progress"
                          : "Pending"}
                      :{" "}
                    </span>
                    {status.value}
                  </span>
                </li>
              ))}
            </ul>

            {request?.etaMinutes != null &&
              ["accepted", "en_route", "arrived"].includes(request.status) && (
                <p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm">
                  ETA {request.etaMinutes} min · {request.acceptedBy}
                </p>
              )}

            <div className="mt-6 grid gap-3">
              <Button
                variant="emergency"
                size="lg"
                className="w-full"
                onClick={() => {
                  const created = createAmbulanceRequest({
                    patientName: "Abhi",
                    hospitalId: "city-hospital",
                  });
                  setRequest(created);
                  setSosActive(true);
                }}
                aria-pressed={sosActive}
              >
                {sosActive ? "SOS Simulation Running" : "Activate SOS Demo"}
              </Button>
              <Button
                variant="secondary"
                className="w-full border-white/10 bg-white/10 text-white hover:bg-white/15"
                onClick={() => window.alert("Demo: Call Emergency Services")}
              >
                <Phone className="h-4 w-4" aria-hidden />
                Call Emergency Services
              </Button>
              <Button
                variant="ghost"
                className="w-full text-white hover:bg-white/10"
                onClick={() => window.alert("Demo: View Emergency Information")}
              >
                View Emergency Information
              </Button>
            </div>

            {!reduce && sosActive && (
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-[2rem] border-2 border-emergency/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
                aria-hidden
              />
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
