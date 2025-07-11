import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import axios from "axios";
import { NextResponse } from "next/server";

const WHATSAPP_API_URL =
  "https://graph.facebook.com/v18.0/441143062411889/messages";
const WHATSAPP_ACCESS_TOKEN =
  "EAARfYvT6wOgBO9qvOuzjTn5khoM2XZBfmQUqRvnMa2W1bXtDBZC8Tz03xTB1MQZABAhGZAllMx4xyIO2McBwu0nVRYQcECLDAHBDjNf2cSAaCTLthKSe2QiRGiCpqaBZBX1X50z660kHXlntsEwN8YJetR2ofGBnpdT7wX6l4OZC6EJmfFjoWsiXgEjbDBZC0xmxyTGpfJzbNlN7pMdCZBeepNMd5ZA4JczAYqwBphZCOQ";

export async function POST(req) {
  console.log("⚡ [START] Forgot Password OTP Request");

  try {
    const { phone } = await req.json();
    console.log(`📞 Requested phone number: ${phone}`);

    await connectToDatabase();

    // Find user
    const user = await User.findOne({ phone });

    if (!user) {
      return NextResponse.json(
        { error: "Phone number not registered" },
        { status: 404 }
      );
    }

    // Check if OTP is still valid
    if (user.otpExpires && new Date() < user.otpExpires) {
      return NextResponse.json(
        { error: "Please wait until OTP expires before requesting a new one." },
        { status: 429 }
      );
    }

    // ✅ Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
    const otpExpires = new Date(Date.now() + 5 * 60000); // Expires in  minutes
    console.log(otp);

    // Save OTP in database
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP via WhatsApp API
    try {
      const response = await axios.post(
        WHATSAPP_API_URL,
        {
          messaging_product: "whatsapp",
          to: `91${user.phone}`,
          type: "text",
          text: {
            body: `Your password reset OTP is: ${otp}. It will be valid for 5 minutes. Please DO NOT share it.`,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      return NextResponse.json(
        {
          message: "OTP sent successfully",
          expiresAt: otpExpires,
          username: user.username,
        },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to send OTP" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
