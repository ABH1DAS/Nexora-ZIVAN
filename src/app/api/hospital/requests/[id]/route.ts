import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import AmbulanceRequestModel from "@/models/AmbulanceRequest";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    await connectToDatabase();
    const doc = await AmbulanceRequestModel.findOne({ id: params.id });

    if (!doc) {
      return NextResponse.json({ ok: false, error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      request: {
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
      },
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const updates = await request.json();
    await connectToDatabase();

    const doc = await AmbulanceRequestModel.findOneAndUpdate(
      { id: params.id },
      { $set: { ...updates, updatedAt: new Date() } },
      { new: true }
    );

    if (!doc) {
      return NextResponse.json({ ok: false, error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      request: {
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
      },
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    await connectToDatabase();
    await AmbulanceRequestModel.findOneAndDelete({ id: params.id });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
