import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import HospitalAccount from "@/models/HospitalAccount";
import AmbulanceRequestModel from "@/models/AmbulanceRequest";
import { HOSPITAL_ACCOUNTS } from "@/data/ambulanceRequests";
import { INITIAL_DEMO_REQUESTS } from "@/lib/ambulanceStore";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    await connectToDatabase();

    // 1. Seed Hospital Accounts if empty
    for (const acc of HOSPITAL_ACCOUNTS) {
      const exists = await HospitalAccount.findOne({ hospitalId: acc.hospitalId });
      if (!exists) {
        const hashedPassword = await bcrypt.hash(acc.password, 10);
        await HospitalAccount.create({
          hospitalId: acc.hospitalId,
          hospitalName: acc.hospitalName,
          email: acc.email,
          password: hashedPassword,
          contactName: acc.contactName,
          totalAmbulances: acc.hospitalId === "city-hospital" ? 14 : 10,
          availableAmbulances: acc.hospitalId === "city-hospital" ? 5 : 4,
          totalBeds: acc.hospitalId === "city-hospital" ? 140 : 95,
          availableBeds: acc.hospitalId === "city-hospital" ? 28 : 19,
          icuBedsAvailable: acc.hospitalId === "city-hospital" ? 7 : 4,
        });
      }
    }

    // 2. Seed Demo Ambulance Requests if empty
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

    return NextResponse.json({
      ok: true,
      message: "Database seeded successfully with initial accounts and requests.",
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
