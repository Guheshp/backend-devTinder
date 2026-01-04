const express = require("express")
require("./config/database")
const { connectDB } = require("./config/database")
const app = express()
const PORT = 7777
const cors = require('cors')
const cookieparser = require("cookie-parser")
const http = require('http')
require('dotenv').config()
const { initializeSocket } = require("./utils/socket")
const morgan = require('morgan')


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

app.use(morgan('dev'))

app.get("/testing", (req, res) => {
    res.send("Server is running...")
})

const authRouter = require("./router/auth.router")
const profileRouter = require("./router/profile.router")
const requestRouter = require("./router/request.router")
const userRouter = require("./router/user.router")
const chatRouter = require("./router/chat.router")
const paymentRouter = require("./router/payment")

app.use("/", authRouter)
app.use("/", profileRouter)
app.use("/", requestRouter)
app.use("/user", userRouter)
app.use("/", chatRouter)
app.use("/payment", paymentRouter)

const server = http.createServer(app)
initializeSocket(server)

connectDB()
    .then(() => {
        console.log("Database Connection Established Successfully!")
        server.listen(PORT, () => {
            console.log(`Server Started at 🚀 http://localhost:${PORT} `)
        })
    })
    .catch(() => {
        console.log("Database Error, While Connecting!")
    })
