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
      <div className="rounded-[2rem] border-0 bg-gradient-to-br from-[#ebf5f2] via-[#e2f0ed] to-[#d6edf3] p-6 sm:p-8 shadow-[0_20px_50px_rgba(13,143,122,0.18)] hover:shadow-[0_26px_60px_rgba(13,143,122,0.25)] transition-all duration-300">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/25">
              <Building2 className="h-8 w-8 text-white" aria-hidden />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {hospitalData.name}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                <MapPin className="h-4 w-4 text-primary" aria-hidden />
                {hospitalData.address}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-xl border-0 bg-primary-soft px-3 py-1 text-xs font-bold text-primary shadow-xs">
                  {hospitalData.open ? "Open 24/7" : "Currently Closed"}
                </span>
                <span className="rounded-xl border-0 bg-white px-3 py-1 text-xs font-semibold text-muted capitalize shadow-2xs">
                  {hospitalData.type}
                </span>
                <span className="rounded-xl border-0 bg-accent-soft px-3 py-1 text-xs font-semibold text-accent shadow-xs">
                  NABH Accredited · Demo
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 rounded-[1.25rem] border-0 bg-white p-4 text-sm text-muted shadow-[0_6px_20px_rgba(15,61,53,0.08)]">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" aria-hidden />
              <span>+91 11-XXXX-XXXX (Demo)</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" aria-hidden />
              <span>Emergency: 24 hours</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" aria-hidden />
              <span className="font-medium text-foreground">4.6 / 5.0 rating · Demo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Departments */}
      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted">
          Departments &amp; Bed Availability
        </h2>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => {
            const pct = Math.round((dept.available / dept.beds) * 100);
            return (
              <div
                key={dept.name}
                className="rounded-[1.5rem] border-0 bg-[#eef6f4] p-5 sm:p-6 shadow-[0_14px_40px_rgba(15,61,53,0.1)] hover:shadow-[0_20px_50px_rgba(13,143,122,0.18)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <p className="font-semibold text-foreground">{dept.name}</p>
                <p className="mt-0.5 text-xs text-muted">{dept.head}</p>
                <div className="mt-3.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-primary font-semibold">{dept.available} beds available</span>
                    <span className="text-muted">{dept.beds} total</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
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
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted">
          Services Offered
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {services.map((svc) => (
            <span
              key={svc}
              className="rounded-2xl border-0 bg-[#eef6f4] px-4 py-2 text-sm font-semibold text-foreground shadow-[0_4px_16px_rgba(15,61,53,0.06)] hover:shadow-[0_8px_24px_rgba(13,143,122,0.18)] hover:bg-primary-soft hover:text-primary hover:-translate-y-0.5 transition-all duration-200"
            >
              {svc}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
