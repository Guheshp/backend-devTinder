const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")

const User = require("../model/user")
const { validateSignUpData } = require("../validator/signup.validator")
const { sendMail } = require("../utils/mailer")
const { userAuth } = require('../middleware/authmiddleware')

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
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,     // REQUIRED for HTTPS (Vercel + Render)
            sameSite: "none", // REQUIRED for cross-origin cookies
        });


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

router.post("/logout", (req, res) => {
    res.cookie("token", "", { expires: new Date(0) })
    res.json({ success: true, message: "Logged out" })
})


function generateAccessToken(user) {
    return jwt.sign(
        {
            _id: user._id,
            email: user.emailId
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )
}

module.exports = router
