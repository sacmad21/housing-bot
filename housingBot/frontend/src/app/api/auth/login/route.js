import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {  // ✅ Named export for POST requests
    try {
        const { username, password } = await req.json();
        await connectToDatabase();

        // ✅ Debugging: Check if username exists
        // console.log("🔍 Checking for user:", username);
        const user = await User.findOne({ username });

        if (!user) {
            // console.log("⛔ User not found in DB");
            return new Response(JSON.stringify({ error: "Invalid username or password" }), { status: 401 });
        }

        // console.log("✅ User found:", user);

        // ✅ Debugging: Check stored password
        // console.log("🔍 Hashed password in DB:", user.password);
        // console.log("🔍 Entered password:", password);

        // ✅ Check password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        // console.log("🔍 Password Match:", isMatch);

        if (!isMatch) {
            // console.log("⛔ Incorrect password");
            return new Response(JSON.stringify({ error: "Invalid username or password" }), { status: 401 });
        }

        // ✅ Generate JWT Token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // console.log("✅ Login Successful, Token Generated");
        return new Response(JSON.stringify({ message: "Login successful", token }), { status: 200 });

    } catch (error) {
        // console.error("⛔ Login API Error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
