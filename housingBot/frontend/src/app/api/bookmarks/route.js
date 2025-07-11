import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Bookmark from "@/models/Bookmark";

export async function GET(req) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const username = searchParams.get("username");
        const filter = searchParams.get("filter") || "all";

        if (!username) {
            return NextResponse.json({ error: "Username is required." }, { status: 400 });
        }

        let query = { username }; // Base query to filter by username
        const now = new Date();

        // Apply correct time filtering
        if (filter !== "all") {
            let timeFilter = {};
            switch (filter) {
                case "hour":
                    timeFilter = { createdAt: { $gte: new Date(now.getTime() - 60 * 60 * 1000) } }; // Last 1 hour
                    break;
                case "day":
                    timeFilter = { createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }; // Last 24 hours
                    break;
                case "week":
                    timeFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }; // Last 7 days
                    break;
            }
            query = { ...query, ...timeFilter };
        }

        const bookmarks = await Bookmark.find(query).sort({ createdAt: -1 }); // Sort by newest
        return NextResponse.json({ bookmarks });
    } catch (error) {
        console.error("Error fetching bookmarks:", error);
        return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectToDatabase();
        const { session_id, message, collection_name, username } = await req.json();

        // Check if the message is already bookmarked
        const existingBookmark = await Bookmark.findOne({ session_id, message, collection_name, username });
        
        if (existingBookmark) {
            return NextResponse.json({ error: "Message is already bookmarked!" });
        }

        const newBookmark = new Bookmark({
            session_id,
            message,
            collection_name,
            username
        });

        await newBookmark.save();
        return NextResponse.json({ message: "Bookmark saved successfully!" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save bookmark" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await connectToDatabase();
        const { bookmarkId } = await req.json();
        await Bookmark.findByIdAndDelete(bookmarkId);
        return NextResponse.json({ message: "Bookmark deleted successfully!" });
    } catch (error) {
        console.error("Error deleting bookmark:", error);
        return NextResponse.json({ error: "Failed to delete bookmark" }, { status: 500 });
    }
}
