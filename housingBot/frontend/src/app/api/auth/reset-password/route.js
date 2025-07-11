import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // console.log(req.json());

    const { phone, username, otp, newPassword } = await req.json();
    console.log(
      `🔍 Reset Password Attempt for Phone: ${phone}, username: ${username}, Entered OTP: ${otp}, password: ${newPassword}`
    );

    await connectToDatabase();

    // Find user
    const user = await User.findOne({ $or: [{ phone }, { username }] });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(`📊 Stored OTP: ${user.otp}, Expiry: ${user.otpExpires}`);

    // Ensure OTP is stored as a string and check expiry
    // if (!user.otp || user.otp.toString() !== otp.toString() || new Date() > user.otpExpires) {
    //     return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    // }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Update password and clear OTP fields atomically
    await User.findOneAndUpdate(
      { phone },
      { $set: { password: hashedPassword } }
    );

    return NextResponse.json({ message: "Password reset successful" });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
