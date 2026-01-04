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



app.use((req, res, next) => {
    console.log("---- INCOMING REQUEST ----");
    console.log("Method:", req.method);
    console.log("Origin:", req.headers.origin);
    console.log("URL:", req.originalUrl);
    next();
});



// 2. CHANGE: Update CORS for Production

app.use(
    cors({
        origin: (origin, callback) => {
            // allow Postman / mobile apps
            if (!origin) return callback(null, true);

            // allow local dev
            if (
                origin === "http://localhost:3000" ||
                origin === "http://localhost:7777"
            ) {
                return callback(null, true);
            }

            // allow production vercel domain
            if (origin === "https://client-dev-tinder-sekh.vercel.app") {
                return callback(null, true);
            }

            // allow ALL vercel preview deployments
            if (/^https:\/\/client-dev-tinder-sekh-.*\.vercel\.app$/.test(origin)) {
                return callback(null, true);
            }

            return callback(null, false);
        },
        credentials: true,
    })
);


app.use((req, res, next) => {
    res.on("finish", () => {
        console.log("---- RESPONSE HEADERS ----");
        console.log("Access-Control-Allow-Origin:", res.getHeader("Access-Control-Allow-Origin"));
        console.log("Access-Control-Allow-Credentials:", res.getHeader("Access-Control-Allow-Credentials"));
    });
    next();
});

app.options("*", (req, res) => {
    console.log("🟡 OPTIONS PREFLIGHT HIT");
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    return res.sendStatus(204);
});



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
