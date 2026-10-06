import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import AmbulanceRequestModel from "@/models/AmbulanceRequest";
import { INITIAL_DEMO_REQUESTS } from "@/lib/ambulanceStore";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hospitalId = searchParams.get("hospitalId");

  try {
    await connectToDatabase();

    // Auto-seed demo requests if MongoDB is currently empty
    const count = await AmbulanceRequestModel.countDocuments();
    if (count === 0) {
      for (const req of INITIAL_DEMO_REQUESTS) {
        await AmbulanceRequestModel.create({
          ...req,
          createdAt: new Date(req.createdAt),
          updatedAt: new Date(req.updatedAt),
        });
      }
    }

    const query = hospitalId ? { hospitalId } : {};
    const requests = await AmbulanceRequestModel.find(query).sort({ updatedAt: -1 });

    return NextResponse.json({
      ok: true,
      source: "mongodb",
      requests: requests.map((doc) => ({
        id: doc.id,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        patientName: doc.patientName,
        patientPhone: doc.patientPhone,
        locationLabel: doc.locationLabel,
        coordinates: doc.coordinates,
        hospitalId: doc.hospitalId,
        hospitalName: doc.hospitalName,
        status: doc.status,
        priority: doc.priority,
        notes: doc.notes,
        bloodGroup: doc.bloodGroup,
        allergies: doc.allergies,
        medications: doc.medications,
        etaMinutes: doc.etaMinutes,
        acceptedBy: doc.acceptedBy,
        allocatedBed: doc.allocatedBed,
        vitals: doc.vitals,
        handoverNotes: doc.handoverNotes,
        bloodCrossMatched: doc.bloodCrossMatched,
        demo: doc.demo,
      })),
    });
  } catch (error: any) {
    console.warn("MongoDB not reachable, serving fallback demo requests:", error.message);
    const filtered = hospitalId
      ? INITIAL_DEMO_REQUESTS.filter((req) => req.hospitalId === hospitalId)
      : INITIAL_DEMO_REQUESTS;

    return NextResponse.json({
      ok: true,
      source: "demo_fallback",
      message: "MongoDB connection pending. Set MONGODB_URI in .env.local to enable persistent storage.",
      requests: filtered,
    });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const id = body.id || `amb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date();

  try {
    await connectToDatabase();

    const newRequest = await AmbulanceRequestModel.create({
      id,
      patientName: body.patientName || "Emergency Patient",
      patientPhone: body.patientPhone || "+91 98111 00000",
      locationLabel: body.locationLabel || "Current Live GPS Location",
      coordinates: body.coordinates || { lat: 28.6139, lng: 77.209 },
      hospitalId: body.hospitalId || "city-hospital",
      hospitalName: body.hospitalName || "City Hospital",
      status: body.status || "searching",
      priority: body.priority || "urgent",
      notes: body.notes || "SOS emergency triggered from mobile application.",
      bloodGroup: body.bloodGroup || "O+",
      allergies: body.allergies || [],
      medications: body.medications || [],
      etaMinutes: body.etaMinutes || 10,
      vitals: body.vitals || {
        hr: 92,
        bp: "128/84",
        spo2: 97,
        rr: 18,
        temp: 36.9,
      },
      demo: true,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      ok: true,
      source: "mongodb",
      request: {
        id: newRequest.id,
        createdAt: newRequest.createdAt.toISOString(),
        updatedAt: newRequest.updatedAt.toISOString(),
        patientName: newRequest.patientName,
        patientPhone: newRequest.patientPhone,
        locationLabel: newRequest.locationLabel,
        coordinates: newRequest.coordinates,
        hospitalId: newRequest.hospitalId,
        hospitalName: newRequest.hospitalName,
        status: newRequest.status,
        priority: newRequest.priority,
        notes: newRequest.notes,
        bloodGroup: newRequest.bloodGroup,
        allergies: newRequest.allergies,
        medications: newRequest.medications,
        etaMinutes: newRequest.etaMinutes,
        vitals: newRequest.vitals,
        demo: newRequest.demo,
      },
    });
  } catch (error: any) {
    console.warn("MongoDB write failed, returning created demo response:", error.message);
    return NextResponse.json({
      ok: true,
      source: "demo_fallback",
      request: {
        id,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        patientName: body.patientName || "Emergency Patient",
        patientPhone: body.patientPhone || "+91 98111 00000",
        locationLabel: body.locationLabel || "Current Live GPS Location",
        coordinates: body.coordinates || { lat: 28.6139, lng: 77.209 },
        hospitalId: body.hospitalId || "city-hospital",
        hospitalName: body.hospitalName || "City Hospital",
        status: body.status || "searching",
        priority: body.priority || "urgent",
        notes: body.notes || "SOS emergency triggered.",
        bloodGroup: body.bloodGroup || "O+",
        allergies: body.allergies || [],
        medications: body.medications || [],
        etaMinutes: body.etaMinutes || 10,
        demo: true,
      },
    });
  }
}
