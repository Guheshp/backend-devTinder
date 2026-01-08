const express = require("express")
const router = express.Router()
const User = require("../model/user")
const { userAuth } = require("../middleware/authmiddleware")
const { validateEditProfileData } = require("../validator/signup.validator")
const { calculateProfileStrength } = require("../utils/profileStrength")

router.get("/profile/view", userAuth, async (req, res) => {

    const user = req.user;
    if (!user) {
        throw new Error("User not found!")
    }
    res.send(user)

})

router.post("/profile/edit", userAuth, async (req, res) => {
    try {
        // 1. Validate Input
        if (!validateEditProfileData(req)) {
            return res.status(400).json({
                success: false,
                message: "Invalid edit request: Unknown fields or invalid location format"
            });
        }

        const loggedInUser = req.user;

        // 2. Update Simple Fields
        const simpleFields = [
            "firstName",
            "lastName",
            "age",
            "gender",
            "photo",
            "bio",
            "experienceLevel",
            "skills",
            "githubUrl",
            "linkedinUrl",
            "twitterUrl",
            "portfolioUrl"
        ];

        simpleFields.forEach((field) => {
            // Check if the field exists in the request body
            if (req.body[field] !== undefined) {

                // 🛑 FIX: Explicitly handle removal
                // If the user sends an empty string "" or null, we set it to undefined.
                // In Mongoose, setting a field to 'undefined' removes it from the document.
                if (req.body[field] === "" || req.body[field] === null) {
                    loggedInUser[field] = undefined;
                } else {
                    loggedInUser[field] = req.body[field];
                }
            }
        });

        // 3. Handle Photo Removal explicitly (Existing logic, kept safe)
        if (req.body.photo === null || req.body.photo === "") {
            loggedInUser.photo = undefined;
        }

        // 4. Handle Nested Location (Existing logic)
        if (req.body.location) {
            loggedInUser.location = {
                state: req.body.location.state || loggedInUser.location?.state || '',
                country: req.body.location.country || loggedInUser.location?.country || "India"
            };
        }

        // 5. Recalculate Profile Score (THIS NOW USES THE NEW LOGIC)
        const result = calculateProfileStrength(loggedInUser);
        loggedInUser.profileCompletion = result.score;
        loggedInUser.isProfileComplete = result.isComplete;

        // 6. Save and Respond
        await loggedInUser.save();

        const userResponse = loggedInUser.toObject();
        delete userResponse.password;
        delete userResponse.loginAttempts;
        delete userResponse.lockUntil;

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: userResponse
        });

    } catch (error) {
        console.error("Profile edit error:", error);
        res.status(500).json({
            success: false,
            message: "Error while editing profile",
            error: error.message
        });
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