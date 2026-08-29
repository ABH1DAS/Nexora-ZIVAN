"use client";

import { useEffect, useRef, useState } from "react";
import { Ambulance, MapPin, Navigation, Shield, Compass, Layers, ExternalLink } from "lucide-react";

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
}: GoogleAmbulanceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [apiKeyAvailable, setApiKeyAvailable] = useState(false);
  const [etaText, setEtaText] = useState(`${etaMinutes} mins`);
  const [distanceText, setDistanceText] = useState("4.2 km");
  const [mapType, setMapType] = useState<"roadmap" | "satellite" | "hybrid">("roadmap");

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    "AIzaSyCdU5-QL9eWfz71iJE4INZYwqkF1SzM8l0";

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

    const map = new google.maps.Map(mapRef.current, {
      center: {
        lat: (patientCoords.lat + ambulanceCoords.lat) / 2,
        lng: (patientCoords.lng + ambulanceCoords.lng) / 2,
      },
      zoom: 14,
      mapTypeId: mapType,
      disableDefaultUI: false,
      zoomControl: true,
      fullscreenControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
      ],
    });

    new google.maps.Marker({
      position: patientCoords,
      map,
      title: "Patient Location (SOS Origin)",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#ef4444",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 3,
      },
    });

    new google.maps.Marker({
      position: hospitalCoords,
      map,
      title: hospitalName,
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: "#0ea5e9",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
    });

    new google.maps.Marker({
      position: ambulanceCoords,
      map,
      title: `Ambulance: ${vehicleNumber}`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: "#14b8a6",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 3,
      },
    });

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#14b8a6",
        strokeOpacity: 0.9,
        strokeWeight: 5,
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
  }, [mapsLoaded, patientCoords, ambulanceCoords, hospitalCoords, hospitalName, vehicleNumber, mapType]);

  return (
    <div className="relative h-96 w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
      {apiKeyAvailable && mapsLoaded ? (
        <div ref={mapRef} className="h-full w-full" />
      ) : (
        <div className="relative h-full w-full bg-[#0a1120] p-6 flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

          <svg className="absolute inset-0 h-full w-full pointer-events-none">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path
              d="M 160 220 Q 320 120, 520 180 T 780 120"
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="4"
              strokeDasharray="8 6"
              className="animate-pulse"
            />
          </svg>

          <div className="absolute left-[20%] top-[55%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center z-10">
            <div className="relative flex items-center justify-center">
              <span className="absolute h-10 w-10 rounded-full bg-rose-500/40 animate-ping" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.8)]">
                <MapPin className="h-5 w-5 animate-bounce" />
              </div>
            </div>
            <span className="mt-1.5 rounded-md bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/40 shadow">
              You ({patientLabel.slice(0, 20)}...)
            </span>
          </div>

          <div className="absolute left-[65%] top-[32%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center z-10">
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

          <div className="relative z-20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-900/90 border border-white/10 px-3.5 py-1.5 backdrop-blur-md">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-400 animate-ping" />
              <span className="text-xs font-bold text-teal-300 tracking-wide uppercase">
                {status}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-2xl bg-slate-900/90 border border-white/10 px-3 py-1.5 backdrop-blur-md text-xs font-bold text-white">
                ⏱️ ETA: <span className="text-amber-300 font-mono">{etaText}</span> ({distanceText})
              </div>
            </div>
          </div>

          {!apiKeyAvailable && (
            <div className="relative z-20 mx-auto max-w-md rounded-2xl border border-teal-500/30 bg-slate-900/95 p-3.5 text-center backdrop-blur-md shadow-2xl">
              <p className="text-xs font-bold text-teal-300 flex items-center justify-center gap-1.5">
                <Compass className="h-4 w-4 text-teal-400" />
                Google Maps API Integration Ready
              </p>
              <p className="mt-1 text-[11px] text-slate-400 leading-tight">
                Add <code className="text-amber-300 font-mono font-bold bg-slate-800 px-1 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your environment to load real satellite and traffic rendering.
              </p>
            </div>
          )}

          <div className="relative z-20 rounded-2xl border border-white/10 bg-slate-900/90 p-3.5 backdrop-blur-md">
            <div className="grid gap-2 text-xs sm:grid-cols-4">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-semibold">Paramedic Team</span>
                <strong className="text-white">{driverName}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-semibold">Vehicle Reg No.</span>
                <strong className="text-teal-300 font-mono">{vehicleNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-semibold">Destination ER</span>
                <strong className="text-white">{hospitalName}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-semibold">Live Fleet Link</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Navigation className="h-3 w-3 animate-spin" /> GPS Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
