import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/models/Conversation";

export async function POST(req) {
    await connectToDatabase();

    try {
        const { username, sessionId, messages, collectionName } = await req.json();
        
        if (!username || !sessionId || !messages.length) {
            return new Response(JSON.stringify({ error: "Invalid conversation data" }), { status: 400 });
        }
    
        const existingConversation = await Conversation.findOne({ username, sessionId });
    
        if (existingConversation) {
            existingConversation.messages = messages;
            existingConversation.collectionName = collectionName;
            existingConversation.createdAt = new Date();
            await existingConversation.save();
        } else {
            await Conversation.create({
                username,
                sessionId,
                messages,
                collectionName,
                createdAt: new Date()
            });
        }
    
        return new Response(JSON.stringify({ message: "Conversation saved successfully" }), { status: 200 });
    
    } catch (error) {
        return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), { status: 500 });
    }
}

export async function GET(req) {
    await connectToDatabase();

    try {
        const { searchParams } = new URL(req.url);
        const username = searchParams.get("username");
        
        if (!username) {
            return new Response(JSON.stringify({ error: "Username is required" }), { status: 400 });
        }

        const conversations = await Conversation.find({ username });

        if (!conversations.length) {
            return new Response(JSON.stringify({ message: "No conversations found" }), { status: 404 });
        }
        
        return new Response(JSON.stringify(conversations, null, 2), { status: 200 });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), { status: 500 });
    }
}

export async function DELETE(req) {
    await connectToDatabase();
    console.log("URL");
    console.log(req.url);
    
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return new Response(JSON.stringify({ error: "Conversation ID is required" }), { status: 400 });
        }

        const deleteResult = await Conversation.findByIdAndDelete(id);
        
        if (!deleteResult) {
            return new Response(JSON.stringify({ message: "Conversation not found" }), { status: 404 });
        }
        
        return new Response(JSON.stringify({ message: "Conversation deleted successfully" }), { status: 200 });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), { status: 500 });
    }
}