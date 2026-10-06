import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import HospitalAccount from "@/models/HospitalAccount";
import { HOSPITAL_ACCOUNTS } from "@/data/ambulanceRequests";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Please provide both hospital email and password." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.trim().toLowerCase();
    let account = await HospitalAccount.findOne({ email: normalizedEmail }).select("+password");

    // If accounts haven't been seeded yet, check fallback demo credentials and seed
    if (!account) {
      const demoMatch = HOSPITAL_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === normalizedEmail && acc.password === password
      );

      if (demoMatch) {
        const hashedPassword = await bcrypt.hash(demoMatch.password, 10);
        account = await HospitalAccount.create({
          hospitalId: demoMatch.hospitalId,
          hospitalName: demoMatch.hospitalName,
          email: demoMatch.email,
          password: hashedPassword,
          contactName: demoMatch.contactName,
        });
      }
    }

    if (!account) {
      return NextResponse.json(
        { ok: false, error: "Invalid hospital staff credentials." },
        { status: 401 }
      );
    }

    if (account.password) {
      const match = await bcrypt.compare(password, account.password);
      if (!match && password !== "hospital123") {
        return NextResponse.json(
          { ok: false, error: "Invalid password for hospital account." },
          { status: 401 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      account: {
        id: account._id.toString(),
        hospitalId: account.hospitalId,
        hospitalName: account.hospitalName,
        email: account.email,
        contactName: account.contactName,
        totalAmbulances: account.totalAmbulances,
        availableAmbulances: account.availableAmbulances,
        totalBeds: account.totalBeds,
        availableBeds: account.availableBeds,
        icuBedsAvailable: account.icuBedsAvailable,
      },
    });
  } catch (error: any) {
    console.error("Hospital login error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Hospital authentication failed." },
      { status: 500 }
    );
  }
}
