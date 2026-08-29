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
    emergency: <ShieldAlert className="h-5 w-5 text-emergency" aria-hidden />,
    status: <Ambulance className="h-5 w-5 text-accent" aria-hidden />,
    info: <Info className="h-5 w-5 text-primary" aria-hidden />,
  };

  const bgMap = {
    emergency: "border-emergency/25 bg-emergency-soft/70 shadow-[0_10px_30px_rgba(217,53,74,0.14)] hover:shadow-[0_16px_40px_rgba(217,53,74,0.22)]",
    status: "border-accent/25 bg-accent-soft/70 shadow-[0_10px_30px_rgba(26,155,181,0.14)] hover:shadow-[0_16px_40px_rgba(26,155,181,0.22)]",
    info: "border-border bg-white shadow-[0_10px_30px_rgba(15,61,53,0.06)] hover:shadow-[0_16px_40px_rgba(13,143,122,0.12)]",
  };

  return (
    <div className="space-y-5">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold text-foreground text-lg">Notifications</h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-emergency px-2.5 py-0.5 text-xs font-bold text-white shadow-[0_4px_14px_rgba(217,53,74,0.35)]">
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
                "rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-all duration-200",
                filter === f
                  ? "bg-primary text-white shadow-sm"
                  : "bg-slate-100 text-muted hover:bg-primary-soft hover:text-primary hover:shadow-2xs",
              )}
            >
              {f === "all" ? "All" : "Unread"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-dashed border-border bg-white/70 py-20 text-center shadow-xs">
          {filter === "unread" ? (
            <>
              <BellOff className="h-10 w-10 text-muted/60" aria-hidden />
              <p className="font-semibold text-foreground">All caught up!</p>
              <p className="text-sm text-muted">No unread notifications.</p>
            </>
          ) : (
            <>
              <Bell className="h-10 w-10 text-muted/60" aria-hidden />
              <p className="font-semibold text-foreground">No notifications yet</p>
              <p className="text-sm text-muted">
                Notifications are generated from ambulance request events.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                "flex items-start gap-4 rounded-[1.5rem] border p-5 hover:-translate-y-0.5 transition-all duration-200",
                bgMap[notif.type],
                !notif.read && "ring-2 ring-offset-1",
                notif.type === "emergency" && !notif.read && "ring-emergency/30",
                notif.type === "status" && !notif.read && "ring-accent/30",
              )}
            >
              <div className="mt-0.5 shrink-0">{iconMap[notif.type]}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-foreground">{notif.title}</p>
                  <div className="flex items-center gap-2">
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-emergency animate-pulse" />
                    )}
                    {notif.read && (
                      <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                    )}
                    <span className="text-xs text-muted">
                      {notif.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted leading-relaxed">{notif.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
