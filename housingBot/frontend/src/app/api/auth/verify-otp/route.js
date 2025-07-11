import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { phone, otp } = await req.json();
    await connectToDatabase();

    const user = await User.findOne({ phone });

    if (!user || user.otp !== otp || new Date() > user.otpExpires) {
        return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }

    // OTP verified, reset OTP fields
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return NextResponse.json({ message: "Login successful", userId: user._id, username:user.username });
    // return NextResponse.json({message: "OTP sent successfully", expiresAt: otpExpires, username: user.username },{status:200});

}
