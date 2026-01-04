const express = require("express")
require("./config/database")
const { connectDB } = require("./config/database")
const app = express()
const PORT = process.env.PORT || 7777
const cors = require('cors')
const cookieparser = require("cookie-parser")
const http = require('http')
require('dotenv').config()
const { initializeSocket } = require("./utils/socket")
const morgan = require('morgan')


// 2. CHANGE: Update CORS for Production
const allowedOrigins = [
    "http://localhost:7777",
    "http://localhost:3000",
    "https://client-dev-tinder-sekh.vercel.app",
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow Postman / mobile apps / server-to-server
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            // IMPORTANT: do NOT throw error
            return callback(null, false);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
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
        // 3. CHANGE: Listen on 0.0.0.0 is often safer for cloud containers
        server.listen(PORT, "0.0.0.0", () => {
            console.log(`Server Started at port ${PORT}`)
        })
    })
    .catch(() => {
        console.log("Database Error, While Connecting!")
    })
