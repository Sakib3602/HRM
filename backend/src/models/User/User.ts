import { Schema, model, Document, Types } from "mongoose";

export type UserRole = "employee" | "hr";

export interface IOnboardingStage {
  name: string;
  done: boolean;
  doneAt?: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  department: string;
  manager?: string;
  vehicle?: string;
  phone?: string;
  isActive: boolean;
  mustChangePassword: boolean;
  onboarding: {
    percent: number;
    stages: IOnboardingStage[];
  };
  pushToken?: string;
  refreshTokenHash?: string; 
  createdAt: Date;
  company?: string;
  userCreatedBy?: Types.ObjectId;
}

const onboardingStageSchema = new Schema<IOnboardingStage>(
  {
    name: { type: String, required: true },
    done: { type: Boolean, default: false },
    doneAt: { type: Date },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["employee", "hr"], default: "employee" },
  department: { type: String, required: true },
  manager: { type: String, default: "" },
  vehicle: { type: String, default: "" },
  phone: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  mustChangePassword: { type: Boolean, default: true },
  onboarding: {
    percent: { type: Number, default: 0 },
    stages: { type: [onboardingStageSchema], default: [] },
  },
  pushToken: { type: String, default: "" },
  refreshTokenHash: { type: String, default: null },
  company: { type: String, default: "" },
  userCreatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
},
{ timestamps: true, versionKey: false },

);

// password hash ও refresh token hash কখনো response এ যাবে না
userSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    delete ret.passwordHash;
    delete ret.refreshTokenHash;
    return ret;
  },
});

export const User = model<IUser>("User", userSchema);