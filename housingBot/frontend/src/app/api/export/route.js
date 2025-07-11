import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import fs from "fs";
import path from "path";

export async function GET(req) {
    await connectToDatabase();

    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("sessionId");

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
        }

        // Fetch the conversation from the database
        const conversation = await Conversation.findOne({ sessionId });

        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        // Convert conversation to JSON
        const jsonData = JSON.stringify(conversation, null, 2);
        const filePath = path.join(process.cwd(), "public", `conversation-${sessionId}.json`);

        // Save file to server
        fs.writeFileSync(filePath, jsonData);

        return NextResponse.json({
            message: "Conversation exported successfully",
            downloadUrl: `/conversation-${sessionId}.json`
        });
    } catch (error) {
        console.error("Export Conversation Error:", error);
        return NextResponse.json({ error: "Failed to export conversation" }, { status: 500 });
    }
}
