const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            dbName: "finance_advisor_ai",
        });
        // console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`mongodb connected`);
    } catch (error) {
        console.error(`mongoDB error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
