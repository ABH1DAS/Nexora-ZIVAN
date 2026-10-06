import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHealthRecord extends Document {
  userId: string;
  date: string; // YYYY-MM-DD
  steps: number;
  stepsGoal: number;
  heartRate: number;
  spo2: number;
  sleepHours: number;
  sleepMinutes: number;
  waterLiters: number;
  waterGoal: number;
  activityMinutes: number;
  calories: number;
  wellbeingScore: number;
  mood?: number; // 1-5 scale
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HealthRecordSchema = new Schema<IHealthRecord>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    steps: { type: Number, default: 0 },
    stepsGoal: { type: Number, default: 8000 },
    heartRate: { type: Number, default: 72 },
    spo2: { type: Number, default: 98 },
    sleepHours: { type: Number, default: 7 },
    sleepMinutes: { type: Number, default: 0 },
    waterLiters: { type: Number, default: 0 },
    waterGoal: { type: Number, default: 2.5 },
    activityMinutes: { type: Number, default: 0 },
    calories: { type: Number, default: 0 },
    wellbeingScore: { type: Number, default: 80 },
    mood: { type: Number, min: 1, max: 5, default: 4 },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

// Compound index for user and date
HealthRecordSchema.index({ userId: 1, date: 1 }, { unique: true });

export const HealthRecord: Model<IHealthRecord> =
  mongoose.models.HealthRecord ||
  mongoose.model<IHealthRecord>("HealthRecord", HealthRecordSchema);

export default HealthRecord;
