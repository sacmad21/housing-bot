import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectToDatabase();
  try {
    const body = await req.json();

    // console.log("Received Registration Data:", body); // Debugging

    // Validate required fields
    if (!body.username || !body.email || !body.phone || !body.password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if username, email, or phone already exists
    const existingUser = await User.findOne({
      $or: [
        { username: body.username },
        { email: body.email },
        { phone: body.phone },
      ],
    });

    if (existingUser) {
      let errorMessage = "User already exists with ";
      if (existingUser.username === body.username)
        errorMessage += "this username, ";
      if (existingUser.email === body.email) errorMessage += "this email, ";
      if (existingUser.phone === body.phone)
        errorMessage += "this phone number.";

      return NextResponse.json({ error: errorMessage }, { status: 409 }); // 409 Conflict
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create new user
    const newUser = await User.create({
      username: body.username,
      email: body.email,
      phone: body.phone,
      password: hashedPassword,
      gender: body.gender,
      religion: body.religion,
      subscription: body.subscription || "Free",
    });

    return NextResponse.json({
      message: "User registered successfully",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
