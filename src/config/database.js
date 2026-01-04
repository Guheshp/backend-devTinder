const mongoose = require("mongoose");

const connectDB = async () => {
    // This reads the variable you set in step 1
    const connectionString = process.env.DB_CONNECTION_STRING;

    await mongoose.connect(connectionString);
};

module.exports = { connectDB };