"use client";

import { useEffect, useRef, useState } from "react";
import {
  Ambulance,
  MapPin,
  Navigation,
  Building2,
  Phone,
  Layers,
  Compass,
  CheckCircle2,
  Clock,
  Shield,
  Activity,
} from "lucide-react";
import { hospitals as defaultHospitals, type Hospital } from "@/data/hospitals";

interface Coordinates {
  lat: number;
  lng: number;
}

interface GoogleAmbulanceMapProps {
  patientCoords?: Coordinates;
  patientLabel?: string;
  ambulanceCoords?: Coordinates;
  ambulanceId?: string;
  ambulanceType?: string;
  driverName?: string;
  vehicleNumber?: string;
  hospitalCoords?: Coordinates;
  hospitalName?: string;
  status?: string;
  etaMinutes?: number;
  nearbyHospitals?: Hospital[];
  onSelectHospital?: (hospital: Hospital) => void;
}

const DEFAULT_PATIENT_COORDS: Coordinates = { lat: 28.6139, lng: 77.2090 };
const DEFAULT_HOSPITAL_COORDS: Coordinates = { lat: 28.5729, lng: 77.1743 };
const DEFAULT_AMBULANCE_COORDS: Coordinates = { lat: 28.5950, lng: 77.1920 };

export function GoogleAmbulanceMap({
  patientCoords = DEFAULT_PATIENT_COORDS,
  patientLabel = "742 Evergreen Terrace, Sector 14",
  ambulanceCoords = DEFAULT_AMBULANCE_COORDS,
  ambulanceId = "AMB-01",
  ambulanceType = "government",
  driverName = "Rajesh Kumar (Paramedic Leader)",
  vehicleNumber = "DL-01-EV-4892",
  hospitalCoords = DEFAULT_HOSPITAL_COORDS,
  hospitalName = "City Super-Specialty Hospital",
  status = "AMBULANCE EN ROUTE",
  etaMinutes = 8,
  nearbyHospitals = defaultHospitals,
  onSelectHospital,
}: GoogleAmbulanceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [apiKeyAvailable, setApiKeyAvailable] = useState(false);
  const [etaText, setEtaText] = useState(`${etaMinutes} mins`);
  const [distanceText, setDistanceText] = useState("4.2 km");
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [filterCategory, setFilterCategory] = useState<"all" | "government" | "private">("all");
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    "AIzaSyCdU5-QL9eWfz71iJE4INZYwqkF1SzM8l0";

  const filteredHospitals = nearbyHospitals.filter((h) => {
    if (filterCategory === "all") return true;
    return h.category === filterCategory;
  });

  useEffect(() => {
    if (!apiKey) {
      setApiKeyAvailable(false);
      return;
    }

    setApiKeyAvailable(true);

    if (typeof window !== "undefined" && (window as any).google?.maps) {
      setMapsLoaded(true);
      return;
    }

    const scriptId = "google-maps-script";
    if (document.getElementById(scriptId)) {
      setMapsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsLoaded(true);
    document.head.appendChild(script);
  }, [apiKey]);

  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || !(window as any).google?.maps) return;

    const google = (window as any).google;

    const darkMapStyles = [
      { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
      {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f8fafc" }],
      },
      {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#38bdf8" }],
      },
      {
        featureType: "poi.medical",
        elementType: "geometry",
        stylers: [{ color: "#0c4a6e" }],
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#334155" }],
      },
      {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1e293b" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#475569" }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#0f172a" }],
      },
    ];

    const map = new google.maps.Map(mapRef.current, {
      center: {
        lat: (patientCoords.lat + ambulanceCoords.lat) / 2,
        lng: (patientCoords.lng + ambulanceCoords.lng) / 2,
      },
      zoom: 13,
      mapTypeId: mapType,
      disableDefaultUI: false,
      zoomControl: true,
      fullscreenControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      styles: mapType === "roadmap" ? darkMapStyles : undefined,
    });

    mapInstanceRef.current = map;

    const bounds = new google.maps.LatLngBounds();

    // 1. Patient Marker
    const patientLatLng = new google.maps.LatLng(patientCoords.lat, patientCoords.lng);
    bounds.extend(patientLatLng);

    const patientMarker = new google.maps.Marker({
      position: patientCoords,
      map,
      title: "Patient SOS Location",
      zIndex: 100,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 11,
        fillColor: "#ef4444",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 3,
      },
    });

    const patientInfoWindow = new google.maps.InfoWindow({
      content: `
        <div style="color: #0f172a; padding: 6px; font-family: sans-serif;">
          <strong style="color: #dc2626; font-size: 13px;">🚨 Patient SOS Location</strong>
          <p style="margin: 4px 0 0; font-size: 11px;">${patientLabel}</p>
          <span style="display:inline-block; margin-top: 4px; font-size: 10px; font-weight:bold; background:#fee2e2; color:#991b1b; padding: 2px 6px; border-radius: 4px;">ACTIVE EMERGENCY</span>
        </div>
      `,
    });

    patientMarker.addListener("click", () => {
      patientInfoWindow.open(map, patientMarker);
    });

    // 2. Dispatched Ambulance Marker
    const ambulanceLatLng = new google.maps.LatLng(ambulanceCoords.lat, ambulanceCoords.lng);
    bounds.extend(ambulanceLatLng);

    const ambulanceMarker = new google.maps.Marker({
      position: ambulanceCoords,
      map,
      title: `Ambulance: ${vehicleNumber}`,
      zIndex: 90,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: "#14b8a6",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 3,
      },
    });

    const ambulanceInfoWindow = new google.maps.InfoWindow({
      content: `
        <div style="color: #0f172a; padding: 6px; font-family: sans-serif;">
          <strong style="color: #0f766e; font-size: 13px;">🚑 Ambulance Unit (${vehicleNumber})</strong>
          <p style="margin: 4px 0 0; font-size: 11px;"><b>Paramedic:</b> ${driverName}</p>
          <p style="margin: 2px 0 0; font-size: 11px;"><b>Status:</b> ${status}</p>
          <span style="display:inline-block; margin-top: 4px; font-size: 10px; font-weight:bold; background:#ccfbf1; color:#115e59; padding: 2px 6px; border-radius: 4px;">LIVE TELEMETRY</span>
        </div>
      `,
    });

    ambulanceMarker.addListener("click", () => {
      ambulanceInfoWindow.open(map, ambulanceMarker);
    });

    // 3. Nearby Hospitals Markers
    filteredHospitals.forEach((hosp) => {
      if (!hosp.coordinates) return;
      const hospLatLng = new google.maps.LatLng(hosp.coordinates.lat, hosp.coordinates.lng);
      bounds.extend(hospLatLng);

      const isSelected = hosp.name === hospitalName || hosp.id === selectedHospital?.id;
      const isGovt = hosp.category === "government";

      const hospitalMarker = new google.maps.Marker({
        position: hosp.coordinates,
        map,
        title: hosp.name,
        zIndex: isSelected ? 80 : 50,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: isSelected ? 8 : 6,
          fillColor: isSelected ? "#38bdf8" : (isGovt ? "#2563eb" : "#10b981"),
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      const hospInfoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #0f172a; padding: 8px; max-width: 220px; font-family: sans-serif;">
            <div style="font-weight: bold; font-size: 13px; color: #1e293b;">🏥 ${hosp.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${hosp.address}</div>
            <div style="margin-top: 6px; font-size: 11px; display: flex; gap: 4px; flex-wrap: wrap;">
              <span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: bold;">
                ${hosp.availableBeds ?? 18} ER Beds Free
              </span>
              <span style="background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 4px;">
                ${hosp.distanceKm} km (${hosp.estimatedTravelTime})
              </span>
            </div>
            <div style="margin-top: 6px; font-size: 11px;">
              <b>ICU:</b> <span style="color: ${hosp.icuStatus === 'Available' ? '#16a34a' : '#d97706'}">${hosp.icuStatus}</span>
            </div>
            ${hosp.phone ? `<div style="margin-top: 4px; font-size: 11px; color: #2563eb;">📞 ${hosp.phone}</div>` : ''}
          </div>
        `,
      });

      hospitalMarker.addListener("click", () => {
        setSelectedHospital(hosp);
        if (onSelectHospital) onSelectHospital(hosp);
        hospInfoWindow.open(map, hospitalMarker);
      });
    });

    // 4. Directions Service Driving Route
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#14b8a6",
        strokeOpacity: 0.95,
        strokeWeight: 6,
      },
    });

    directionsService.route(
      {
        origin: ambulanceCoords,
        destination: patientCoords,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result: any, statusResult: string) => {
        if (statusResult === "OK" && result) {
          directionsRenderer.setDirections(result);
          const leg = result.routes[0]?.legs[0];
          if (leg) {
            if (leg.duration?.text) setEtaText(leg.duration.text);
            if (leg.distance?.text) setDistanceText(leg.distance.text);
          }
        }
      }
    );

    map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
  }, [
    mapsLoaded,
    patientCoords,
    ambulanceCoords,
    hospitalCoords,
    hospitalName,
    vehicleNumber,
    driverName,
    status,
    filterCategory,
    mapType,
  ]);

  function centerOnAmbulance() {
    if (mapInstanceRef.current && ambulanceCoords) {
      mapInstanceRef.current.panTo(ambulanceCoords);
      mapInstanceRef.current.setZoom(15);
    }
  }

  function centerOnPatient() {
    if (mapInstanceRef.current && patientCoords) {
      mapInstanceRef.current.panTo(patientCoords);
      mapInstanceRef.current.setZoom(15);
    }
  }

  return (
    <div className="relative flex flex-col w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-900/90 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
            <Ambulance className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-300">
                Live GPS Map · {filteredHospitals.length} Nearby Hospitals
              </span>
            </div>
            <p className="text-xs font-bold text-white">
              {vehicleNumber} ➔ {hospitalName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-slate-800/90 p-1 text-[11px] font-bold text-slate-300 border border-white/5">
            <button
              type="button"
              onClick={() => setFilterCategory("all")}
              className={`rounded-lg px-2.5 py-1 transition ${filterCategory === "all" ? "bg-primary text-white shadow" : "hover:text-white"}`}
            >
              All ({nearbyHospitals.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory("government")}
              className={`rounded-lg px-2.5 py-1 transition ${filterCategory === "government" ? "bg-blue-600 text-white shadow" : "hover:text-white"}`}
            >
              Govt (3)
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory("private")}
              className={`rounded-lg px-2.5 py-1 transition ${filterCategory === "private" ? "bg-emerald-600 text-white shadow" : "hover:text-white"}`}
            >
              Pvt (4)
            </button>
          </div>

          <button
            type="button"
            onClick={centerOnAmbulance}
            className="rounded-xl border border-teal-500/30 bg-teal-950/60 px-3 py-1 text-[11px] font-bold text-teal-300 hover:bg-teal-900 transition"
          >
            🚑 Focus Unit
          </button>
          <button
            type="button"
            onClick={centerOnPatient}
            className="rounded-xl border border-rose-500/30 bg-rose-950/60 px-3 py-1 text-[11px] font-bold text-rose-300 hover:bg-rose-900 transition"
          >
            📍 Focus Patient
          </button>
          <button
            type="button"
            onClick={() => setMapType((t) => (t === "roadmap" ? "satellite" : "roadmap"))}
            className="rounded-xl border border-white/10 bg-slate-800/80 px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white transition"
          >
            <Layers className="inline h-3 w-3 mr-1" />
            {mapType === "roadmap" ? "Satellite" : "Roads"}
          </button>
        </div>
      </div>

      <div className="relative h-[420px] w-full bg-slate-950">
        {apiKeyAvailable && mapsLoaded ? (
          <div ref={mapRef} className="h-full w-full" />
        ) : (
          <div className="relative h-full w-full bg-[#0a1120] p-6 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

            <div className="absolute left-[25%] top-[65%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center z-10">
              <div className="relative flex items-center justify-center">
                <span className="absolute h-10 w-10 rounded-full bg-rose-500/40 animate-ping" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.8)]">
                  <MapPin className="h-5 w-5 animate-bounce" />
                </div>
              </div>
              <span className="mt-1.5 rounded-md bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/40 shadow">
                You (Patient Pin)
              </span>
            </div>

            <div className="absolute left-[65%] top-[35%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center z-10">
              <div className="relative flex items-center justify-center">
                <span className="absolute h-12 w-12 rounded-full bg-teal-500/40 animate-ping" />
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500 text-slate-950 font-bold shadow-[0_0_25px_rgba(20,184,166,0.9)]">
                  <Ambulance className="h-6 w-6 animate-pulse" />
                </div>
              </div>
              <span className="mt-1.5 rounded-md bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold text-teal-300 border border-teal-500/40 shadow">
                {vehicleNumber} ({ambulanceType.toUpperCase()})
              </span>
            </div>

            <div className="absolute left-[50%] top-[25%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center z-10">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-[0_0_15px_rgba(37,99,235,0.7)]">
                🏥
              </div>
              <span className="mt-1 rounded-md bg-slate-900/90 px-2 py-0.5 text-[9px] font-bold text-blue-300 border border-blue-500/30">
                AIIMS Central (34 Beds)
              </span>
            </div>
          </div>
        )}

        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/95 px-4 py-2 backdrop-blur-md shadow-xl">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold text-white">
            Live ETA: <span className="text-amber-300 font-mono">{etaText}</span> ({distanceText})
          </span>
        </div>
      </div>

      <div className="border-t border-white/10 bg-slate-900/95 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            🏥 Nearby Hospitals within 6 km Network
          </span>
          <span className="text-[10px] text-teal-400 font-semibold">
            Click any hospital pin to view ER beds & route
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {filteredHospitals.slice(0, 4).map((hosp) => {
            const isTarget = hosp.name === hospitalName;
            return (
              <div
                key={hosp.id}
                onClick={() => {
                  setSelectedHospital(hosp);
                  if (onSelectHospital) onSelectHospital(hosp);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.panTo(hosp.coordinates);
                    mapInstanceRef.current.setZoom(14);
                  }
                }}
                className={`cursor-pointer rounded-2xl border p-2.5 transition-all text-xs ${
                  isTarget
                    ? "border-teal-500 bg-teal-950/40 text-white ring-1 ring-teal-500/40 shadow-lg"
                    : "border-white/5 bg-slate-800/50 text-slate-300 hover:border-white/20 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                      hosp.category === "government"
                        ? "bg-blue-500/20 text-blue-300"
                        : "bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    {hosp.category}
                  </span>
                  <span className="text-[10px] font-mono text-amber-300 font-bold">
                    {hosp.distanceKm} km · {hosp.estimatedTravelTime}
                  </span>
                </div>

                <p className="mt-1 font-bold truncate text-white">{hosp.name}</p>

                <div className="mt-1.5 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-semibold">
                    🟢 {hosp.availableBeds ?? 18} Beds Free
                  </span>
                  <span className="text-slate-400">
                    ICU: <strong className={hosp.icuStatus === "Available" ? "text-emerald-400" : "text-amber-400"}>{hosp.icuStatus}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
