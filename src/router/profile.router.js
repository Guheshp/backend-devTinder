const express = require("express")
const router = express.Router()
const User = require("../model/user")
const { userAuth } = require("../middleware/authmiddleware")
const { validateEditProfileData } = require("../validator/signup.validator")


router.get("/profile/view", userAuth, async (req, res) => {

    const user = req.user;
    if (!user) {
        throw new Error("User not found!")
    }
    res.send(user)

})

router.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        if (!validateEditProfileData(req)) {
            throw new Error("Invalid edit request ")
        }
        const loggedInUser = req.user;

        Object.keys(req.body).forEach((key) => loggedInUser[key] = req.body[key])
        await loggedInUser.save();

        res.status(200).json({
            success: true,
            message: "edited successfully!",
            data: loggedInUser
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "error while editing user",
            error: "ERROR:" + error.message
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