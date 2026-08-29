"use client";

import { HospitalAuthGuard } from "@/components/hospital/HospitalAuthGuard";
import { HospitalShell } from "@/components/hospital/HospitalShell";
import { useHospitalAuth } from "@/lib/hospitalAuth";
import { subscribeAmbulanceRequests } from "@/lib/ambulanceStore";
import { useEffect, useState } from "react";

function ShellWithNotifications({ children }: { children: React.ReactNode }) {
  const { account } = useHospitalAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!account) return;
    return subscribeAmbulanceRequests((all) => {
      const count = all.filter(
        (r) => r.hospitalId === account.hospitalId && r.status === "searching",
      ).length;
      setUnreadCount(count);
    });
  }, [account]);

  return (
    <HospitalShell notificationCount={unreadCount}>{children}</HospitalShell>
  );
}

export default function HospitalAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HospitalAuthGuard>
      <ShellWithNotifications>{children}</ShellWithNotifications>
    </HospitalAuthGuard>
  );
}
