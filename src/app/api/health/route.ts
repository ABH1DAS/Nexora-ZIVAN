import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import HealthRecord from "@/models/HealthRecord";
import { todayMetrics } from "@/data/healthData";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default_user";
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    await connectToDatabase();

    let record = await HealthRecord.findOne({ userId, date });

    if (!record) {
      // Create initial record for today from defaults
      record = await HealthRecord.create({
        userId,
        date,
        steps: todayMetrics.steps,
        stepsGoal: todayMetrics.stepsGoal,
        heartRate: todayMetrics.heartRate,
        spo2: todayMetrics.spo2,
        sleepHours: todayMetrics.sleepHours,
        sleepMinutes: todayMetrics.sleepMinutes,
        waterLiters: todayMetrics.waterLiters,
        waterGoal: todayMetrics.waterGoal,
        activityMinutes: todayMetrics.activityMinutes,
        calories: todayMetrics.calories,
        wellbeingScore: todayMetrics.wellbeingScore,
        mood: 4,
      });
    }

    return NextResponse.json({
      ok: true,
      metrics: {
        steps: record.steps,
        stepsGoal: record.stepsGoal,
        heartRate: record.heartRate,
        spo2: record.spo2,
        sleepHours: record.sleepHours,
        sleepMinutes: record.sleepMinutes,
        waterLiters: record.waterLiters,
        waterGoal: record.waterGoal,
        activityMinutes: record.activityMinutes,
        calories: record.calories,
        wellbeingScore: record.wellbeingScore,
        mood: record.mood,
      },
    });
  } catch (error: any) {
    console.error("Health metrics fetch error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to fetch health data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = body.userId || "default_user";
    const date = body.date || new Date().toISOString().split("T")[0];

    await connectToDatabase();

    const record = await HealthRecord.findOneAndUpdate(
      { userId, date },
      { $set: body },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      ok: true,
      metrics: record,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
