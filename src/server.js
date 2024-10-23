const express = require("express")
require("./config/database")
const { connectDB } = require("./config/database")
const app = express()
const PORT = 3971
const cors = require('cors')
const cookieparser = require("cookie-parser")

app.use(
    cors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
        // allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        optionsSuccessStatus: 200
    })
);
app.use(express.json())
app.use(cookieparser())


const authRouter = require("./router/auth.router")
const profileRouter = require("./router/profile.router")
const requestRouter = require("./router/request.router")
const userRouter = require("./router/user.router")

app.use("/", authRouter)
app.use("/", profileRouter)
app.use("/", requestRouter)
app.use("/", userRouter)


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
