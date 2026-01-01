const express = require("express")
const router = express.Router()
const { userAuth } = require("../middleware/authmiddleware")
const ConnectionRequestModel = require("../model/connectionRequest")
const User = require("../model/user")
const mongoose = require("mongoose")

/* =====================================================
   REQUESTS RECEIVED
===================================================== */
router.get("/request/received", userAuth, async (req, res) => {
    try {
        const connectionRequests = await ConnectionRequestModel.find({
            toUserId: req.user._id,
            status: "intrested"
        }).populate("fromUserId", [
            "firstName",
            "lastName",
            "photo",
            "age",
            "gender",
            "skills"
        ])

        res.json({ success: true, data: connectionRequests })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

/* =====================================================
   CONNECTIONS
===================================================== */
router.get("/connections", userAuth, async (req, res) => {
    try {
        const connectionRequests = await ConnectionRequestModel.find({
            status: "accepeted",
            $or: [
                { fromUserId: req.user._id },
                { toUserId: req.user._id }
            ]
        })
            .populate("fromUserId", "firstName lastName photo skills experienceLevel location")
            .populate("toUserId", "firstName lastName photo skills experienceLevel location")

        const data = connectionRequests.map(r =>
            r.fromUserId._id.toString() === req.user._id.toString()
                ? r.toUserId
                : r.fromUserId
        )

        res.json({ success: true, data })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

/* =====================================================
   FEED
===================================================== */
router.get("/feed", userAuth, async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1)
        const limit = Math.min(parseInt(req.query.limit) || 10, 50)
        const skip = (page - 1) * limit

        const loggedInUserId = req.user._id.toString()

        const interactions = await ConnectionRequestModel.find({
            $or: [
                { fromUserId: req.user._id },
                { toUserId: req.user._id }
            ]
        }).select("fromUserId toUserId")

        // ✅ NORMALIZE TO STRING
        const hiddenIds = interactions.flatMap(r => [
            r.fromUserId.toString(),
            r.toUserId.toString()
        ])

        // ✅ ALWAYS ADD SELF ID
        hiddenIds.push(loggedInUserId)

        const users = await User.find({
            _id: { $nin: hiddenIds },
            status: 1,
            isBlocked: false
        })
            .select("firstName lastName age gender experienceLevel bio skills photo location")
            .skip(skip)
            .limit(limit)

        console.log("LOGGED IN USER:", loggedInUserId)
        console.log("HIDDEN IDS:", hiddenIds)
        console.log("FEED USER IDS:", users.map(u => u._id.toString()))

        res.json({ success: true, data: users })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})


/* =====================================================
   SUGGESTED SKILLS  ✅
===================================================== */
router.get("/suggested-skills", userAuth, async (req, res) => {
    try {
        const popularSkills = [
            "react",
            "node_js",
            "mongodb",
            "typescript",
            "docker",
            "aws",
            "system_design"
        ]

        const suggestions = popularSkills.filter(
            skill => !req.user.skills?.includes(skill)
        )

        res.json({ success: true, data: suggestions.slice(0, 5) })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

/* =====================================================
   USER BY ID (LAST)
===================================================== */
router.get("/:id", userAuth, async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user id"
        })
    }

    const user = await User.findById(id).select(
        "firstName lastName photo skills experienceLevel location"
    )

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        })
    }

    res.json({ success: true, data: user })
})

module.exports = router
