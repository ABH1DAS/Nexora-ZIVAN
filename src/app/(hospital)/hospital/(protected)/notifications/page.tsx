"use client";

import { subscribeAmbulanceRequests } from "@/lib/ambulanceStore";
import { useHospitalAuth } from "@/lib/hospitalAuth";
import type { AmbulanceRequest } from "@/data/ambulanceRequests";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Ambulance,
  Bell,
  BellOff,
  CheckCircle2,
  Info,
  ShieldAlert,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: "emergency" | "status" | "info";
  time: Date;
  read: boolean;
}

function requestToNotifications(requests: AmbulanceRequest[]): Notification[] {
  return requests
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 20)
    .map((req) => {
      const type =
        req.status === "searching"
          ? "emergency"
          : req.status === "arrived" || req.status === "declined"
          ? "info"
          : "status";
      const titles: Record<AmbulanceRequest["status"], string> = {
        searching: "🚨 New SOS Request",
        accepted: "✅ Request Accepted",
        en_route: "🚑 Ambulance En Route",
        arrived: "📍 Ambulance Arrived",
        declined: "❌ Request Declined",
        cancelled: "↩ Request Cancelled",
      };
      const bodies: Record<AmbulanceRequest["status"], string> = {
        searching: `${req.patientName} requires immediate assistance at ${req.locationLabel}.`,
        accepted: `Request for ${req.patientName} accepted by ${req.acceptedBy ?? "staff"}. ETA ${req.etaMinutes ?? "—"} min.`,
        en_route: `Ambulance is en route to ${req.patientName} at ${req.locationLabel}.`,
        arrived: `Ambulance arrived at ${req.locationLabel} for ${req.patientName}.`,
        declined: `Request for ${req.patientName} was declined.`,
        cancelled: `Request ${req.id} was cancelled.`,
      };
      return {
        id: `${req.id}-${req.status}`,
        title: titles[req.status],
        body: bodies[req.status],
        type,
        time: new Date(req.updatedAt),
        read: req.status !== "searching",
      };
    });
}

export default function NotificationsPage() {
  const { account } = useHospitalAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (!account) return;
    return subscribeAmbulanceRequests((all) => {
      const mine = all.filter((r) => r.hospitalId === account.hospitalId);
      setNotifications(requestToNotifications(mine));
    });
  }, [account]);

  const displayed = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const iconMap = {
    emergency: <ShieldAlert className="h-5 w-5 text-rose-500" aria-hidden />,
    status: <Ambulance className="h-5 w-5 text-sky-500" aria-hidden />,
    info: <Info className="h-5 w-5 text-slate-400" aria-hidden />,
  };

  const bgMap = {
    emergency: "border-rose-200 bg-rose-50",
    status: "border-sky-200 bg-sky-50",
    info: "border-slate-200 bg-white",
  };

  return (
    <div className="space-y-5">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold text-[#0b1f2a]">Notifications</h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-bold text-white">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition",
                filter === f
                  ? "bg-[#0b1f2a] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
            >
              {f === "all" ? "All" : "Unread"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center shadow-xs">
          {filter === "unread" ? (
            <>
              <BellOff className="h-10 w-10 text-slate-300" aria-hidden />
              <p className="font-semibold text-slate-500">All caught up!</p>
              <p className="text-sm text-slate-400">No unread notifications.</p>
            </>
          ) : (
            <>
              <Bell className="h-10 w-10 text-slate-300" aria-hidden />
              <p className="font-semibold text-slate-500">No notifications yet</p>
              <p className="text-sm text-slate-400">
                Notifications are generated from ambulance request events.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayed.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                "flex items-start gap-4 rounded-2xl border p-4.5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200",
                bgMap[notif.type],
                !notif.read && "ring-2 ring-offset-1",
                notif.type === "emergency" && !notif.read && "ring-rose-200 shadow-sm",
                notif.type === "status" && !notif.read && "ring-sky-200 shadow-sm",
              )}
            >
              <div className="mt-0.5 shrink-0">{iconMap[notif.type]}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-[#0b1f2a]">{notif.title}</p>
                  <div className="flex items-center gap-2">
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                    {notif.read && (
                      <CheckCircle2 className="h-4 w-4 text-slate-300" aria-hidden />
                    )}
                    <span className="text-xs text-slate-400">
                      {notif.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">{notif.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
