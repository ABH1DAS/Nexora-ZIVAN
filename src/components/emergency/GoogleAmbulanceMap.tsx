"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  Ambulance,
  MapPin,
  Layers,
  LocateFixed,
  Route,
  ChevronDown,
  ChevronUp,
  Car,
  Navigation,
} from "lucide-react";
import { hospitals as defaultHospitals, type Hospital } from "@/data/hospitals";
import "leaflet/dist/leaflet.css";

export interface Coordinates {
  lat: number;
  lng: number;
}

interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
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
  singleHospitalOnly?: boolean;
  onSelectHospital?: (hospital: Hospital) => void;
  onLocationDetected?: (coords: Coordinates, address: string) => void;
}

const DEFAULT_PATIENT_COORDS: Coordinates = { lat: 26.1714, lng: 91.7586 };
const DEFAULT_HOSPITAL_COORDS: Coordinates = { lat: 26.1557, lng: 91.7706 };
const DEFAULT_AMBULANCE_COORDS: Coordinates = { lat: 26.1640, lng: 91.7670 };

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function GoogleAmbulanceMap({
  patientCoords = DEFAULT_PATIENT_COORDS,
  patientLabel = "GS Road, Ulubari / Bhangagarh, Guwahati, Assam 781007",
  ambulanceCoords = DEFAULT_AMBULANCE_COORDS,
  ambulanceId = "AMB-01",
  ambulanceType = "government",
  driverName = "Rajesh Kumar (Paramedic Leader)",
  vehicleNumber = "AS-01-EV-4892",
  hospitalCoords = DEFAULT_HOSPITAL_COORDS,
  hospitalName = "GMCH Emergency Trauma Center",
  status = "AMBULANCE EN ROUTE",
  etaMinutes = 6,
  nearbyHospitals = defaultHospitals,
  singleHospitalOnly = true,
  onSelectHospital,
  onLocationDetected,
}: GoogleAmbulanceMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const patientMarkerRef = useRef<any>(null);
  const ambulanceMarkerRef = useRef<any>(null);
  const hospitalMarkerRef = useRef<any>(null);
  const polylineLayerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  const [activePatientCoords, setActivePatientCoords] = useState<Coordinates>(patientCoords || DEFAULT_PATIENT_COORDS);
  const [activePatientLabel, setActivePatientLabel] = useState<string>(patientLabel || "GS Road, Ulubari / Bhangagarh, Guwahati, Assam 781007");
  const [gpsDetecting, setGpsDetecting] = useState(false);

  const [etaText, setEtaText] = useState(`${etaMinutes} mins`);
  const [distanceText, setDistanceText] = useState("1.2 km");
  const [showSteps, setShowSteps] = useState(false);
  const [mapLayerType, setMapLayerType] = useState<"roads" | "satellite">("roads");

  const routeSteps: RouteStep[] = [
    { instruction: "Head north on GS Road from Bhangagarh Station", distance: "400 m", duration: "1 min" },
    { instruction: "Proceed across Bhangagarh Flyover Corridor", distance: "500 m", duration: "1 min" },
    { instruction: "Pass ABC Point and turn slightly left towards Ulubari", distance: "300 m", duration: "1 min" },
    { instruction: "Arrive at Patient SOS Origin Coordinates (GS Road, Ulubari)", distance: "0 m", duration: "0 min" },
  ];

  // Sync props to state
  useEffect(() => {
    if (patientCoords?.lat && patientCoords?.lng) {
      setActivePatientCoords(patientCoords);
    }
  }, [patientCoords?.lat, patientCoords?.lng]);

  useEffect(() => {
    if (patientLabel) {
      setActivePatientLabel(patientLabel);
    }
  }, [patientLabel]);

  useEffect(() => {
    if (etaMinutes != null) {
      setEtaText(`${etaMinutes} mins`);
    }
  }, [etaMinutes]);

  const targetHospital = useMemo(() => {
    const match = nearbyHospitals.find(
      (h) =>
        h.name.toLowerCase().includes(hospitalName.toLowerCase()) ||
        hospitalName.toLowerCase().includes(h.name.toLowerCase())
    );
    return match || nearbyHospitals[0];
  }, [nearbyHospitals, hospitalName]);

  const detectUserCurrentLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setGpsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detectedCoords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setActivePatientCoords(detectedCoords);
        const fallbackLabel = `GPS (${detectedCoords.lat.toFixed(4)}, ${detectedCoords.lng.toFixed(4)})`;
        setActivePatientLabel(fallbackLabel);
        if (onLocationDetected) onLocationDetected(detectedCoords, fallbackLabel);

        if (leafletMapRef.current) {
          leafletMapRef.current.setView([detectedCoords.lat, detectedCoords.lng], 15);
        }
        setGpsDetecting(false);
      },
      (error) => {
        console.warn("Geolocation error:", error.message);
        setGpsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [onLocationDetected]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Fix default icons if missing
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (!leafletMapRef.current) {
        const pLat = activePatientCoords.lat || DEFAULT_PATIENT_COORDS.lat;
        const pLng = activePatientCoords.lng || DEFAULT_PATIENT_COORDS.lng;
        const aLat = ambulanceCoords?.lat || DEFAULT_AMBULANCE_COORDS.lat;
        const aLng = ambulanceCoords?.lng || DEFAULT_AMBULANCE_COORDS.lng;

        const map = L.map(mapContainerRef.current, {
          center: [(pLat + aLat) / 2, (pLng + aLng) / 2],
          zoom: 14,
          zoomControl: true,
          attributionControl: false,
        });

        leafletMapRef.current = map;

        // Tile layer (Dark CartoDB by default, or Esri Satellite)
        const darkTileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
        tileLayerRef.current = L.tileLayer(darkTileUrl, {
          maxZoom: 19,
          subdomains: "abcd",
        }).addTo(map);
      }

      const map = leafletMapRef.current;

      // Update Tile Layer based on layer toggle
      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
      }

      if (mapLayerType === "satellite") {
        tileLayerRef.current = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 19 }
        ).addTo(map);
      } else {
        tileLayerRef.current = L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          { maxZoom: 19, subdomains: "abcd" }
        ).addTo(map);
      }

      // Custom HTML Icons
      const patientIcon = L.divIcon({
        className: "custom-patient-pin",
        html: `
          <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
            <div style="position:absolute; width:34px; height:34px; border-radius:50%; background:rgba(239,68,68,0.4); animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width:34px; height:34px; border-radius:50%; background:#ef4444; border:2.5px solid #ffffff; box-shadow:0 6px 16px rgba(220,38,38,0.6); display:flex; align-items:center; justify-content:center; color:#ffffff; font-size:16px;">
              📍
            </div>
            <div style="background:#0f172a; color:#f87171; font-weight:800; font-size:10px; padding:2px 6px; border-radius:6px; margin-top:3px; white-space:nowrap; border:1px solid rgba(239,68,68,0.4); box-shadow:0 4px 10px rgba(0,0,0,0.3);">
              Patient SOS Pin
            </div>
          </div>
        `,
        iconSize: [34, 52],
        iconAnchor: [17, 34],
      });

      const ambulanceIcon = L.divIcon({
        className: "custom-ambulance-pin",
        html: `
          <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
            <div style="position:absolute; width:40px; height:40px; border-radius:50%; background:rgba(13,148,136,0.4); animation:ping 1.2s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width:40px; height:40px; border-radius:14px; background:#0d9488; border:2.5px solid #ffffff; box-shadow:0 8px 20px rgba(13,148,136,0.7); display:flex; align-items:center; justify-content:center; color:#ffffff; font-size:18px;">
              🚑
            </div>
            <div style="background:#0f172a; color:#2dd4bf; font-weight:800; font-size:10px; padding:2px 6px; border-radius:6px; margin-top:3px; white-space:nowrap; border:1px solid rgba(45,212,191,0.4); box-shadow:0 4px 10px rgba(0,0,0,0.3);">
              ${vehicleNumber}
            </div>
          </div>
        `,
        iconSize: [40, 58],
        iconAnchor: [20, 40],
      });

      const hospitalIcon = L.divIcon({
        className: "custom-hospital-pin",
        html: `
          <div style="display:flex; flex-direction:column; align-items:center;">
            <div style="width:36px; height:36px; border-radius:12px; background:#2563eb; border:2.5px solid #ffffff; box-shadow:0 6px 16px rgba(37,99,235,0.6); display:flex; align-items:center; justify-content:center; color:#ffffff; font-size:16px;">
              🏥
            </div>
            <div style="background:#0f172a; color:#93c5fd; font-weight:800; font-size:10px; padding:2px 6px; border-radius:6px; margin-top:3px; white-space:nowrap; border:1px solid rgba(59,130,246,0.4); box-shadow:0 4px 10px rgba(0,0,0,0.3);">
              ${hospitalName}
            </div>
          </div>
        `,
        iconSize: [36, 54],
        iconAnchor: [18, 36],
      });

      const curPatientCoords = activePatientCoords || DEFAULT_PATIENT_COORDS;
      const curAmbulanceCoords = ambulanceCoords || DEFAULT_AMBULANCE_COORDS;
      const curHospCoords = targetHospital?.coordinates || DEFAULT_HOSPITAL_COORDS;

      // 1. Patient Marker
      if (patientMarkerRef.current) {
        patientMarkerRef.current.setLatLng([curPatientCoords.lat, curPatientCoords.lng]);
      } else {
        patientMarkerRef.current = L.marker([curPatientCoords.lat, curPatientCoords.lng], { icon: patientIcon })
          .addTo(map)
          .bindPopup(`<b>🚨 Patient Location (SOS Origin)</b><br/>${activePatientLabel}`);
      }

      // 2. Ambulance Marker
      if (ambulanceMarkerRef.current) {
        ambulanceMarkerRef.current.setLatLng([curAmbulanceCoords.lat, curAmbulanceCoords.lng]);
      } else {
        ambulanceMarkerRef.current = L.marker([curAmbulanceCoords.lat, curAmbulanceCoords.lng], { icon: ambulanceIcon })
          .addTo(map)
          .bindPopup(`<b>🚑 Ambulance Unit (${vehicleNumber})</b><br/>Paramedic: ${driverName}<br/>Status: ${status}`);
      }

      // 3. Hospital Marker
      if (hospitalMarkerRef.current) {
        hospitalMarkerRef.current.setLatLng([curHospCoords.lat, curHospCoords.lng]);
      } else {
        hospitalMarkerRef.current = L.marker([curHospCoords.lat, curHospCoords.lng], { icon: hospitalIcon })
          .addTo(map)
          .bindPopup(`<b>🏥 ${hospitalName}</b><br/>${targetHospital.address}`);
      }

      // 4. GS Road Corridor Snapped Polyline
      if (polylineLayerRef.current) {
        map.removeLayer(polylineLayerRef.current);
      }

      const roadPoints: [number, number][] = [
        [curHospCoords.lat, curHospCoords.lng],
        [26.1585, 91.7695],
        [26.1612, 91.7682],
        [curAmbulanceCoords.lat, curAmbulanceCoords.lng],
        [26.1663, 91.7648],
        [26.1685, 91.7628],
        [26.1704, 91.7610],
        [curPatientCoords.lat, curPatientCoords.lng],
      ];

      const outerGlow = L.polyline(roadPoints, {
        color: "#083344",
        weight: 9,
        opacity: 0.8,
        lineCap: "round",
      });

      const innerPath = L.polyline(roadPoints, {
        color: "#0284c7",
        weight: 5,
        opacity: 0.95,
        dashArray: "8, 6",
        lineCap: "round",
      });

      polylineLayerRef.current = L.layerGroup([outerGlow, innerPath]).addTo(map);

      // Fit bounds nicely with padding
      const group = L.featureGroup([
        patientMarkerRef.current,
        ambulanceMarkerRef.current,
        hospitalMarkerRef.current,
      ]);
      map.fitBounds(group.getBounds().pad(0.2));

      const directDist = calculateDistanceKm(
        curAmbulanceCoords.lat,
        curAmbulanceCoords.lng,
        curPatientCoords.lat,
        curPatientCoords.lng
      );
      setDistanceText(`${directDist} km`);
      setEtaText(`${Math.max(3, Math.round(directDist * 2.8))} mins`);
    });

    return () => {
      isMounted = false;
    };
  }, [
    activePatientCoords,
    activePatientLabel,
    ambulanceCoords,
    hospitalName,
    vehicleNumber,
    driverName,
    status,
    mapLayerType,
    targetHospital,
  ]);

  function centerOnAmbulance() {
    if (leafletMapRef.current && ambulanceCoords) {
      leafletMapRef.current.setView([ambulanceCoords.lat, ambulanceCoords.lng], 15, { animate: true });
    }
  }

  function centerOnPatient() {
    if (leafletMapRef.current && activePatientCoords) {
      leafletMapRef.current.setView([activePatientCoords.lat, activePatientCoords.lng], 15, { animate: true });
    }
  }

  return (
    <div className="relative flex flex-col w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950 shadow-2xl">
      {/* Top Map Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-900/95 px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-300 shadow-xs">
            <Ambulance className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-300">
                {hospitalName}
              </span>
            </div>
            <p className="text-xs font-bold text-white flex items-center gap-1.5 truncate max-w-xs sm:max-w-md">
              <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0" />
              <span className="truncate">{activePatientLabel}</span>
            </p>
          </div>
        </div>

        {/* Action Controls & GPS Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={detectUserCurrentLocation}
            disabled={gpsDetecting}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/70 px-3 py-1.5 text-[11px] font-bold text-rose-300 hover:bg-rose-900 transition shadow-xs cursor-pointer"
          >
            <LocateFixed className={`h-3.5 w-3.5 ${gpsDetecting ? "animate-spin" : ""}`} />
            {gpsDetecting ? "Detecting GPS..." : "📍 Get My Location"}
          </button>

          <button
            type="button"
            onClick={centerOnAmbulance}
            className="rounded-xl border border-teal-500/30 bg-teal-950/60 px-2.5 py-1 text-[11px] font-bold text-teal-300 hover:bg-teal-900 transition cursor-pointer"
          >
            🚑 Unit
          </button>
          <button
            type="button"
            onClick={centerOnPatient}
            className="rounded-xl border border-rose-500/30 bg-rose-950/60 px-2.5 py-1 text-[11px] font-bold text-rose-300 hover:bg-rose-900 transition cursor-pointer"
          >
            📍 Patient
          </button>
          <button
            type="button"
            onClick={() => setMapLayerType((t) => (t === "roads" ? "satellite" : "roads"))}
            className="rounded-xl border border-white/10 bg-slate-800/80 px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white transition cursor-pointer"
          >
            <Layers className="inline h-3 w-3 mr-1" />
            {mapLayerType === "roads" ? "🛰️ Satellite" : "🛣️ Roads"}
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative h-[460px] sm:h-[500px] w-full bg-slate-950 z-0">
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        {/* Live Traffic & ETA Floating Badge with Road Transport Mode */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/95 px-4 py-2 backdrop-blur-md shadow-xl">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Car className="h-4 w-4 text-sky-400" />
              <span>Road Transit: <strong className="text-amber-300 font-mono">{etaText}</strong> ({distanceText})</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSteps((s) => !s)}
            className="flex items-center justify-between gap-2 rounded-xl border border-sky-500/30 bg-sky-950/80 px-3 py-1.5 text-[11px] font-bold text-sky-300 hover:bg-sky-900 transition shadow-lg backdrop-blur-md cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Route className="h-3.5 w-3.5" />
              Turn-by-Turn Guidance ({routeSteps.length} steps)
            </span>
            {showSteps ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Turn-by-Turn Navigation Steps Drawer */}
        {showSteps && (
          <div className="absolute top-24 left-4 z-20 max-w-sm rounded-2xl border border-white/15 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-md text-xs text-white max-h-56 overflow-y-auto space-y-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-teal-300">
              <span>🛣️ Road Transport Route Guidance</span>
              <span>Fast Corridor</span>
            </div>
            {routeSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-[10px] font-bold text-sky-300 border border-sky-500/30">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-200">{step.instruction}</p>
                  {step.distance && (
                    <span className="text-[10px] text-slate-400">
                      {step.distance} • {step.duration}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
