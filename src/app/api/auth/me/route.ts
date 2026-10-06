import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const id = searchParams.get("id");

    if (!email && !id) {
      return NextResponse.json(
        { ok: false, error: "Provide user id or email parameter" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const query = id ? { _id: id } : { email: email?.toLowerCase() };
    const user = await User.findOne(query);

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
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
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, email, ...updates } = body;

    if (!id && !email) {
      return NextResponse.json({ ok: false, error: "User id or email required" }, { status: 400 });
    }

    await connectToDatabase();
    const query = id ? { _id: id } : { email: email.toLowerCase() };
    const user = await User.findOneAndUpdate(query, { $set: updates }, { new: true });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
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
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
