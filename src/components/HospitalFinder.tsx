"use client";

import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { hospitals } from "@/data/hospitals";
import { fetchHospitals, isSupabaseConfigured } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Building2, Cross, MapPinned, Pill } from "lucide-react";
import { useEffect, useState } from "react";

const typeIcon = {
  hospital: Building2,
  clinic: Cross,
  pharmacy: Pill,
};

export function HospitalFinder() {
  const [hospitalList, setHospitalList] = useState(hospitals);
  const [selected, setSelected] = useState(hospitals[0].id);

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchHospitals().then((remote) => {
        if (remote && remote.length > 0) {
          const mapped = remote.map((h) => ({
            id: h.id,
            name: h.name,
            category: (h.id.startsWith("govt") ? "government" : "private") as any,
            type: (h.type as any) || "hospital",
            distanceKm: h.distance_km || 2.4,
            estimatedTravelTime: `${Math.round((h.distance_km || 2.4) * 3)}–${Math.round((h.distance_km || 2.4) * 4)} mins`,
            address: h.address || "Sector 24, Health City",
            open: h.open !== false,
            specializations: h.specializations || ["Emergency / Trauma", "General Physician"],
            icuStatus: ((h.available_icu_beds && h.available_icu_beds > 0) ? "Available" : "Limited") as any,
          }));
          setHospitalList(mapped);
          setSelected(mapped[0].id);
        }
      });
    }
  }, []);

  return (
    <Section
      id="finder"
      eyebrow="Care Nearby"
      title="Healthcare, When You Need It."
      description="A map-based product demonstration for finding nearby facilities. Labeled as demo when live maps are unavailable."
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Reveal>
          <ul className="space-y-3">
            {hospitalList.map((place) => {
              const Icon = typeIcon[place.type];
              const active = selected === place.id;
              return (
                <li key={place.id}>
                  <div
                    className={cn(
                      "rounded-[1.5rem] border p-4 transition",
                      active
                        ? "border-primary bg-primary-soft shadow-sm"
                        : "border-border bg-white hover:border-primary/30",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSelected(place.id)}
                      className="flex w-full items-start gap-4 text-left"
                      aria-pressed={active}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-display text-lg font-semibold">
                            {place.name}
                          </h3>
                          <span className="text-sm font-semibold text-primary">
                            {place.distanceKm} km
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted">{place.address}</p>
                      </div>
                    </button>
                    <div className="mt-4 flex flex-wrap gap-2 pl-[3.75rem]">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.alert("Demo: Directions")}
                      >
                        Directions
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.alert("Demo: View Details")}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="emergency"
                        onClick={() => window.alert("Demo: Emergency routing")}
                      >
                        Emergency
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-border bg-[#d9ebe6] shadow-[0_24px_60px_rgba(15,61,53,0.08)]">
            <div className="absolute inset-0 opacity-70" aria-hidden>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(13,143,122,0.25),transparent_35%),radial-gradient(circle_at_70%_60%,rgba(26,155,181,0.2),transparent_30%)]" />
              <svg className="h-full w-full" viewBox="0 0 400 420" fill="none">
                <path
                  d="M0 120 H400 M0 220 H400 M0 320 H400 M80 0 V420 M180 0 V420 M280 0 V420"
                  stroke="rgba(15,61,53,0.08)"
                  strokeWidth="2"
                />
                <path
                  d="M40 360 C120 280, 180 300, 230 220 S320 140, 380 90"
                  stroke="rgba(13,143,122,0.35)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {hospitalList.map((place, index) => {
              const positions = [
                { top: "28%", left: "34%" },
                { top: "48%", left: "62%" },
                { top: "62%", left: "24%" },
                { top: "36%", left: "72%" },
              ];
              const pos = positions[index % positions.length];
              return (
                <button
                  key={place.id}
                  type="button"
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white p-2 shadow-lg transition",
                    selected === place.id ? "bg-emergency scale-110" : "bg-primary",
                  )}
                  style={pos}
                  aria-label={`${place.name}, ${place.distanceKm} kilometers`}
                  onClick={() => setSelected(place.id)}
                >
                  <MapPinned className="h-4 w-4 text-white" aria-hidden />
                </button>
              );
            })}

            <div className="absolute left-4 top-4 rounded-2xl bg-white/90 px-4 py-3 text-sm font-semibold shadow-sm backdrop-blur">
              Demo map · illustrative only
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
