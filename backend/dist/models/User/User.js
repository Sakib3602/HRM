"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const onboardingStageSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    done: { type: Boolean, default: false },
    doneAt: { type: Date },
}, { _id: false });
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
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
}, { timestamps: true, versionKey: false });
// password hash ও refresh token hash কখনো response এ যাবে না
userSchema.set("toJSON", {
    transform: (_doc, ret) => {
        delete ret.passwordHash;
        delete ret.refreshTokenHash;
        return ret;
    },
});
exports.User = (0, mongoose_1.model)("User", userSchema);
