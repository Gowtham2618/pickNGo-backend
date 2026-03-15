const mongoose = require('mongoose');

try {
    const dbString = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0cjyg.mongodb.net/UzhavarMart`;
    console.log("🚀 ~ MongoDB Connection String:", dbString);

    mongoose.set("debug", true);

    mongoose.connect(dbString); // No need for deprecated options

    mongoose.connection.on("connected", () => {
        console.log("[ ✓ ] Successfully connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
        console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
        console.warn("⚠️ MongoDB connection disconnected");
    });

    process.on("SIGINT", async () => {
        await mongoose.connection.close();
        console.log("🔴 MongoDB connection closed due to application termination");
        process.exit(0);
    });

} catch (error) {
    console.error("🚨 Error in MongoDB connection setup:", error);
}
