const express = require("express")
require("./config/database")
const { connectDB } = require("./config/database")
const User = require("./model/user")
const app = express()
const PORT = 3971


app.post("/signup", async (req, res) => {

    try {


        const userData = new User({
            firstName: "John",
            lastName: "Doe",
            emailId: "john.doe@example.com",
            password: "securePassword123",
            age: "28",
            gender: "male"
        });

        await userData.save();
        res.status(201).json({
            success: true,
            message: "User created successfully!"
        });
    } catch (error) {
        console.error(error); // Log the error
        res.status(500).json({ // Send a response back on error
            success: false,
            message: "Internal server error"
        });
    }
});


connectDB()
    .then(() => {
        console.log("Database Connection Established Successfully!")
        app.listen(PORT, () => {
            console.log(`Server Started at 🚀 http://localhost:${PORT} `)
        })
    })
    .catch(() => {
        console.log("Database Error, While Connecting!")
    })
