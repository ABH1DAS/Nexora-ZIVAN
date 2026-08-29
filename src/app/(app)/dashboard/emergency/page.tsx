"use client";

import { Button } from "@/components/ui/Button";
import type { AmbulanceRequest, AmbulanceType, EmergencyTimelineStep } from "@/data/ambulanceRequests";
import { getTimelineStep } from "@/data/ambulanceRequests";
import { hospitals, type Hospital } from "@/data/hospitals";
import { useAuth } from "@/lib/auth";
import {
  createAmbulanceRequest,
  statusLabel,
  subscribeAmbulanceRequests,
} from "@/lib/ambulanceStore";
import {
  addEmergencyContact,
  removeEmergencyContact,
  subscribeEmergencyContacts,
  type EmergencyContactItem,
} from "@/lib/contactsStore";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Ambulance,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Heart,
  Info,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Radio,
  Shield,
  ShieldAlert,
  Siren,
  Stethoscope,
  Trash2,
  UserCheck,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

const TIMELINE_STEPS: { id: EmergencyTimelineStep; label: string; desc: string }[] = [
  { id: "PENDING", label: "PENDING", desc: "SOS request sent to dispatch network" },
  { id: "REQUEST RECEIVED", label: "REQUEST RECEIVED", desc: "Hospital ER desk acknowledged request" },
  { id: "HOSPITAL ACCEPTED", label: "HOSPITAL ACCEPTED", desc: "Hospital ER confirmed room & team" },
  { id: "AMBULANCE ASSIGNED", label: "AMBULANCE ASSIGNED", desc: "Paramedic team & vehicle assigned" },
  { id: "AMBULANCE EN ROUTE", label: "AMBULANCE EN ROUTE", desc: "Ambulance navigating to your pin" },
  { id: "AMBULANCE ARRIVED", label: "AMBULANCE ARRIVED", desc: "Ambulance arrived at patient location" },
  { id: "PATIENT PICKED UP", label: "PATIENT PICKED UP", desc: "Patient onboard, en route to ER" },
  { id: "ARRIVED AT HOSPITAL", label: "ARRIVED AT HOSPITAL", desc: "Patient admitted to Emergency Room" },
];

const SPECIALIZATION_OPTIONS = [
  "Emergency – Not Sure",
  "General Physician",
  "Emergency / Trauma",
  "Cardiologist",
  "Neurologist",
  "Orthopedic",
  "Pediatrician",
  "Gynecologist",
  "Other",
];

export default function DashboardEmergencyPage() {
  const { user } = useAuth();
  const [activeRequest, setActiveRequest] = useState<AmbulanceRequest | null>(null);
  const [contacts, setContacts] = useState<EmergencyContactItem[]>([]);

  // Wizard state: 1 (Ambulance), 2 (Hospital), 3 (Specialist), 4 (Confirm), "tracking"
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | "tracking">(1);

  // Wizard Selections
  const [selectedAmbulanceType, setSelectedAmbulanceType] = useState<AmbulanceType>("government");
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(hospitals[0].id);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("Emergency – Not Sure");

  // Contact Form State
  const [showContactForm, setShowContactForm] = useState(false);
  const [cName, setCName] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cRel, setCRel] = useState("");
  const [cPriority, setCPriority] = useState<"Primary" | "Secondary">("Primary");

  useEffect(() => subscribeEmergencyContacts(setContacts), []);

  useEffect(() => {
    return subscribeAmbulanceRequests((all) => {
      const latest = all[0] ?? null;
      if (latest && !["cancelled", "declined", "ARRIVED AT HOSPITAL"].includes(latest.status)) {
        setActiveRequest(latest);
      } else {
        setActiveRequest(null);
      }
    });
  }, []);

  function handleConfirmAndSendSos() {
    const chosenHosp = hospitals.find((h) => h.id === selectedHospitalId) ?? hospitals[0];
    const created = createAmbulanceRequest({
      patientId: user?.email ? `patient_${user.email.split("@")[0]}` : "patient_abhi_101",
      patientName: user?.name ?? "Abhi Sharma",
      patientPhone: "+91 98765 43210",
      locationLabel: "742 Evergreen Terrace, Sector 14, Central Metro",
      coordinates: { lat: 28.6139, lng: 77.209 },
      hospitalId: chosenHosp.id,
      ambulanceType: selectedAmbulanceType,
      doctorSpecialization: selectedSpecialization,
      estimatedPrivateFare: selectedAmbulanceType === "private" ? (chosenHosp.estimatedFare ?? "₹450–₹750 (Est.)") : undefined,
      icuRequirement: chosenHosp.icuStatus === "Available",
      notes: `SOS Emergency confirmed. Type: ${selectedAmbulanceType}. Doctor: ${selectedSpecialization}. Hospital: ${chosenHosp.name}`,
    });

    setActiveRequest(created);
    setWizardStep("tracking");
  }

  function handleAddContact(e: FormEvent) {
    e.preventDefault();
    if (!cName || !cPhone || !cRel) return;
    addEmergencyContact({
      name: cName,
      phone: cPhone,
      relationship: cRel,
      priority: cPriority,
    });
    setCName("");
    setCPhone("");
    setCRel("");
    setShowContactForm(false);
  }

  const currentTimelineStep = activeRequest ? getTimelineStep(activeRequest.status) : "PENDING";
  const stepIndexMap: Record<EmergencyTimelineStep, number> = {
    "PENDING": 0,
    "REQUEST RECEIVED": 1,
    "HOSPITAL ACCEPTED": 2,
    "AMBULANCE ASSIGNED": 3,
    "AMBULANCE EN ROUTE": 4,
    "AMBULANCE ARRIVED": 5,
    "PATIENT PICKED UP": 6,
    "ARRIVED AT HOSPITAL": 7,
  };
  const activeStepIdx = stepIndexMap[currentTimelineStep];

  const govtHospitals = hospitals.filter((h) => h.category === "government" && h.type === "hospital");
  const pvtHospitals = hospitals.filter((h) => h.category === "private");
  const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId) ?? hospitals[0];

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-800">
            <Siren className="h-4 w-4 animate-pulse text-rose-600" />
            ZIVAN Emergency SOS Command Center
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
            Emergency Response & SOS Dispatch
          </h1>
          <p className="mt-1 text-sm text-muted">
            Configure your emergency requirements step-by-step before sending a real SOS dispatch to the Hospital Portal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeRequest && wizardStep !== "tracking" && (
            <button
              type="button"
              onClick={() => setWizardStep("tracking")}
              className="rounded-2xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 animate-pulse"
            >
              View Active SOS Tracking ({statusLabel(activeRequest.status)})
            </button>
          )}

          <Button href="/hospital/login" variant="ghost" className="text-xs text-slate-700 hover:bg-slate-100">
            <ExternalLink className="h-4 w-4 mr-1" /> Open Hospital Portal
          </Button>
        </div>
      </div>

      {/* ─── LIVE TRACKING SCREEN (If activeRequest and wizardStep === 'tracking') ─── */}
      {activeRequest && wizardStep === "tracking" ? (
        <section className="overflow-hidden rounded-[2.25rem] border-2 border-rose-500 bg-slate-900 text-white shadow-2xl space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col gap-4 bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 p-6 sm:flex-row sm:items-center sm:justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg animate-pulse">
                <Ambulance className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-300">Live Emergency Response Active</span>
                </div>
                <h2 className="font-display text-xl font-bold text-white">
                  Dispatch #{activeRequest.id ? activeRequest.id.slice(-6) : "101"} · {activeRequest.hospitalName ?? "Emergency ER"}
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-rose-500/20 px-4 py-1.5 text-xs font-bold uppercase text-rose-300 border border-rose-500/30">
                {statusLabel(activeRequest.status)}
              </span>
              <button
                type="button"
                onClick={() => setWizardStep(1)}
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white hover:bg-white/20"
              >
                + New SOS Request
              </button>
            </div>
          </div>

          {/* Ride-Hailing Interactive Vector Map Canvas */}
          <div className="relative h-80 w-full overflow-hidden bg-[#0c1821] border-y border-white/10">
            <svg className="absolute inset-0 h-full w-full opacity-40" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <path
                d="M 120 220 Q 300 80, 550 160 T 820 120"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeDasharray="8 8"
                className="animate-pulse"
              />
            </svg>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full border border-teal-500/20 bg-teal-500/5 animate-ping" />

            {/* Patient Pin */}
            <div className="absolute left-1/4 top-2/3 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.8)]">
                <MapPin className="h-5 w-5" />
                <span className="absolute -inset-1 rounded-full bg-rose-600/40 animate-ping" />
              </div>
              <span className="mt-1 rounded-md bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/40">
                You (Patient Location)
              </span>
            </div>

            {/* Ambulance Marker */}
            <div className="absolute left-2/3 top-1/3 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-all duration-1000">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500 text-slate-950 shadow-[0_0_25px_rgba(20,184,166,0.9)] font-bold">
                <Ambulance className="h-6 w-6 animate-bounce" />
              </div>
              <span className="mt-1 rounded-md bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold text-teal-300 border border-teal-500/40">
                {activeRequest.vehicleNumber ?? "AMB-01"} ({(activeRequest.ambulanceType ?? "government").toUpperCase()})
              </span>
            </div>

            {/* Floating Details Overlay Panel */}
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-slate-900/90 p-4 backdrop-blur-md">
              <div className="grid gap-3 text-xs sm:grid-cols-4">
                <div>
                  <span className="text-slate-400 block font-medium">Driver & Paramedic</span>
                  <strong className="text-white font-bold">{activeRequest.driverName ?? "Rajesh Kumar (Paramedic Leader)"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Vehicle Reg No.</span>
                  <strong className="text-teal-300 font-mono font-bold">{activeRequest.vehicleNumber ?? "DL-01-EV-4892"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Ambulance Category</span>
                  <strong className="text-white capitalize">{activeRequest.ambulanceType ?? "government"} Ambulance</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Required Specialist</span>
                  <strong className="text-amber-300">{activeRequest.doctorSpecialization ?? "Emergency – Not Sure"}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 8-Step Timeline Component */}
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">8-Step Live Emergency Timeline</h3>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TIMELINE_STEPS.map((step, idx) => {
                const isCompleted = idx < activeStepIdx;
                const isCurrent = idx === activeStepIdx;

                return (
                  <div
                    key={step.id}
                    className={cn(
                      "rounded-2xl border p-3.5 transition-all text-xs",
                      isCurrent ? "border-rose-500 bg-rose-950/60 shadow-lg ring-2 ring-rose-500/30 text-white" :
                      isCompleted ? "border-emerald-500/40 bg-emerald-950/30 text-slate-300" :
                      "border-white/10 bg-white/5 text-slate-500 opacity-50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Step 0{idx + 1}</span>
                      {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                      {isCurrent && <Siren className="h-4 w-4 text-rose-400 animate-bounce" />}
                    </div>

                    <p className="mt-2 font-display font-bold">{step.label}</p>
                    <p className="mt-1 text-[11px] text-slate-400 leading-snug">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        /* ─── 4-STEP SOS EMERGENCY CONFIGURATION WIZARD ─── */
        <div className="space-y-6">
          {/* Step Progress Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 glow-card">
            <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-700 mb-2">
              <span className={cn(wizardStep === 1 ? "text-rose-600" : "text-slate-500")}>1. Ambulance Type</span>
              <span className="text-slate-300">→</span>
              <span className={cn(wizardStep === 2 ? "text-rose-600" : "text-slate-500")}>2. Target Hospital</span>
              <span className="text-slate-300">→</span>
              <span className={cn(wizardStep === 3 ? "text-rose-600" : "text-slate-500")}>3. Doctor Specialist</span>
              <span className="text-slate-300">→</span>
              <span className={cn(wizardStep === 4 ? "text-rose-600 font-extrabold" : "text-slate-500")}>4. Confirm SOS</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-rose-600 transition-all duration-300"
                style={{ width: `${(wizardStep as number) * 25}%` }}
              />
            </div>
          </div>

          {/* STEP 1 — SELECT AMBULANCE TYPE */}
          {wizardStep === 1 && (
            <section className="rounded-[2.25rem] border border-border bg-white p-6 glow-card sm:p-8 space-y-6 animate-in fade-in">
              <div>
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-extrabold text-rose-800 uppercase tracking-wider">
                  Step 1 of 4
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Ambulance className="h-6 w-6 text-rose-600" /> Select Ambulance Type
                </h2>
                <p className="text-xs text-muted mt-1">Choose between government emergency 108 transport or private rapid ALS/BLS services.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Government Ambulance Card */}
                <button
                  type="button"
                  onClick={() => setSelectedAmbulanceType("government")}
                  className={cn(
                    "flex flex-col justify-between rounded-2xl border-2 p-6 text-left transition-all",
                    selectedAmbulanceType === "government"
                      ? "border-rose-500 bg-rose-50/80 shadow-md ring-2 ring-rose-500/20"
                      : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                        Government Subsidized (108)
                      </span>
                      <Radio className={cn("h-5 w-5", selectedAmbulanceType === "government" ? "text-rose-600" : "text-slate-400")} />
                    </div>
                    <h3 className="mt-3 font-display text-lg font-bold text-slate-900">Government Emergency Ambulance</h3>
                    <p className="mt-1 text-xs text-muted leading-relaxed">
                      Free/subsidized 108 public emergency transport service. Standard priority dispatch.
                    </p>
                  </div>
                  <p className="mt-4 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    Fare: Free / Government Subsidized
                  </p>
                </button>

                {/* Private Ambulance Card */}
                <button
                  type="button"
                  onClick={() => setSelectedAmbulanceType("private")}
                  className={cn(
                    "flex flex-col justify-between rounded-2xl border-2 p-6 text-left transition-all",
                    selectedAmbulanceType === "private"
                      ? "border-rose-500 bg-rose-50/80 shadow-md ring-2 ring-rose-500/20"
                      : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-800">
                        Rapid Private ALS / BLS
                      </span>
                      <Radio className={cn("h-5 w-5", selectedAmbulanceType === "private" ? "text-rose-600" : "text-slate-400")} />
                    </div>
                    <h3 className="mt-3 font-display text-lg font-bold text-slate-900">Private Rapid ALS Ambulance</h3>
                    <p className="mt-1 text-xs text-muted leading-relaxed">
                      Advanced Life Support equipped vehicle with dedicated paramedic team and rapid GPS dispatch.
                    </p>
                  </div>
                  <p className="mt-4 text-xs font-bold text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
                    Estimated Fare: ₹450–₹750 (Est.)
                  </p>
                </button>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <Button onClick={() => setWizardStep(2)} className="flex items-center gap-2">
                  Next: Select Hospital <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </section>
          )}

          {/* STEP 2 — SELECT HOSPITAL */}
          {wizardStep === 2 && (
            <section className="rounded-[2.25rem] border border-border bg-white p-6 glow-card sm:p-8 space-y-6 animate-in fade-in">
              <div>
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-extrabold text-rose-800 uppercase tracking-wider">
                  Step 2 of 4
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-indigo-600" /> Select Target Hospital
                </h2>
                <p className="text-xs text-muted mt-1">Select your preferred hospital facility from nearby public and private emergency centers.</p>
              </div>

              {/* Government Hospitals */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg inline-block border border-emerald-200">
                  🏛️ Nearby Government Hospitals
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {govtHospitals.map((hosp) => {
                    const isSelected = selectedHospitalId === hosp.id;
                    return (
                      <button
                        key={hosp.id}
                        type="button"
                        onClick={() => setSelectedHospitalId(hosp.id)}
                        className={cn(
                          "flex flex-col justify-between rounded-2xl border-2 p-4 text-left transition-all",
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/20 glow-card"
                            : "border-slate-200 bg-slate-50/60 hover:border-slate-300"
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs font-bold text-muted">
                            <span>{hosp.distanceKm} km · {hosp.estimatedTravelTime}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800">
                              ICU: {hosp.icuStatus}
                            </span>
                          </div>
                          <h4 className="mt-2 font-display font-bold text-sm text-slate-900">{hosp.name}</h4>
                          <p className="mt-1 text-xs text-muted">{hosp.address}</p>
                        </div>
                        <div className="mt-3 border-t border-slate-200/60 pt-2 text-[11px] font-semibold text-slate-700">
                          Matches: {hosp.specializations.slice(0, 2).join(", ")}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Private Hospitals */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-800 bg-indigo-50 px-3 py-1 rounded-lg inline-block border border-indigo-200">
                  🏥 Nearby Private Hospitals
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {pvtHospitals.map((hosp) => {
                    const isSelected = selectedHospitalId === hosp.id;
                    return (
                      <button
                        key={hosp.id}
                        type="button"
                        onClick={() => setSelectedHospitalId(hosp.id)}
                        className={cn(
                          "flex flex-col justify-between rounded-2xl border-2 p-4 text-left transition-all",
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/80 shadow-md ring-2 ring-indigo-500/20 glow-card"
                            : "border-slate-200 bg-slate-50/60 hover:border-slate-300"
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs font-bold text-muted">
                            <span>{hosp.distanceKm} km · {hosp.estimatedTravelTime}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800">
                              ICU: {hosp.icuStatus}
                            </span>
                          </div>
                          <h4 className="mt-2 font-display font-bold text-sm text-slate-900">{hosp.name}</h4>
                          <p className="mt-1 text-xs text-muted">{hosp.address}</p>
                        </div>
                        <div className="mt-3 border-t border-slate-200/60 pt-2 flex items-center justify-between text-[11px] font-bold">
                          <span className="text-indigo-900">Est. Fare: {hosp.estimatedFare ?? "₹450 (Est.)"}</span>
                          <span className="text-slate-500 font-normal">Private</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-200">
                <Button variant="secondary" onClick={() => setWizardStep(1)} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back: Ambulance
                </Button>
                <Button onClick={() => setWizardStep(3)} className="flex items-center gap-2">
                  Next: Doctor Specialist <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </section>
          )}

          {/* STEP 3 — SELECT REQUIRED DOCTOR SPECIALIZATION */}
          {wizardStep === 3 && (
            <section className="rounded-[2.25rem] border border-border bg-white p-6 glow-card sm:p-8 space-y-6 animate-in fade-in">
              <div>
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-extrabold text-rose-800 uppercase tracking-wider">
                  Step 3 of 4
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="h-6 w-6 text-teal-600" /> Select Medical Specialist Needed
                </h2>
                <p className="text-xs text-muted mt-1">Select the specialist required so the Hospital ER team prepares the room upon arrival.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {SPECIALIZATION_OPTIONS.map((spec) => {
                  const isSelected = selectedSpecialization === spec;
                  const isNotSure = spec === "Emergency – Not Sure";

                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => setSelectedSpecialization(spec)}
                      className={cn(
                        "rounded-2xl border-2 px-5 py-3 text-xs font-bold transition-all",
                        isSelected
                          ? isNotSure
                            ? "border-rose-600 bg-rose-600 text-white shadow-md ring-2 ring-rose-500/20 glow-emergency"
                            : "border-teal-600 bg-teal-600 text-white shadow-md ring-2 ring-teal-500/20 glow-primary"
                          : isNotSure
                          ? "border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      {spec}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-200">
                <Button variant="secondary" onClick={() => setWizardStep(2)} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back: Hospital
                </Button>
                <Button onClick={() => setWizardStep(4)} className="flex items-center gap-2">
                  Next: Review & Confirm SOS <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </section>
          )}

          {/* STEP 4 — CONFIRM SOS SUMMARY */}
          {wizardStep === 4 && (
            <section className="rounded-[2.25rem] border-2 border-rose-600 bg-gradient-to-br from-[#1c080b] via-[#2a0e14] to-[#120407] p-6 text-white glow-emergency sm:p-8 space-y-6 animate-in fade-in">
              <div>
                <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-extrabold text-rose-300 uppercase tracking-wider border border-rose-500/30">
                  Step 4 of 4 — Final Confirmation
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-white flex items-center gap-2">
                  <Siren className="h-6 w-6 text-rose-500 animate-pulse" /> Confirm & Transmit Emergency SOS
                </h2>
                <p className="text-xs text-rose-200 mt-1">Review your emergency request details. Clicking confirm will create 1 real dispatch in Supabase.</p>
              </div>

              {/* Summary Card */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 space-y-4 text-xs backdrop-blur-md">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="text-slate-400 block font-medium">Selected Ambulance Type</span>
                    <strong className="text-white text-sm capitalize font-bold">{selectedAmbulanceType} Ambulance</strong>
                    {selectedAmbulanceType === "private" && (
                      <span className="block mt-0.5 text-indigo-300 font-bold">Estimated Fare: ₹450–₹750 (Est.)</span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Required Medical Specialist</span>
                    <strong className="text-amber-300 text-sm font-bold">{selectedSpecialization}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Target Hospital</span>
                    <strong className="text-white text-sm font-bold">{selectedHospital.name}</strong>
                    <span className="block mt-0.5 text-slate-400">{selectedHospital.distanceKm} km away · ICU: {selectedHospital.icuStatus}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Patient Location</span>
                    <strong className="text-rose-300 text-sm font-bold">742 Evergreen Terrace, Sector 14</strong>
                    <span className="block mt-0.5 text-slate-400">Patient: {user?.name ?? "Abhi Sharma"}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-rose-500/20 p-3 text-xs text-rose-200 border border-rose-500/30 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                  Initial Dispatch Status will be set to <strong>PENDING</strong> and sync with the Hospital Portal.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
                <Button variant="secondary" onClick={() => setWizardStep(3)} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back: Specialist
                </Button>

                <button
                  type="button"
                  onClick={handleConfirmAndSendSos}
                  className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 px-8 py-4 text-base font-extrabold text-white shadow-[0_0_35px_rgba(244,63,94,0.6)] transition hover:scale-105 active:scale-95"
                >
                  <Zap className="h-6 w-6 animate-bounce" /> Confirm & Send SOS
                </button>
              </div>
            </section>
          )}
        </div>
      )}

      {/* ─── CONNECTED EMERGENCY CONTACTS SECTION ─── */}
      <section className="rounded-[2.25rem] border border-border bg-white p-6 shadow-sm sm:p-7 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Connected Emergency Contacts</h2>
            <p className="text-xs text-muted">Notified automatically when an SOS emergency is dispatched.</p>
          </div>
          <Button onClick={() => setShowContactForm(!showContactForm)} size="sm">
            <Plus className="h-4 w-4" /> Add Emergency Contact
          </Button>
        </div>

        {showContactForm && (
          <form onSubmit={handleAddContact} className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 space-y-4">
            <h3 className="font-bold text-sm text-teal-950">New Emergency Contact</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-bold text-teal-900 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  placeholder="e.g. Dr. Ananya Sharma"
                  className="h-10 w-full rounded-xl border border-teal-300 bg-white px-3 text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-teal-900 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={cPhone}
                  onChange={(e) => setCPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="h-10 w-full rounded-xl border border-teal-300 bg-white px-3 text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-teal-900 mb-1">Relationship</label>
                <input
                  type="text"
                  required
                  value={cRel}
                  onChange={(e) => setCRel(e.target.value)}
                  placeholder="Family Doctor / Spouse"
                  className="h-10 w-full rounded-xl border border-teal-300 bg-white px-3 text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-teal-900 mb-1">Priority Level</label>
                <select
                  value={cPriority}
                  onChange={(e) => setCPriority(e.target.value as "Primary" | "Secondary")}
                  className="h-10 w-full rounded-xl border border-teal-300 bg-white px-3 text-xs outline-none"
                >
                  <option value="Primary">Primary (First Call)</option>
                  <option value="Secondary">Secondary</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">Save Contact</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowContactForm(false)}>Cancel</Button>
            </div>
          </form>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <div key={contact.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white font-bold text-sm shadow-sm">
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{contact.name}</p>
                  <p className="text-xs text-muted">{contact.relationship} · <strong className="text-teal-700">{contact.phone}</strong></p>
                  <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                    {contact.priority}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeEmergencyContact(contact.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                aria-label="Remove contact"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
