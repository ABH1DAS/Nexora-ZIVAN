"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  Mail,
  MoreVertical,
  Phone,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

type Role = "Doctor" | "Nurse" | "Dispatcher" | "Admin";
type Status = "active" | "off-duty" | "on-leave";

interface StaffMember {
  id: string;
  name: string;
  role: Role;
  department: string;
  email: string;
  phone: string;
  status: Status;
  shift: string;
}

const MOCK_STAFF: StaffMember[] = [
  { id: "s1", name: "Dr. Amrita Sharma", role: "Doctor", department: "Emergency", email: "a.sharma@cityhospital.demo", phone: "+91 98XXX 00001", status: "active", shift: "Morning" },
  { id: "s2", name: "Vikram Nair", role: "Dispatcher", department: "Command Centre", email: "v.nair@cityhospital.demo", phone: "+91 98XXX 00002", status: "active", shift: "Morning" },
  { id: "s3", name: "Priya Singh", role: "Nurse", department: "ICU", email: "p.singh@cityhospital.demo", phone: "+91 98XXX 00003", status: "active", shift: "Evening" },
  { id: "s4", name: "Arjun Mehta", role: "Dispatcher", department: "Command Centre", email: "a.mehta@cityhospital.demo", phone: "+91 98XXX 00004", status: "off-duty", shift: "Night" },
  { id: "s5", name: "Dr. Sonal Patel", role: "Doctor", department: "General Medicine", email: "s.patel@cityhospital.demo", phone: "+91 98XXX 00005", status: "on-leave", shift: "—" },
  { id: "s6", name: "Sunita Rao", role: "Nurse", department: "Trauma", email: "s.rao@cityhospital.demo", phone: "+91 98XXX 00006", status: "active", shift: "Morning" },
  { id: "s7", name: "Rahul Gupta", role: "Admin", department: "Administration", email: "r.gupta@cityhospital.demo", phone: "+91 98XXX 00007", status: "active", shift: "Morning" },
];

const roleColors: Record<Role, string> = {
  Doctor: "bg-sky-100 text-sky-800 border-sky-200",
  Nurse: "bg-violet-100 text-violet-800 border-violet-200",
  Dispatcher: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Admin: "bg-slate-100 text-slate-700 border-slate-200",
};

const statusConfig: Record<Status, { label: string; dot: string }> = {
  active: { label: "Active", dot: "bg-emerald-400" },
  "off-duty": { label: "Off Duty", dot: "bg-slate-300" },
  "on-leave": { label: "On Leave", dot: "bg-amber-400" },
};

export default function StaffPage() {
  const [filterRole, setFilterRole] = useState<"all" | Role>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");

  const filtered = MOCK_STAFF.filter((s) => {
    const roleMatch = filterRole === "all" || s.role === filterRole;
    const statusMatch = filterStatus === "all" || s.status === filterStatus;
    return roleMatch && statusMatch;
  });

  const activeCount = MOCK_STAFF.filter((s) => s.status === "active").length;

  return (
    <div className="space-y-5">
      {/* Summary division */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b1f2a] shadow-xs shadow-slate-900/15">
            <Users className="h-5 w-5 text-white" aria-hidden />
          </div>
          <div>
            <p className="font-semibold text-[#0b1f2a]">{MOCK_STAFF.length} Staff Members</p>
            <p className="text-xs text-slate-400">{activeCount} currently active</p>
          </div>
        </div>
        <Button
          variant="hospital-outline"
          size="sm"
          onClick={() => alert("Staff management API will connect here.")}
        >
          <UserPlus className="h-4 w-4" aria-hidden />
          Add Staff Member
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(["all", "Doctor", "Nurse", "Dispatcher", "Admin"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setFilterRole(r)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-all duration-200",
              filterRole === r
                ? "bg-[#0b1f2a] text-white shadow-xs"
                : "bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900 hover:shadow-2xs",
            )}
          >
            {r === "all" ? "All Roles" : r}
          </button>
        ))}
        <div className="ml-1 h-6 w-px bg-slate-200" />
        {(["all", "active", "off-duty", "on-leave"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilterStatus(s)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-all duration-200",
              filterStatus === s
                ? "bg-[#0b1f2a] text-white shadow-xs"
                : "bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900 hover:shadow-2xs",
            )}
          >
            {s === "all" ? "All Status" : s.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Staff grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((member) => {
          const { label, dot } = statusConfig[member.status];
          return (
            <div
              key={member.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0b1f2a] font-bold text-white shadow-xs">
                    {member.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#0b1f2a]">{member.name}</p>
                    <p className="text-xs text-slate-400">{member.department}</p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="More options"
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <MoreVertical className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide shadow-2xs", roleColors[member.role])}>
                  {member.role}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span className={cn("h-2 w-2 rounded-full", dot)} />
                  {label}
                </span>
                {member.shift !== "—" && (
                  <span className="text-xs text-slate-400">· {member.shift} shift</span>
                )}
              </div>

              <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                  {member.phone}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/80 p-3.5 text-sm text-slate-500 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all">
        <ShieldCheck className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        Staff data shown is demo/mock. Real staff management connects to the backend team's API.
      </div>
    </div>
  );
}
