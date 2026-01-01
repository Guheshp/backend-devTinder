const express = require("express")
const router = express.Router()
const User = require("../model/user")
const { userAuth } = require("../middleware/authmiddleware")
const { validateEditProfileData } = require("../validator/signup.validator")
const calculateProfileStrength = require("../utils/profileStrength")


router.get("/profile/view", userAuth, async (req, res) => {

    const user = req.user;
    if (!user) {
        throw new Error("User not found!")
    }
    res.send(user)

})

router.post("/profile/edit", userAuth, async (req, res) => {
    try {
        if (!validateEditProfileData(req)) {
            return res.status(400).json({
                success: false,
                message: "Invalid edit request"
            })
        }

        const loggedInUser = req.user

        /* ---------- Simple fields ---------- */
        const simpleFields = [
            "firstName",
            "lastName",
            "age",
            "gender",
            "photo",
            "bio",
            "experienceLevel",
            "skills"
        ]

        simpleFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                loggedInUser[field] = req.body[field]
            }
        })

        loggedInUser.location = {
            state: req.body.location.state,
            country: req.body.location.country || "India"
        }

        // ✅ HANDLE PHOTO REMOVAL
        if (req.body.photo === null) {
            loggedInUser.photo = undefined // resets to default avatar
        }

        /* ---------- NESTED location (IMPORTANT FIX) ---------- */
        if (req.body.location) {
            loggedInUser.location = {
                state: req.body.location.state || loggedInUser.location?.state || '',
                country: req.body.location.country || 'India'
            }
        }

        const result = calculateProfileStrength(loggedInUser)

        loggedInUser.profileCompletion = result.score
        loggedInUser.isProfileComplete = result.isComplete

        await loggedInUser.save()

        const userResponse = loggedInUser.toObject()
        delete userResponse.password
        delete userResponse.loginAttempts
        delete userResponse.lockUntil

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: userResponse
        })
    } catch (error) {
        console.error("Profile edit error:", error)
        res.status(500).json({
            success: false,
            message: "Error while editing profile",
            error: error.message
        })
    }
})

router.get("/getbyemailId", async (req, res) => {
    const userEmail = req.body.emailId

    if (!userEmail) {
        res.status(400).json({
            success: false,
            message: `${userEmail} not found`
        })
    }

    try {
        const userData = await User.find({ emailId: userEmail })

        if (userData.length === 0) {
            res.status(400).json({
                success: false,
                message: "data not found"
            })
        }

        res.status(200).json({
            success: true,
            message: `Data fetched successfully!`,
            data: userData
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            message: `error while fetching data!`,
            error: error.message
        })
    }
})

router.get("/feed", async (req, res) => {
    try {
        const allUsers = await User.find()

        res.status(200).json({
            success: true,
            message: `allUsers Data fetched successfully!`,
            data: allUsers
        })

    } catch (error) {

        res.status(400).json({
            success: false,
            message: `error while fetching data!`,
            error: error.message
        })
    }
})

router.delete("/deleteuser", async (req, res) => {
    const userId = req.body.userId
    try {
        const users = await User.findByIdAndDelete(userId)
        res.status(200).json({
            success: true,
            message: `Data deleted successfully!`,
            data: users
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: `error while deleteing data!`,
            error: error.message
        })
    }
})





module.exports = router