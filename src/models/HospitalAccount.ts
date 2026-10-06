import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHospitalAccount extends Document {
  hospitalId: string;
  hospitalName: string;
  email: string;
  password?: string;
  contactName: string;
  phone?: string;
  address?: string;
  totalAmbulances?: number;
  availableAmbulances?: number;
  totalBeds?: number;
  availableBeds?: number;
  icuBedsAvailable?: number;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalAccountSchema = new Schema<IHospitalAccount>(
  {
    hospitalId: { type: String, required: true, unique: true, index: true },
    hospitalName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    contactName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    totalAmbulances: { type: Number, default: 12 },
    availableAmbulances: { type: Number, default: 5 },
    totalBeds: { type: Number, default: 120 },
    availableBeds: { type: Number, default: 24 },
    icuBedsAvailable: { type: Number, default: 6 },
  },
  {
    timestamps: true,
  }
);

export const HospitalAccount: Model<IHospitalAccount> =
  mongoose.models.HospitalAccount ||
  mongoose.model<IHospitalAccount>("HospitalAccount", HospitalAccountSchema);

export default HospitalAccount;
