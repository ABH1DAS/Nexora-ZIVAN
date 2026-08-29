"use client";

import { useHospitalAuth } from "@/lib/hospitalAuth";
import { hospitals } from "@/data/hospitals";
import { Building2, Clock, MapPin, Phone, Star } from "lucide-react";

export default function HospitalInfoPage() {
  const { account } = useHospitalAuth();

  const hospitalData = hospitals.find((h) => h.id === account?.hospitalId) ?? {
    id: account?.hospitalId ?? "",
    name: account?.hospitalName ?? "Your Hospital",
    type: "hospital" as const,
    distanceKm: 0,
    address: "Address not configured",
    open: true,
  };

  const departments = [
    { name: "Emergency / Trauma", head: "Dr. Amrita Sharma", beds: 24, available: 8 },
    { name: "ICU", head: "Dr. Vikram Nair", beds: 12, available: 3 },
    { name: "General Medicine", head: "Dr. Sonal Patel", beds: 60, available: 22 },
    { name: "Cardiology", head: "Dr. Rahul Gupta", beds: 20, available: 7 },
    { name: "Paediatrics", head: "Dr. Meera Joshi", beds: 18, available: 10 },
    { name: "Orthopaedics", head: "Dr. Arjun Reddy", beds: 16, available: 5 },
  ];

  const services = [
    "24/7 Emergency Services",
    "Advanced Cardiac Care",
    "Trauma Centre",
    "Blood Bank",
    "Radiology & CT Scan",
    "Pathology Lab",
    "ICU & NICU",
    "Dialysis Unit",
    "Pharmacy",
    "Ambulance Service",
  ];

  return (
    <div className="space-y-6">
      {/* Hospital profile card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0b1f2a]">
              <Building2 className="h-8 w-8 text-white" aria-hidden />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-[#0b1f2a]">
                {hospitalData.name}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="h-4 w-4" aria-hidden />
                {hospitalData.address}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {hospitalData.open ? "Open 24/7" : "Currently Closed"}
                </span>
                <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 capitalize">
                  {hospitalData.type}
                </span>
                <span className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                  NABH Accredited · Demo
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" aria-hidden />
              <span>+91 11-XXXX-XXXX (Demo)</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" aria-hidden />
              <span>Emergency: 24 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" aria-hidden />
              <span>4.6 / 5.0 rating · Demo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Departments */}
      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">
          Departments &amp; Bed Availability
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => {
            const pct = Math.round((dept.available / dept.beds) * 100);
            return (
              <div key={dept.name} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="font-semibold text-[#0b1f2a]">{dept.name}</p>
                <p className="mt-0.5 text-xs text-slate-400">{dept.head}</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{dept.available} beds available</span>
                    <span>{dept.beds} total</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Services */}
      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">
          Services Offered
        </h2>
        <div className="flex flex-wrap gap-2">
          {services.map((svc) => (
            <span
              key={svc}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm"
            >
              {svc}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
