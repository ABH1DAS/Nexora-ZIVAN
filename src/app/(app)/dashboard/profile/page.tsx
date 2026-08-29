"use client";

import { Button } from "@/components/ui/Button";
import { hospitals, type Hospital } from "@/data/hospitals";
import { useAuth } from "@/lib/auth";
import {
  getEmergencyContacts,
  removeEmergencyContact,
  subscribeEmergencyContacts,
  type EmergencyContactItem,
} from "@/lib/contactsStore";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Heart,
  Pencil,
  Plus,
  Shield,
  Star,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

const PROFILE_PREFS_KEY = "zivan-patient-profile-full";
const PREFERRED_HOSPITALS_KEY = "zivan-preferred-hospitals";

interface PatientHealthProfile {
  name: string;
  age: number;
  bloodGroup: string;
  allergies: string[];
  medications: string[];
}

export default function DashboardProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PatientHealthProfile>({
    name: "Abhi Sharma",
    age: 28,
    bloodGroup: "O+",
    allergies: ["Penicillin", "Dust Mites"],
    medications: ["Vitamin D3 1000IU", "Asthma Inhaler (as needed)"],
  });

  const [contacts, setContacts] = useState<EmergencyContactItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Preferred Hospitals State (Categorized Govt and Private IDs)
  const [prefGovtIds, setPrefGovtIds] = useState<string[]>(["govt-aiims-central"]);
  const [prefPvtIds, setPrefPvtIds] = useState<string[]>(["city-hospital"]);

  // Tag inputs
  const [newAllergy, setNewAllergy] = useState("");
  const [newMedication, setNewMedication] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const rawProfile = localStorage.getItem(PROFILE_PREFS_KEY);
      if (rawProfile) {
        try {
          setProfile(JSON.parse(rawProfile));
        } catch {
          // fallback
        }
      } else if (user?.name) {
        setProfile((prev) => ({ ...prev, name: user.name }));
      }

      const rawHospitals = localStorage.getItem(PREFERRED_HOSPITALS_KEY);
      if (rawHospitals) {
        try {
          const parsed = JSON.parse(rawHospitals);
          if (parsed.govt) setPrefGovtIds(parsed.govt);
          if (parsed.pvt) setPrefPvtIds(parsed.pvt);
        } catch {
          // fallback
        }
      }
    }
  }, [user]);

  useEffect(() => subscribeEmergencyContacts(setContacts), []);

  function saveAllPreferences(updatedProfile?: PatientHealthProfile, updatedGovt?: string[], updatedPvt?: string[]) {
    const profToSave = updatedProfile ?? profile;
    const govtToSave = updatedGovt ?? prefGovtIds;
    const pvtToSave = updatedPvt ?? prefPvtIds;

    if (typeof window !== "undefined") {
      localStorage.setItem(PROFILE_PREFS_KEY, JSON.stringify(profToSave));
      localStorage.setItem(PREFERRED_HOSPITALS_KEY, JSON.stringify({ govt: govtToSave, pvt: pvtToSave }));
    }
    setSavedNotice("Profile & Preferred Hospital settings saved!");
    setTimeout(() => setSavedNotice(null), 3000);
  }

  function toggleGovtPreference(hospId: string) {
    const next = prefGovtIds.includes(hospId)
      ? prefGovtIds.filter((id) => id !== hospId)
      : [...prefGovtIds, hospId];
    setPrefGovtIds(next);
    saveAllPreferences(undefined, next, undefined);
  }

  function togglePvtPreference(hospId: string) {
    const next = prefPvtIds.includes(hospId)
      ? prefPvtIds.filter((id) => id !== hospId)
      : [...prefPvtIds, hospId];
    setPrefPvtIds(next);
    saveAllPreferences(undefined, undefined, next);
  }

  function addAllergy() {
    if (!newAllergy.trim()) return;
    const next = [...profile.allergies, newAllergy.trim()];
    setProfile((prev) => ({ ...prev, allergies: next }));
    setNewAllergy("");
  }

  function removeAllergy(index: number) {
    const next = profile.allergies.filter((_, i) => i !== index);
    setProfile((prev) => ({ ...prev, allergies: next }));
  }

  function addMedication() {
    if (!newMedication.trim()) return;
    const next = [...profile.medications, newMedication.trim()];
    setProfile((prev) => ({ ...prev, medications: next }));
    setNewMedication("");
  }

  function removeMedication(index: number) {
    const next = profile.medications.filter((_, i) => i !== index);
    setProfile((prev) => ({ ...prev, medications: next }));
  }

  const govtHospitals = hospitals.filter((h) => h.category === "government" && h.type === "hospital");
  const pvtHospitals = hospitals.filter((h) => h.category === "private");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
            <UserCheck className="h-3.5 w-3.5" aria-hidden />
            Patient Identification & Saved Preferences
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
            Patient Profile & Hospital Preferences
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage your personal health record, saved preferred government & private hospitals, and emergency contacts.
          </p>
        </div>

        <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "secondary" : "primary"}>
          <Pencil className="h-4 w-4" /> {isEditing ? "Done Editing" : "Edit Profile"}
        </Button>
      </div>

      {savedNotice && (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900" role="status">
          {savedNotice}
        </p>
      )}

      {/* Main Profile Details Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Personal Identity Card */}
        <section className="rounded-[2.25rem] border border-border bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 border-b border-border pb-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0f2420] font-display text-2xl font-bold text-teal-300 shadow-md">
                {profile.name.charAt(0)}
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">{profile.name}</h2>
                <p className="text-xs text-muted">{user?.email || "patient@zivan.demo"}</p>
                <span className="inline-block mt-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-700">
                  Verified Patient
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-muted font-medium">Age</span>
                {isEditing ? (
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile((p) => ({ ...p, age: Number(e.target.value) || p.age }))}
                    className="h-8 w-20 rounded-lg border border-border bg-white px-2 text-right font-bold"
                  />
                ) : (
                  <strong className="font-bold text-foreground">{profile.age} years</strong>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl bg-rose-50 p-3 border border-rose-100">
                <span className="text-rose-900 font-medium">Blood Group</span>
                {isEditing ? (
                  <select
                    value={profile.bloodGroup}
                    onChange={(e) => setProfile((p) => ({ ...p, bloodGroup: e.target.value }))}
                    className="h-8 rounded-lg border border-rose-300 bg-white px-2 font-bold text-rose-950"
                  >
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                ) : (
                  <span className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                    {profile.bloodGroup}
                  </span>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <Button onClick={() => saveAllPreferences()} className="mt-6 w-full">
              Save Changes
            </Button>
          )}
        </section>

        {/* Middle Column: Allergies & Current Medications */}
        <section className="rounded-[2.25rem] border border-border bg-white p-6 shadow-sm space-y-6 lg:col-span-2">
          {/* Allergies Manager */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" /> Allergies & Hypersensitivities
              </h3>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {profile.allergies.map((allergy, idx) => (
                <span key={allergy} className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-900">
                  {allergy}
                  {isEditing && (
                    <button type="button" onClick={() => removeAllergy(idx)} className="text-amber-600 hover:text-amber-900">
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            {isEditing && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Add allergy (e.g. Peanuts, Latex)"
                  className="h-10 flex-1 rounded-xl border border-border bg-[#fbfefd] px-3 text-xs outline-none focus:border-primary"
                />
                <Button type="button" onClick={addAllergy} size="sm" variant="secondary">
                  Add
                </Button>
              </div>
            )}
          </div>

          {/* Current Medications Manager */}
          <div className="border-t border-border pt-5">
            <h3 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" /> Current Medications
            </h3>

            <ul className="mt-3 space-y-2">
              {profile.medications.map((med, idx) => (
                <li key={med} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs font-bold text-slate-800">
                  <span>💊 {med}</span>
                  {isEditing && (
                    <button type="button" onClick={() => removeMedication(idx)} className="text-rose-600 hover:underline text-[11px]">
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {isEditing && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  placeholder="Add medication (e.g. Aspirin 81mg daily)"
                  className="h-10 flex-1 rounded-xl border border-border bg-[#fbfefd] px-3 text-xs outline-none focus:border-primary"
                />
                <Button type="button" onClick={addMedication} size="sm" variant="secondary">
                  Add
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ─── PREFERRED HOSPITALS SECTION (TWO CATEGORIES) ─── */}
      <section className="rounded-[2.25rem] border border-border bg-white p-6 shadow-sm sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500 fill-amber-400" />
            <h2 className="font-display text-2xl font-bold">Preferred Saved Hospitals</h2>
          </div>
          <p className="mt-1 text-xs text-muted">
            Manage your saved hospital preferences for automated emergency routing and priority dispatch.
          </p>
        </div>

        {/* 1. Preferred Government Hospitals Category */}
        <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
              🏛️ Preferred Government Hospitals
            </h3>
            <span className="text-xs text-emerald-800 font-semibold">{prefGovtIds.length} Saved</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {govtHospitals.map((hosp) => {
              const isSaved = prefGovtIds.includes(hosp.id);
              return (
                <div
                  key={hosp.id}
                  className={cn(
                    "flex flex-col justify-between rounded-xl border p-4 text-xs transition-all bg-white",
                    isSaved ? "border-emerald-500 ring-1 ring-emerald-500/30" : "border-slate-200 opacity-80"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{hosp.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleGovtPreference(hosp.id)}
                        className={cn(
                          "rounded-lg px-2.5 py-1 font-bold text-[11px] transition",
                          isSaved
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        )}
                      >
                        {isSaved ? "Saved ✓" : "+ Add"}
                      </button>
                    </div>
                    <p className="mt-1 text-muted">{hosp.distanceKm} km away · {hosp.address}</p>
                    <p className="mt-0.5 font-semibold text-emerald-700">ICU: {hosp.icuStatus}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Preferred Private Hospitals Category */}
        <div className="space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-indigo-950 flex items-center gap-2">
              🏥 Preferred Private Hospitals
            </h3>
            <span className="text-xs text-indigo-800 font-semibold">{prefPvtIds.length} Saved</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pvtHospitals.map((hosp) => {
              const isSaved = prefPvtIds.includes(hosp.id);
              return (
                <div
                  key={hosp.id}
                  className={cn(
                    "flex flex-col justify-between rounded-xl border p-4 text-xs transition-all bg-white",
                    isSaved ? "border-indigo-500 ring-1 ring-indigo-500/30" : "border-slate-200 opacity-80"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{hosp.name}</span>
                      <button
                        type="button"
                        onClick={() => togglePvtPreference(hosp.id)}
                        className={cn(
                          "rounded-lg px-2.5 py-1 font-bold text-[11px] transition",
                          isSaved
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        )}
                      >
                        {isSaved ? "Saved ✓" : "+ Add"}
                      </button>
                    </div>
                    <p className="mt-1 text-muted">{hosp.distanceKm} km away · {hosp.address}</p>
                    <div className="mt-1.5 flex items-center justify-between font-semibold">
                      <span className="text-indigo-900">Est. Fare: {hosp.estimatedFare ?? "₹450 (Est.)"}</span>
                      <span className="text-slate-600">ICU: {hosp.icuStatus}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Emergency Contacts Summary Card */}
      <section className="rounded-[2.25rem] border border-border bg-white p-6 shadow-sm sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl font-bold">Connected Emergency Contacts ({contacts.length})</h3>
            <p className="text-xs text-muted">Notified during SOS emergency dispatch</p>
          </div>
          <Button href="/dashboard/emergency" size="sm" variant="secondary">
            Manage Contacts in Emergency Dispatch
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {contacts.map((c) => (
            <div key={c.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs">
              <p className="font-bold text-slate-900">{c.name}</p>
              <p className="text-muted">{c.relationship} · <strong className="text-teal-700">{c.phone}</strong></p>
              <span className="inline-block mt-2 font-bold text-[10px] uppercase text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                {c.priority}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
