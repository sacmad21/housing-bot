require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "your_cosmos_db_connection_string";

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("✅ MongoDB Connected Successfully!");
    process.exit();
})
.catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
});
