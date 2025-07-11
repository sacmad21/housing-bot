import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true }, // Ensure username is required
    email: { type: String, unique: true },
    phone: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    gender: String,
    religion: String,
    subscription: { type: String, enum: ["Free", "User", "Professional"], default: "Free" },
    otp: String,
    otpExpires: Date
}, { timestamps: true, versionKey: false });

export default mongoose.models.User || mongoose.model('User', UserSchema);
