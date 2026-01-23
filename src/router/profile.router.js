const express = require("express")
const router = express.Router()
const User = require("../model/user")
const { userAuth } = require("../middleware/authmiddleware")
const { validateEditProfileData } = require("../validator/signup.validator")
const { calculateProfileStrength } = require("../utils/profileStrength")
const { uploadToS3 } = require("../utils/s3")
const upload = require("../middleware/upload")

router.get("/profile/view", userAuth, async (req, res) => {

    const user = req.user;
    if (!user) {
        throw new Error("User not found!")
    }
    res.send(user)

})

router.post("/profile/edit", userAuth, upload.single("photo"), async (req, res) => {
    try {

        if (req.body.skills && typeof req.body.skills === 'string') {
            try {
                req.body.skills = JSON.parse(req.body.skills);
            } catch (e) {
                console.error("Skills parse error:", e);
                // Fallback: If it's a simple string like "java", wrap it
                req.body.skills = [req.body.skills];
            }
        }

        if (req.body.location && typeof req.body.location === 'string') {
            try {
                req.body.location = JSON.parse(req.body.location);
            } catch (e) {
                console.error("Location parse error:", e);
                return res.status(400).json({ success: false, message: "Invalid location format" });
            }
        }

        if (!validateEditProfileData(req)) {
            return res.status(400).json({
                success: false,
                message: "Invalid edit request: Unknown fields or invalid location format"
            });
        }

        const loggedInUser = req.user;

        if (req.file) {
            const photoUrl = await uploadToS3(req.file);
            loggedInUser.photo = photoUrl;
        } else if (req.body.photo === "null" || req.body.photo === "") {
            loggedInUser.photo = undefined;
        }

        // Update fields loop...
        const simpleFields = ["firstName", "lastName", "age", "gender", "bio", "experienceLevel", "skills", "githubUrl", "linkedinUrl", "twitterUrl", "portfolioUrl"];

        simpleFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                if (req.body[field] === "" || req.body[field] === "null") {
                    loggedInUser[field] = undefined;
                } else {
                    loggedInUser[field] = req.body[field];
                }
            }
        });

        if (req.body.location) {
            loggedInUser.location = {
                state: req.body.location.state || loggedInUser.location?.state || '',
                country: req.body.location.country || loggedInUser.location?.country || "India"
            };
        }

        const result = calculateProfileStrength(loggedInUser);
        loggedInUser.profileCompletion = result.score;
        loggedInUser.isProfileComplete = result.isComplete;

        await loggedInUser.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: loggedInUser
        });

    } catch (error) {
        console.error("Profile edit error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

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

router.get("/dummyfeed", userAuth, async (req, res) => {
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