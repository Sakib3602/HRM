import { Schema, model, Document, Types } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  description: string;
  createdBy: Types.ObjectId;
  company: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

export const Announcement = model<IAnnouncement>("Announcement", announcementSchema);