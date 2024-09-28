const express = require("express")
require("./config/database")
const { connectDB } = require("./config/database")
const User = require("./model/user")
const app = express()
const PORT = 3971

app.use(express.json())


app.post("/signup", async (req, res) => {

    try {
        const userData = new User(req.body);

        await userData.save();
        res.status(201).json({
            success: true,
            message: "User created successfully!",
            data: userData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
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
