const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")

const User = require("../model/user")
const { validateSignUpData } = require("../validator/signup.validator")
const { sendMail } = require("../utils/mailer")
const { userAuth } = require('../middleware/authmiddleware')
const crypto = require("crypto");



const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
    httpOnly: true,
    secure: false,       // Must be FALSE for HTTP (even in production)
    sameSite: "lax",     // Must be "lax" because "none" requires secure: true
};

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

router.post("/signup", async (req, res) => {
    try {
        validateSignUpData(req);

        const { firstName, lastName, emailId, password, age, gender, photo, skills } = req.body;

        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "Email already exists" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const userData = new User({
            firstName, lastName, emailId, password: passwordHash, age, gender, photo, skills,
        });

        await userData.save();

        const token = generateAccessToken(userData);

        // 🔥 FIX: Use the shared cookieOptions
        res.cookie("token", token, cookieOptions);

        // 📧 Send welcome email (Keep your existing logic)
        try {
            await sendMail({
                to: userData.emailId,
                subject: "Welcome to DevTinder!",
                text: `Hello ${userData.firstName}, Welcome to DevTinder!`,
                html: `<h2>Hello ${userData.firstName},</h2><p>Welcome to <b>DevTinder</b> 🚀</p>`,
            });
        } catch (emailError) {
            console.error("Email failed:", emailError.message);
        }

        const userResponse = userData.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: userResponse,
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;

        const user = await User.findOne({ emailId });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = generateAccessToken(user);

        // 🔥 FIX: Use the SAME shared cookieOptions here too
        res.cookie("token", token, cookieOptions);

        res.json({
            success: true,
            message: "Login successful",
            data: user,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post("/logout", (req, res) => {
    res.cookie("token", "", { expires: new Date(0) })
    res.json({ success: true, message: "Logged out" })
})

router.post("/forgot-password", async (req, res) => {
    try {
        const { emailId } = req.body;

        if (!emailId) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ emailId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 🔐 Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Save token + expiry (15 mins)
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        // 🔗 Reset link
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // 📧 Send email
        await sendMail({
            to: user.emailId,
            subject: "Reset Your Password",
            text: `Click the link to reset your password: ${resetLink}`,
            html: `
                <h2>Password Reset Request</h2>
                <p>Click the button below to reset your password.</p>
                <a href="${resetLink}" 
                   style="padding:10px 20px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:5px;">
                   Reset Password
                </a>
                <p>This link is valid for 15 minutes.</p>
            `,
        });

        res.status(200).json({ message: "Password reset link sent to email" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: "password is required" });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // 🔒 Hash new password
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: "password reset successful" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router
