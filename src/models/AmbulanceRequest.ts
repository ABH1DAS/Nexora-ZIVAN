import mongoose, { Schema, Document, Model } from "mongoose";

export type AmbulanceRequestStatus =
  | "searching"
  | "accepted"
  | "declined"
  | "en_route"
  | "arrived"
  | "cancelled";

export type AmbulancePriority = "critical" | "urgent" | "standard";

export interface IAmbulanceRequest extends Document {
  id: string;
  patientName: string;
  patientPhone?: string;
  locationLabel: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  hospitalId: string;
  hospitalName: string;
  status: AmbulanceRequestStatus;
  priority: AmbulancePriority;
  notes: string;
  bloodGroup?: string;
  allergies?: string[];
  medications?: string[];
  etaMinutes?: number;
  acceptedBy?: string;
  allocatedBed?: string;
  vitals?: {
    hr: number;
    bp: string;
    spo2: number;
    rr: number;
    temp: number;
  };
  handoverNotes?: string;
  bloodCrossMatched?: boolean;
  demo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AmbulanceRequestSchema = new Schema<IAmbulanceRequest>(
  {
    id: { type: String, required: true, unique: true, index: true },
    patientName: { type: String, required: true },
    patientPhone: { type: String },
    locationLabel: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    hospitalId: { type: String, required: true, index: true },
    hospitalName: { type: String, required: true },
    status: {
      type: String,
      enum: ["searching", "accepted", "declined", "en_route", "arrived", "cancelled"],
      default: "searching",
      index: true,
    },
    priority: {
      type: String,
      enum: ["critical", "urgent", "standard"],
      default: "urgent",
    },
    notes: { type: String, default: "" },
    bloodGroup: { type: String },
    allergies: { type: [String], default: [] },
    medications: { type: [String], default: [] },
    etaMinutes: { type: Number, default: 10 },
    acceptedBy: { type: String },
    allocatedBed: { type: String },
    vitals: {
      hr: { type: Number },
      bp: { type: String },
      spo2: { type: Number },
      rr: { type: Number },
      temp: { type: Number },
    },
    handoverNotes: { type: String },
    bloodCrossMatched: { type: Boolean, default: false },
    demo: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const AmbulanceRequestModel: Model<IAmbulanceRequest> =
  mongoose.models.AmbulanceRequest ||
  mongoose.model<IAmbulanceRequest>("AmbulanceRequest", AmbulanceRequestSchema);

export default AmbulanceRequestModel;
