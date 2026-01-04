const mongoose = require("mongoose");
const connectDB = async () => {
    const connectionString = process.env.NODE_ENV === 'production'
        ? process.env.DB_CONNECTION_STRING_PROD
        : process.env.DB_CONNECTION_STRING_DEV;

    console.log("🔗 MongoDB Connection String:", connectionString);
    console.log("process.env.NODE_ENV ", process.env.NODE_ENV);
    await mongoose.connect(connectionString);
};


module.exports = { connectDB };