import { Schema, model, Document, Types } from "mongoose";

export interface ITask extends Document {
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  assignedTo: Types.ObjectId;
  dueDate: Date;
  createdBy: Types.ObjectId;
  company: string;
  completionNote?: string;  
  completedAt?: Date;       
  createdAt?: Date;
  updatedAt?: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: String, required: true },
    completionNote: { type: String, default: "" },
    completedAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

export const Task = model<ITask>("Task", taskSchema);