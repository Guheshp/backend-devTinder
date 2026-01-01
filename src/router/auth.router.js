const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")

const User = require("../model/user")
const { validateSignUpData } = require("../validator/signup.validator")
const { sendMail } = require("../utils/mailer")
const { userAuth } = require('../middleware/authmiddleware')

/* =====================================================
   SIGNUP
===================================================== */
router.post("/signup", async (req, res) => {
    try {
        validateSignUpData(req)

        const {
            firstName,
            lastName,
            emailId,
            password,
            age,
            gender,
            photo,
            skills
        } = req.body

        // ✅ EMAIL EXISTS CHECK
        const existingUser = await User.findOne({ emailId })
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            })
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const userData = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
            age,
            gender,
            photo,
            skills
        })

        await userData.save()

        const token = generateAccessToken(userData)
        res.cookie("token", token, { httpOnly: true })

        // optional email
        await sendMail({
            to: userData.emailId,
            subject: "Welcome to DevTinder!",
            html: `<h2>Hello ${userData.firstName}</h2><p>Welcome to DevTinder 🚀</p>`
        })

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: userData
        })

    } catch (error) {
        console.error("Signup error:", error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

/* =====================================================
   LOGIN
===================================================== */
router.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body

        const user = await User.findOne({ emailId })
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            })
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            })
        }

        const token = generateAccessToken(user)
        res.cookie("token", token, { httpOnly: true })

        res.json({
            success: true,
            message: "Login successful",
            data: user
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

/* =====================================================
   LOGOUT
===================================================== */
router.post("/logout", (req, res) => {
    res.cookie("token", "", { expires: new Date(0) })
    res.json({ success: true, message: "Logged out" })
})

// /* =====================================================
//    ⚠️ USER BY ID — MUST BE LAST & VALIDATED
// ===================================================== */
// router.get("/user/:id", userAuth, async (req, res) => {
//     try {
//         const { id } = req.params

//         // ✅ CRITICAL FIX
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid user id"
//             })
//         }

//         const user = await User.findById(id)
//             .select("firstName lastName photo")

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             })
//         }

//         res.json({
//             success: true,
//             data: user
//         })

//     } catch (error) {
//         console.error("Fetch user error:", error)
//         res.status(500).json({
//             success: false,
//             message: "Server error"
//         })
//     }
// })

/* =====================================================
   JWT HELPER
===================================================== */
function generateAccessToken(user) {
    return jwt.sign(
        {
            _id: user._id,
            email: user.emailId
        },
        "BNIVoltas@215",
        { expiresIn: "1d" }
    )
}

module.exports = router
