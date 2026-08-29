"use client";

import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import { updateHandoverNotes } from "@/lib/ambulanceStore";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Heart,
  Pill,
  Save,
  ShieldAlert,
  Thermometer,
  Wind,
  X,
} from "lucide-react";

interface LiveTelemetryModalProps {
  request: AmbulanceRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LiveTelemetryModal({ request, isOpen, onClose }: LiveTelemetryModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [handoverText, setHandoverText] = useState(request?.handoverNotes ?? "");
  const [saved, setSaved] = useState(false);
  const [liveBpm, setLiveBpm] = useState(request?.vitals?.hr ?? 108);

  useEffect(() => {
    if (request) {
      setHandoverText(request.handoverNotes ?? "");
      setLiveBpm(request.vitals?.hr ?? 108);
    }
  }, [request]);

  // Animated live ECG drawing on canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let x = 0;
    const points: number[] = [];
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    // ECG wave pattern cycle
    const ecgPattern = [
      0, 0, 0, -5, 8, -25, 45, -15, 5, 0, 0, 0, 8, 12, 10, 5, 0, 0, 0, 0,
    ];
    let patternIdx = 0;

    const interval = setInterval(() => {
      // Slight physiological BPM jitter
      setLiveBpm((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.min(135, Math.max(65, prev + delta));
      });
    }, 2000);

    function draw() {
      if (!ctx) return;

      const val = ecgPattern[patternIdx % ecgPattern.length] + (Math.random() * 2 - 1);
      patternIdx++;
      points.push(midY - val);

      if (points.length > width / 2) {
        points.shift();
      }

      ctx.fillStyle = "rgba(11, 31, 42, 0.25)";
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = "rgba(13, 143, 122, 0.15)";
      ctx.lineWidth = 1;
      for (let gy = 0; gy < height; gy += 20) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }
      for (let gx = 0; gx < width; gx += 20) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }

      // ECG wave line
      ctx.beginPath();
      ctx.strokeStyle = "#00f0b5";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#00f0b5";
      ctx.shadowBlur = 8;

      for (let i = 0; i < points.length; i++) {
        const px = i * 2;
        const py = points[i];
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen || !request) return null;

  const vitals = request.vitals ?? {
    hr: 108,
    bp: "138/88",
    spo2: 95,
    rr: 22,
    temp: 37.4,
  };

  const handleSaveHandover = () => {
    updateHandoverNotes(request.id, handoverText);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border-0 bg-[#eef6f4] shadow-[0_25px_70px_rgba(13,143,122,0.28)] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-0 bg-gradient-to-r from-slate-900 via-[#0f2420] to-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-xs shadow-primary/40">
              <Activity className="h-5 w-5 text-white animate-pulse" aria-hidden />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold">
                  Live Patient Telemetry &amp; SBAR Handover
                </h3>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE STREAM
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Patient: <strong className="text-white">{request.patientName}</strong> · Assigned to {request.acceptedBy || "Paramedic Unit"}
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

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* ECG Oscilloscope Screen */}
          <div className="overflow-hidden rounded-2xl border-0 bg-[#071318] p-4 shadow-inner">
            <div className="flex items-center justify-between mb-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-mono text-emerald-400 font-bold">LEAD II · 25mm/s · 10mm/mV</span>
                <span className="text-slate-500">|</span>
                <span>DSP Telemetry</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
                <Heart className="h-3.5 w-3.5 fill-current animate-pulse" />
                <span className="font-bold text-sm">{liveBpm}</span> BPM
              </div>
            </div>
            <canvas
              ref={canvasRef}
              width={650}
              height={110}
              className="w-full h-28 rounded-lg bg-black/40"
            />
          </div>

          {/* Vitals HUD Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Heart Rate */}
            <div className="rounded-[1.25rem] border-0 bg-rose-100/90 p-3.5 shadow-[0_6px_20px_rgba(217,53,74,0.14)]">
              <div className="flex items-center justify-between text-xs font-bold text-rose-800">
                <span>Heart Rate</span>
                <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
              </div>
              <p className="mt-1 font-display text-2xl font-bold text-rose-950">
                {liveBpm} <span className="text-xs font-normal text-rose-800">BPM</span>
              </p>
              <p className="mt-0.5 text-[11px] text-rose-700 font-semibold">
                {liveBpm > 100 ? "Tachycardia" : "Normal Sinus"}
              </p>
            </div>

            {/* Blood Pressure */}
            <div className="rounded-[1.25rem] border-0 bg-sky-100/90 p-3.5 shadow-[0_6px_20px_rgba(26,155,181,0.14)]">
              <div className="flex items-center justify-between text-xs font-bold text-sky-800">
                <span>Blood Pressure</span>
                <Activity className="h-4 w-4 text-sky-600" />
              </div>
              <p className="mt-1 font-display text-2xl font-bold text-sky-950">
                {vitals.bp} <span className="text-xs font-normal text-sky-800">mmHg</span>
              </p>
              <p className="mt-0.5 text-[11px] text-sky-700 font-semibold">Mean Art: 98</p>
            </div>

            {/* SpO2 */}
            <div className="rounded-[1.25rem] border-0 bg-emerald-100/90 p-3.5 shadow-[0_6px_20px_rgba(5,150,105,0.14)]">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>SpO2 Oxygen</span>
                <Wind className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-1 font-display text-2xl font-bold text-emerald-950">
                {vitals.spo2}% <span className="text-xs font-normal text-emerald-800">O₂</span>
              </p>
              <p className="mt-0.5 text-[11px] text-emerald-700 font-semibold">High Flow O2 on</p>
            </div>

            {/* Core Temp */}
            <div className="rounded-[1.25rem] border-0 bg-amber-100/90 p-3.5 shadow-[0_6px_20px_rgba(245,158,11,0.14)]">
              <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                <span>Temperature</span>
                <Thermometer className="h-4 w-4 text-amber-600" />
              </div>
              <p className="mt-1 font-display text-2xl font-bold text-amber-950">
                {vitals.temp}°C
              </p>
              <p className="mt-0.5 text-[11px] text-amber-700 font-semibold">Normothermic</p>
            </div>
          </div>

          {/* SBAR Pre-Arrival Clinical Handover Summary */}
          <div className="rounded-[1.5rem] border-0 bg-white p-5 space-y-3 shadow-[0_8px_24px_rgba(15,61,53,0.06)]">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-primary" />
              SBAR Pre-Arrival Clinical Checklist
            </h4>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border-0 bg-[#eef6f4] p-3 shadow-2xs">
                <span className="font-bold text-primary block mb-1">S - Situation &amp; Chief Complaint:</span>
                <p className="text-muted leading-relaxed">{request.notes}</p>
              </div>
              <div className="rounded-xl border-0 bg-[#eef6f4] p-3 shadow-2xs">
                <span className="font-bold text-primary block mb-1">B - Background &amp; Allergies:</span>
                <p className="text-muted leading-relaxed">
                  Blood Group: <strong className="text-foreground">{request.bloodGroup ?? "Unknown"}</strong> · Allergies: <strong className="text-foreground">{request.allergies?.join(", ") || "None"}</strong> · Meds: {request.medications?.join(", ") || "None"}
                </p>
              </div>
            </div>

            {/* Handover Notes & Interventions */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                En-Route Clinical Interventions &amp; Doctor Handover Notes:
              </label>
              <textarea
                rows={3}
                value={handoverText}
                onChange={(e) => setHandoverText(e.target.value)}
                placeholder="Enter pre-arrival treatments, airway status, or specific trauma bay prep instructions..."
                className="w-full rounded-xl border-0 bg-[#eef6f4] p-3 text-xs text-foreground placeholder:text-muted outline-none focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-black/5 bg-[#eef6f4] px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Clock className="h-4 w-4 text-primary" />
            <span>ETA to ER Bay: <strong className="text-foreground">{request.etaMinutes != null ? `${request.etaMinutes} mins` : "Arrived"}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveHandover}>
              <Save className="h-4 w-4" />
              {saved ? "Handover Saved!" : "Save Handover"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
