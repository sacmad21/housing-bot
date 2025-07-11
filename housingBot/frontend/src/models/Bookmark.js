import mongoose from "mongoose";

const BookmarkSchema = new mongoose.Schema(
    {
        username: { type: String, required: true },
        session_id: { type: String, required: true },
        message: { type: String, required: true },
        collection_name: { type: String, required: true }
    },
    { timestamps: true }
);

export default mongoose.models.Bookmark || mongoose.model("Bookmark", BookmarkSchema);
