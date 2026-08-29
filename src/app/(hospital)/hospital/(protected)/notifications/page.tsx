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
      const getTitle = (s: AmbulanceRequest["status"]) => {
        if (s === "PENDING" || s === "searching") return "🚨 New SOS Emergency Dispatch";
        if (s === "REQUEST RECEIVED") return "📋 ER Desk Request Acknowledged";
        if (s === "HOSPITAL ACCEPTED" || s === "accepted") return "✅ Hospital ER Accepted";
        if (s === "AMBULANCE ASSIGNED") return "🚑 Paramedic & Ambulance Assigned";
        if (s === "AMBULANCE EN ROUTE" || s === "en_route") return "⚡ Ambulance Navigating to Patient";
        if (s === "AMBULANCE ARRIVED" || s === "arrived") return "📍 Ambulance Arrived at Scene";
        if (s === "PATIENT PICKED UP") return "🏥 Patient Onboard & En Route to ER";
        if (s === "ARRIVED AT HOSPITAL") return "🏁 Patient Admitted to Emergency Room";
        if (s === "declined") return "❌ Request Declined";
        return "↩ Request Updated";
      };

      const getBody = (r: AmbulanceRequest) => {
        if (r.status === "PENDING" || r.status === "searching") {
          return `${r.patientName} triggered priority SOS dispatch at ${r.locationLabel}.`;
        }
        if (r.status === "HOSPITAL ACCEPTED" || r.status === "accepted") {
          return `Request for ${r.patientName} accepted by ${r.acceptedBy ?? "ER Desk"}. ETA: ${r.etaMinutes ?? 8} min.`;
        }
        if (r.status === "AMBULANCE ASSIGNED") {
          return `${r.driverName ?? "Paramedic"} (${r.vehicleNumber ?? "DL-01-EV-4892"}) assigned for ${r.patientName}.`;
        }
        return `Emergency status for ${r.patientName} updated to ${r.status}.`;
      };

      return {
        id: `${req.id}-${req.status}`,
        title: getTitle(req.status),
        body: getBody(req),
        type,
        time: new Date(req.updatedAt),
        read: req.status !== "searching" && req.status !== "PENDING",
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
    emergency: "border-0 bg-emergency-soft/90 shadow-[0_12px_32px_rgba(217,53,74,0.18)] hover:shadow-[0_18px_44px_rgba(217,53,74,0.28)]",
    status: "border-0 bg-accent-soft/90 shadow-[0_12px_32px_rgba(26,155,181,0.18)] hover:shadow-[0_18px_44px_rgba(26,155,181,0.28)]",
    info: "border-0 bg-[#eef6f4] shadow-[0_12px_32px_rgba(15,61,53,0.08)] hover:shadow-[0_18px_44px_rgba(13,143,122,0.16)]",
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
                "rounded-full border-0 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-all duration-200",
                filter === f
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white text-muted hover:bg-primary-soft hover:text-primary hover:shadow-2xs",
              )}
            >
              {f === "all" ? "All" : "Unread"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[2rem] border-0 bg-[#eef6f4] py-20 text-center shadow-[0_14px_40px_rgba(15,61,53,0.1)]">
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
