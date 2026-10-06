import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  plan: "Free" | "Plus" | "Family";
  phone?: string;
  avatarUrl?: string;
  emergencyProfile?: {
    bloodGroup?: string;
    allergies?: string[];
    medications?: string[];
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    organDonor?: boolean;
    conditions?: string[];
  };
  settings?: {
    notifications?: boolean;
    locationSharing?: boolean;
    biometricLock?: boolean;
    theme?: "dark" | "light" | "system";
  };
  points?: number;
  streak?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false },
    plan: {
      type: String,
      enum: ["Free", "Plus", "Family"],
      default: "Free",
    },
    phone: { type: String, trim: true },
    avatarUrl: { type: String },
    emergencyProfile: {
      bloodGroup: { type: String, default: "O+" },
      allergies: { type: [String], default: [] },
      medications: { type: [String], default: [] },
      emergencyContactName: { type: String, default: "" },
      emergencyContactPhone: { type: String, default: "" },
      emergencyContactRelation: { type: String, default: "Family" },
      organDonor: { type: Boolean, default: true },
      conditions: { type: [String], default: [] },
    },
    settings: {
      notifications: { type: Boolean, default: true },
      locationSharing: { type: Boolean, default: true },
      biometricLock: { type: Boolean, default: false },
      theme: { type: String, enum: ["dark", "light", "system"], default: "dark" },
    },
    points: { type: Number, default: 0 },
    streak: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of model in Next.js hot-reload
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
