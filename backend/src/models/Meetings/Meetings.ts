import { Schema, model, Document, Types } from "mongoose";

export interface IMeeting extends Document {
  title: string;
  description: string;
  date: Date;
  time: string;
  employeeId: Types.ObjectId[];
  createdBy: Types.ObjectId;
  company: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const meetingSchema = new Schema<IMeeting>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    employeeId: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

export const Meetings = model<IMeeting>("Meeting", meetingSchema);