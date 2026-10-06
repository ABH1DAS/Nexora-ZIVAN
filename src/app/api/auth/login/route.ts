import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Please enter your email and password." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "No account found with this email." },
        { status: 404 }
      );
    }

    if (user.password) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return NextResponse.json(
          { ok: false, error: "Invalid password. Please check and try again." },
          { status: 401 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        plan: user.plan,
        points: user.points,
        streak: user.streak,
        emergencyProfile: user.emergencyProfile,
        settings: user.settings,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
