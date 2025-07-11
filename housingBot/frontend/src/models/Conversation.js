import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
    username: { type: String, required: true },
    sessionId: { type: String, required: true },
    messages: [{ sender: String, text: String }],
    collectionName: String,  // ✅ Changed `collection` to `collectionName`
    createdAt: { type: Date, default: Date.now }
}, { suppressReservedKeysWarning: true });

export default mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
