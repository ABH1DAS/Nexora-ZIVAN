import type { AmbulanceRequest } from "@/data/ambulanceRequests";

/**
 * Exports ambulance requests to a formatted CSV file and triggers browser download
 */
export function exportRequestsToCSV(requests: AmbulanceRequest[], filename = "hospital-dispatch-audit-log.csv") {
  if (typeof window === "undefined") return;

  const headers = [
    "Incident ID",
    "Timestamp (Created)",
    "Patient Name",
    "Phone",
    "Location",
    "Priority",
    "Status",
    "ETA (Mins)",
    "Assigned Crew / Dispatcher",
    "Blood Group",
    "Allocated Bed",
    "Heart Rate (BPM)",
    "Blood Pressure",
    "SpO2 (%)",
    "Clinical Notes",
  ];

  const rows = requests.map((r) => [
    `"${r.id}"`,
    `"${new Date(r.createdAt).toLocaleString()}"`,
    `"${r.patientName.replace(/"/g, '""')}"`,
    `"${r.patientPhone ?? "N/A"}"`,
    `"${r.locationLabel.replace(/"/g, '""')}"`,
    `"${r.priority.toUpperCase()}"`,
    `"${r.status.toUpperCase()}"`,
    `"${r.etaMinutes ?? "N/A"}"`,
    `"${r.acceptedBy ?? "Unassigned"}"`,
    `"${r.bloodGroup ?? "Unknown"}"`,
    `"${r.allocatedBed ?? "Unassigned"}"`,
    `"${r.vitals?.hr ?? "N/A"}"`,
    `"${r.vitals?.bp ?? "N/A"}"`,
    `"${r.vitals?.spo2 ?? "N/A"}"`,
    `"${r.notes.replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
