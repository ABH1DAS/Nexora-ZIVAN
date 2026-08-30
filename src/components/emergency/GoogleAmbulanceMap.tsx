"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  Ambulance,
  MapPin,
  Layers,
  LocateFixed,
  Route,
  ChevronDown,
  ChevronUp,
  Car,
} from "lucide-react";
import { hospitals as defaultHospitals, type Hospital } from "@/data/hospitals";

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

function getHospitalIconSvg(category: "government" | "private", isSelected: boolean) {
  const bgColor = isSelected ? "#0284c7" : (category === "government" ? "#2563eb" : "#059669");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="48" viewBox="0 0 38 48">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.4"/>
        </filter>
      </defs>
      <path d="M19 0 C8.5 0 0 8.5 0 19 C0 31.5 19 48 19 48 C19 48 38 31.5 38 19 C38 8.5 29.5 0 19 0 Z" fill="${bgColor}" filter="url(#shadow)"/>
      <circle cx="19" cy="18" r="12" fill="#ffffff"/>
      <rect x="16.5" y="10" width="5" height="16" rx="1.5" fill="${bgColor}"/>
      <rect x="11" y="15.5" width="16" height="5" rx="1.5" fill="${bgColor}"/>
    </svg>
  `;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function getPatientIconSvg() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="48" viewBox="0 0 38 48">
      <defs>
        <filter id="patShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#dc2626" flood-opacity="0.6"/>
        </filter>
      </defs>
      <path d="M19 0 C8.5 0 0 8.5 0 19 C0 31.5 19 48 19 48 C19 48 38 31.5 38 19 C38 8.5 29.5 0 19 0 Z" fill="#ef4444" filter="url(#patShadow)"/>
      <circle cx="19" cy="18" r="12" fill="#ffffff"/>
      <circle cx="19" cy="18" r="6" fill="#dc2626"/>
    </svg>
  `;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function getAmbulanceIconSvg() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46">
      <defs>
        <filter id="ambShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#0d9488" flood-opacity="0.7"/>
        </filter>
      </defs>
      <circle cx="23" cy="23" r="19" fill="#0f766e" stroke="#ffffff" stroke-width="2.5" filter="url(#ambShadow)"/>
      <path d="M13 26 L13 19 C13 17.5 14 16.5 15.5 16.5 L25 16.5 L30 21 L33 21 C33.8 21 34.5 21.7 34.5 22.5 L34.5 26" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="19" y="18.5" width="2" height="6" fill="#ef4444"/>
      <rect x="17" y="20.5" width="6" height="2" fill="#ef4444"/>
      <circle cx="18" cy="28" r="2.5" fill="#ffffff"/>
      <circle cx="29" cy="28" r="2.5" fill="#ffffff"/>
    </svg>
  `;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

export function GoogleAmbulanceMap({
  patientCoords: initialPatientCoords = DEFAULT_PATIENT_COORDS,
  patientLabel: initialPatientLabel = "GS Road, Ulubari / Bhangagarh, Guwahati, Assam 781007",
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
  singleHospitalOnly = false,
  onSelectHospital,
  onLocationDetected,
}: GoogleAmbulanceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [apiKeyAvailable, setApiKeyAvailable] = useState(false);

  const [activePatientCoords, setActivePatientCoords] = useState<Coordinates>(initialPatientCoords);
  const [activePatientLabel, setActivePatientLabel] = useState<string>(initialPatientLabel);
  const [gpsDetecting, setGpsDetecting] = useState(false);

  const [etaText, setEtaText] = useState(`${etaMinutes} mins`);
  const [distanceText, setDistanceText] = useState("1.2 km");
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([
    { instruction: "Head north on GS Road from Bhangagarh Base", distance: "400 m", duration: "1 min" },
    { instruction: "Continue straight across Bhangagarh Flyover on GS Road", distance: "500 m", duration: "1 min" },
    { instruction: "Pass ABC Bus Stop & merge left towards Ulubari Point", distance: "300 m", duration: "1 min" },
    { instruction: "Arrive at Patient SOS Coordinates (GS Road, Ulubari)", distance: "0 m", duration: "0 min" },
  ]);
  const [showSteps, setShowSteps] = useState(false);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    "AIzaSyCdU5-QL9eWfz71iJE4INZYwqkF1SzM8l0";

  const dynamicHospitals = useMemo(() => {
    return nearbyHospitals.map((hosp) => {
      if (!hosp.coordinates) return hosp;
      const realDist = calculateDistanceKm(
        activePatientCoords.lat,
        activePatientCoords.lng,
        hosp.coordinates.lat,
        hosp.coordinates.lng
      );
      return {
        ...hosp,
        distanceKm: realDist,
        estimatedTravelTime: `${Math.max(3, Math.round(realDist * 2.2))}–${Math.max(6, Math.round(realDist * 3.1))} mins`,
      };
    }).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [nearbyHospitals, activePatientCoords]);

  const filteredHospitals = useMemo(() => {
    const match = dynamicHospitals.filter(
      (h) =>
        h.name.toLowerCase().includes(hospitalName.toLowerCase()) ||
        hospitalName.toLowerCase().includes(h.name.toLowerCase())
    );
    return match.length > 0 ? match : dynamicHospitals.slice(0, 1);
  }, [dynamicHospitals, hospitalName]);

  function detectUserCurrentLocation() {
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

        if ((window as any).google?.maps?.Geocoder) {
          const geocoder = new (window as any).google.maps.Geocoder();
          geocoder.geocode({ location: detectedCoords }, (results: any, statusResult: string) => {
            if (statusResult === "OK" && results && results[0]) {
              const formatted = results[0].formatted_address;
              setActivePatientLabel(formatted);
              if (onLocationDetected) onLocationDetected(detectedCoords, formatted);
            } else {
              const fallbackLabel = `GPS (${detectedCoords.lat.toFixed(4)}, ${detectedCoords.lng.toFixed(4)})`;
              setActivePatientLabel(fallbackLabel);
              if (onLocationDetected) onLocationDetected(detectedCoords, fallbackLabel);
            }
          });
        } else {
          const fallbackLabel = `GPS (${detectedCoords.lat.toFixed(4)}, ${detectedCoords.lng.toFixed(4)})`;
          setActivePatientLabel(fallbackLabel);
          if (onLocationDetected) onLocationDetected(detectedCoords, fallbackLabel);
        }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo(detectedCoords);
          mapInstanceRef.current.setZoom(15);
        }

        setGpsDetecting(false);
      },
      (error) => {
        console.warn("Geolocation detection error:", error.message);
        setGpsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

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
    script.onload = () => {
      setMapsLoaded(true);
    };
    document.head.appendChild(script);
  }, [apiKey]);

  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || !(window as any).google?.maps) return;

    const google = (window as any).google;

    const darkMapStyles = [
      { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
      { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
      { featureType: "poi", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
      { featureType: "poi.business", stylers: [{ visibility: "off" }] },
      { featureType: "poi.attraction", stylers: [{ visibility: "off" }] },
      { featureType: "poi.place_of_worship", stylers: [{ visibility: "off" }] },
      { featureType: "poi.school", stylers: [{ visibility: "off" }] },
      { featureType: "poi.sports_complex", stylers: [{ visibility: "off" }] },
      { featureType: "transit.station.bus", stylers: [{ visibility: "off" }] },
      { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#f8fafc" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
      { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1e293b" }] },
      { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#475569" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
    ];

    const centerCoords = {
      lat: (activePatientCoords.lat + ambulanceCoords.lat) / 2,
      lng: (activePatientCoords.lng + ambulanceCoords.lng) / 2,
    };

    const map = new google.maps.Map(mapRef.current, {
      center: centerCoords,
      zoom: 14,
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

    // 1. Patient Marker (Guwahati 26.1714, 91.7586)
    const patientLatLng = new google.maps.LatLng(activePatientCoords.lat, activePatientCoords.lng);
    bounds.extend(patientLatLng);

    const patientMarker = new google.maps.Marker({
      position: activePatientCoords,
      map,
      title: "Patient Location (SOS Origin)",
      zIndex: 100,
      icon: {
        url: getPatientIconSvg(),
        scaledSize: new google.maps.Size(36, 46),
        anchor: new google.maps.Point(18, 46),
      },
    });

    const patientInfoWindow = new google.maps.InfoWindow({
      content: `
        <div style="color: #0f172a; padding: 6px; font-family: sans-serif;">
          <strong style="color: #dc2626; font-size: 13px;">🚨 Patient Location (SOS Origin)</strong>
          <p style="margin: 4px 0 0; font-size: 11px;">${activePatientLabel}</p>
          <span style="display:inline-block; margin-top: 4px; font-size: 10px; font-weight:bold; background:#fee2e2; color:#991b1b; padding: 2px 6px; border-radius: 4px;">CURRENT GPS PIN</span>
        </div>
      `,
    });

    patientMarker.addListener("click", () => {
      patientInfoWindow.open(map, patientMarker);
    });

    // 2. Dispatched Ambulance Marker (GS Road, Guwahati)
    const ambulanceLatLng = new google.maps.LatLng(ambulanceCoords.lat, ambulanceCoords.lng);
    bounds.extend(ambulanceLatLng);

    const ambulanceMarker = new google.maps.Marker({
      position: ambulanceCoords,
      map,
      title: `Ambulance: ${vehicleNumber}`,
      zIndex: 90,
      icon: {
        url: getAmbulanceIconSvg(),
        scaledSize: new google.maps.Size(42, 42),
        anchor: new google.maps.Point(21, 21),
      },
    });

    const ambulanceInfoWindow = new google.maps.InfoWindow({
      content: `
        <div style="color: #0f172a; padding: 6px; font-family: sans-serif;">
          <strong style="color: #0f766e; font-size: 13px;">🚑 Ambulance Unit (${vehicleNumber})</strong>
          <p style="margin: 4px 0 0; font-size: 11px;"><b>Transport Mode:</b> Emergency Road Transport (DRIVING)</p>
          <p style="margin: 2px 0 0; font-size: 11px;"><b>Paramedic:</b> ${driverName}</p>
          <p style="margin: 2px 0 0; font-size: 11px;"><b>Status:</b> ${status}</p>
          <span style="display:inline-block; margin-top: 4px; font-size: 10px; font-weight:bold; background:#ccfbf1; color:#115e59; padding: 2px 6px; border-radius: 4px;">ROAD TRANSPORT DISPATCH</span>
        </div>
      `,
    });

    ambulanceMarker.addListener("click", () => {
      ambulanceInfoWindow.open(map, ambulanceMarker);
    });

    // 3. Hospital Marker (Only logged in / assigned hospital)
    filteredHospitals.forEach((hosp) => {
      if (!hosp.coordinates) return;
      const hospLatLng = new google.maps.LatLng(hosp.coordinates.lat, hosp.coordinates.lng);
      bounds.extend(hospLatLng);

      const hospitalMarker = new google.maps.Marker({
        position: hosp.coordinates,
        map,
        title: hosp.name,
        zIndex: 80,
        icon: {
          url: getHospitalIconSvg(hosp.category, true),
          scaledSize: new google.maps.Size(38, 48),
          anchor: new google.maps.Point(19, 48),
        },
      });

      const hospInfoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #0f172a; padding: 8px; max-width: 230px; font-family: sans-serif;">
            <div style="font-weight: bold; font-size: 13px; color: #1e293b;">🏥 ${hosp.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${hosp.address}</div>
            <div style="margin-top: 6px; font-size: 11px; display: flex; gap: 4px; flex-wrap: wrap;">
              <span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: bold;">
                🟢 ${hosp.availableBeds ?? 18} ER Beds Free
              </span>
              <span style="background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 4px; font-weight: bold;">
                ${hosp.distanceKm} km (${hosp.estimatedTravelTime})
              </span>
            </div>
            <div style="margin-top: 6px; font-size: 11px;">
              <b>ICU:</b> <span style="color: ${hosp.icuStatus === 'Available' ? '#16a34a' : '#d97706'}; font-weight: bold;">${hosp.icuStatus}</span>
            </div>
            ${hosp.phone ? `<div style="margin-top: 4px; font-size: 11px; color: #2563eb; font-weight: bold;">📞 ${hosp.phone}</div>` : ''}
          </div>
        `,
      });

      hospitalMarker.addListener("click", () => {
        if (onSelectHospital) onSelectHospital(hosp);
        hospInfoWindow.open(map, hospitalMarker);
      });
    });

    // 4. Road Transport Directions
    let fallbackOuterPolyline: any = null;
    let fallbackInnerPolyline: any = null;

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      preserveViewport: true, // Prevent resetting view to Delhi / India center
      polylineOptions: {
        strokeColor: "#0284c7",
        strokeOpacity: 0.95,
        strokeWeight: 7,
        zIndex: 85,
      },
    });

    directionsService.route(
      {
        origin: new google.maps.LatLng(ambulanceCoords.lat, ambulanceCoords.lng),
        destination: new google.maps.LatLng(activePatientCoords.lat, activePatientCoords.lng),
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
      },
      (result: any, statusResult: string) => {
        if (statusResult === "OK" && result) {
          directionsRenderer.setDirections(result);
          const leg = result.routes[0]?.legs[0];
          if (leg) {
            if (leg.duration?.text) setEtaText(leg.duration.text);
            if (leg.distance?.text) setDistanceText(leg.distance.text);

            if (leg.steps && leg.steps.length > 0) {
              const formattedSteps: RouteStep[] = leg.steps.map((s: any) => ({
                instruction: s.instructions ? s.instructions.replace(/<[^>]*>?/gm, "") : "Follow road route",
                distance: s.distance?.text || "",
                duration: s.duration?.text || "",
              }));
              setRouteSteps(formattedSteps);
            }
          }
        } else {
          const roadSnappedCoordinates = [
            new google.maps.LatLng(26.1557, 91.7706),
            new google.maps.LatLng(26.1585, 91.7695),
            new google.maps.LatLng(26.1612, 91.7682),
            new google.maps.LatLng(26.1640, 91.7670),
            new google.maps.LatLng(26.1663, 91.7648),
            new google.maps.LatLng(26.1685, 91.7628),
            new google.maps.LatLng(26.1704, 91.7610),
            new google.maps.LatLng(activePatientCoords.lat, activePatientCoords.lng),
          ];

          fallbackOuterPolyline = new google.maps.Polyline({
            path: roadSnappedCoordinates,
            geodesic: true,
            strokeColor: "#083344",
            strokeOpacity: 0.8,
            strokeWeight: 9,
            zIndex: 80,
            map,
          });

          fallbackInnerPolyline = new google.maps.Polyline({
            path: roadSnappedCoordinates,
            geodesic: true,
            strokeColor: "#0284c7",
            strokeOpacity: 0.95,
            strokeWeight: 6,
            zIndex: 85,
            icons: [
              {
                icon: {
                  path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  scale: 3,
                  strokeColor: "#ffffff",
                  fillColor: "#38bdf8",
                  fillOpacity: 1,
                },
                offset: "50%",
                repeat: "90px",
              },
            ],
            map,
          });

          const directDist = calculateDistanceKm(
            ambulanceCoords.lat,
            ambulanceCoords.lng,
            activePatientCoords.lat,
            activePatientCoords.lng
          );
          setDistanceText(`${directDist} km`);
          setEtaText(`${Math.max(3, Math.round(directDist * 2.8))} mins`);
        }
      }
    );

    map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
  }, [
    mapsLoaded,
    activePatientCoords,
    activePatientLabel,
    ambulanceCoords,
    hospitalCoords,
    hospitalName,
    vehicleNumber,
    driverName,
    status,
    filteredHospitals,
    mapType,
  ]);

  function centerOnAmbulance() {
    if (mapInstanceRef.current && ambulanceCoords) {
      mapInstanceRef.current.panTo(ambulanceCoords);
      mapInstanceRef.current.setZoom(15);
    }
  }

  function centerOnPatient() {
    if (mapInstanceRef.current && activePatientCoords) {
      mapInstanceRef.current.panTo(activePatientCoords);
      mapInstanceRef.current.setZoom(15);
    }
  }

  return (
    <div className="relative flex flex-col w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950 shadow-2xl">
      {/* Top Map Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-900/90 px-5 py-3.5 backdrop-blur-md">
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
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/70 px-3 py-1.5 text-[11px] font-bold text-rose-300 hover:bg-rose-900 transition shadow-xs"
          >
            <LocateFixed className={`h-3.5 w-3.5 ${gpsDetecting ? "animate-spin" : ""}`} />
            {gpsDetecting ? "Detecting GPS..." : "📍 Get My Location"}
          </button>

          <button
            type="button"
            onClick={centerOnAmbulance}
            className="rounded-xl border border-teal-500/30 bg-teal-950/60 px-2.5 py-1 text-[11px] font-bold text-teal-300 hover:bg-teal-900 transition"
          >
            🚑 Unit
          </button>
          <button
            type="button"
            onClick={centerOnPatient}
            className="rounded-xl border border-rose-500/30 bg-rose-950/60 px-2.5 py-1 text-[11px] font-bold text-rose-300 hover:bg-rose-900 transition"
          >
            📍 Patient
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

      {/* Main Map Container */}
      <div className="relative h-[460px] sm:h-[500px] w-full bg-slate-950">
        {apiKeyAvailable && mapsLoaded ? (
          <div ref={mapRef} className="h-full w-full" />
        ) : (
          <div className="relative h-full w-full bg-[#0a1120] p-6 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

            <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-60">
              <line x1="22%" y1="72%" x2="54%" y2="46%" stroke="#0284c7" strokeWidth="5" strokeDasharray="6 6" />
            </svg>

            <div className="absolute left-[22%] top-[72%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center z-10">
              <div className="relative flex items-center justify-center">
                <span className="absolute h-10 w-10 rounded-full bg-rose-500/40 animate-ping" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.8)]">
                  <MapPin className="h-5 w-5 animate-bounce" />
                </div>
              </div>
              <span className="mt-1.5 rounded-md bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/40 shadow">
                Patient (26.1714, 91.7586)
              </span>
            </div>

            <div className="absolute left-[54%] top-[46%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center z-10">
              <div className="relative flex items-center justify-center">
                <span className="absolute h-12 w-12 rounded-full bg-teal-500/40 animate-ping" />
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500 text-slate-950 font-bold shadow-[0_0_25px_rgba(20,184,166,0.9)]">
                  <Ambulance className="h-6 w-6 animate-pulse" />
                </div>
              </div>
              <span className="mt-1.5 rounded-md bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold text-teal-300 border border-teal-500/40 shadow">
                {vehicleNumber} (Emergency Transport)
              </span>
            </div>

            <div className="absolute left-[62%] top-[18%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center z-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold shadow-[0_0_15px_rgba(37,99,235,0.8)] border border-white/20">
                🏥
              </div>
              <span className="mt-1 rounded-md bg-slate-900/90 px-2 py-0.5 text-[9px] font-bold text-blue-300 border border-blue-500/30">
                {hospitalName}
              </span>
            </div>
          </div>
        )}

        {/* Live Traffic & ETA Floating Badge with Road Transport Mode */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
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
            className="flex items-center justify-between gap-2 rounded-xl border border-sky-500/30 bg-sky-950/80 px-3 py-1.5 text-[11px] font-bold text-sky-300 hover:bg-sky-900 transition shadow-lg backdrop-blur-md"
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
          <div className="absolute top-24 left-4 z-30 max-w-sm rounded-2xl border border-white/15 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-md text-xs text-white max-h-56 overflow-y-auto space-y-2">
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
