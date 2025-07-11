import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import axios from "axios";

import { NextResponse } from "next/server";

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0/441143062411889/messages"; // Replace with actual API URL
const WHATSAPP_ACCESS_TOKEN = "EAARfYvT6wOgBO9qvOuzjTn5khoM2XZBfmQUqRvnMa2W1bXtDBZC8Tz03xTB1MQZABAhGZAllMx4xyIO2McBwu0nVRYQcECLDAHBDjNf2cSAaCTLthKSe2QiRGiCpqaBZBX1X50z660kHXlntsEwN8YJetR2ofGBnpdT7wX6l4OZC6EJmfFjoWsiXgEjbDBZC0xmxyTGpfJzbNlN7pMdCZBeepNMd5ZA4JczAYqwBphZCOQ"; // Replace with actual access token

export async function POST(req) {
    console.log("⚡ [START] Received OTP request");

    try {
        // Parse request body
        console.log("📩 Parsing request...");
        const { phone } = await req.json();
        console.log(`📞 Requested phone number: ${phone}`);

        // Connect to database
        console.log("🛢️ Connecting to database...");
        await connectToDatabase();
        console.log("✅ Database connected!");

        // Fetch user by phone number
        console.log(`🔎 Looking up user with phone: ${phone}`);
        const user = await User.findOne({ phone });
        console.log("🔍 User lookup result:", user);
        console.log(user.username);
        
        if (!user) {
            console.warn(`❌ Phone number ${phone} not registered`);
            return NextResponse.json({ error: "Phone number not registered" }, { status: 404 });
        }

        // Check if OTP is still valid
        if (user.otpExpires && new Date() < user.otpExpires) {
            console.warn(`⏳ User ${phone} requested OTP too soon. Existing OTP still valid.`);
            return NextResponse.json({ error: "Please wait until the OTP expires before requesting a new one." }, { status: 429 });
        }

        let otp;
        let existingOtp = true;

        console.log("🔢 Generating unique OTP...");
        // Ensure a unique OTP is generated
        while (existingOtp) {
            otp = Math.floor(1000 + Math.random() * 9000).toString(); // Generates a 4-digit OTP
            existingOtp = await User.findOne({ otp });
        }
        

        console.log(`✅ OTP Generated: ${otp}`);

        // Set OTP expiration (5 minutes from now)
         const otpExpires = new Date(Date.now() + 5 * 60000);
        // const otpExpires = new Date(Date.now() + 30 * 1000); // Expires in 30 seconds

        console.log(`⏳ OTP will expire at: ${otpExpires}`);

        // Save OTP to user record
        console.log("💾 Saving OTP to database...");
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();
        console.log("✅ OTP saved successfully in database");

        // Send OTP via WhatsApp API
        try {
            console.log(`📤 Sending OTP to WhatsApp number: ${user.phone}`);

            const response = await axios.post(WHATSAPP_API_URL, {
                messaging_product: "whatsapp",
                to: "91"+user.phone,
                type: "text",
                text: { body: `Your OTP to login is : ${otp}. It will be valid for 5 mins. Please Do NOT share it with anyone. ` }
            }, {
                headers: {
                    "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                }
            });

            console.log("✅ WhatsApp API Response:", response.data);
            // router.push(`/chat?username=${user.username}`);
            return NextResponse.json({message: "OTP sent successfully", expiresAt: otpExpires, username: user.username },{status:200});
            

        } catch (error) {
            console.error("🚨 WhatsApp API Error:", error.response?.data || error.message);
            return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
        }

    } catch (error) {
        console.error("🚨 Unexpected error in OTP request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
