const express = require("express")
const router = express.Router()
const { userAuth } = require("../middleware/authmiddleware")
const ConnectionRequestModel = require("../model/connectionRequest")
const User = require("../model/user")
const mongoose = require("mongoose")
const { skillList } = require("../utils/constants")

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
            "skills",
            "experienceLevel",
            "location",
            "bio",
            "githubUrl",
            "linkedinUrl",
            "twitterUrl",
            "portfolioUrl",
            "isPremium",
            "memberShipType",
            "emailId"
        ])

        res.json({ success: true, data: connectionRequests })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

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

router.get("/feed", userAuth, async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);
        const skip = (page - 1) * limit;

        // 1. Find all connection requests (interactions) involving the current user
        const interactions = await ConnectionRequestModel.find({
            $or: [
                { fromUserId: req.user._id },
                { toUserId: req.user._id }
            ]
        }).select("fromUserId toUserId");

        // 2. Use a Set to handle duplicates efficiently
        // We store them as strings temporarily to ensure the Set deduplicates correctly
        const hiddenIdsSet = new Set();

        interactions.forEach((interaction) => {
            hiddenIdsSet.add(interaction.fromUserId.toString());
            hiddenIdsSet.add(interaction.toUserId.toString());
        });

        // Always hide the logged-in user
        hiddenIdsSet.add(req.user._id.toString());

        // 3. Convert the Set of strings back to an array of Mongoose ObjectIds
        const hiddenObjectIds = Array.from(hiddenIdsSet).map(id => new mongoose.Types.ObjectId(id));

        // 4. Find users NOT in the hidden list
        const users = await User.find({
            _id: { $nin: hiddenObjectIds }, // Passing actual ObjectIds
            status: 1,
            isBlocked: false
        })
            // .select(...) // REMOVED: You requested ALL data
            .skip(skip)
            .limit(limit);

        res.json({ success: true, data: users, name: "guhesh" });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.get("/suggested-skills", userAuth, async (req, res) => {
    try {
        // 1. Expanded list of high-value skills for a Full Stack Developer
        const popularSkillIds = [
            // Core Stack
            "react",
            "node_js",
            "express_js",     // Essential for MERN
            "mongodb",
            "postgresql",     // SQL is mandatory for full stack

            // Modern Standards
            "typescript",
            "next_js",        // Industry standard for React
            "redux",          // State management
            "tailwind_css",

            // Backend & DevOps
            "docker",
            "aws",
            "git",
            "ci_cd",

            // Architecture
            "system_design",
            "microservices",
            "graphql"
        ];

        // 2. Get the user's current existing skills safely
        const userSkillIds = req.user.skills || [];
        console.log("User's Current Skills:", userSkillIds);
        // 3. Filter: Find popular IDs that the user does NOT have
        const relevantIds = popularSkillIds.filter(
            id => !userSkillIds.includes(id)
        );

        // 4. Map: Convert the IDs back to full objects from 'skillList'
        // This ensures the frontend gets { id: 'next_js', name: 'Next.js' }
        const suggestions = relevantIds
            .map(id => skillList.find(skill => skill.id === id))
            .filter(Boolean) // Safety check: removes undefined if an ID isn't found
            .slice(0, 5);    // Return top 5 suggestions
        console.log("Suggested Skills:", suggestions);
        res.json({ success: true, data: suggestions });

    } catch (error) {
        console.error("Error in suggested-skills:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get("/:id", userAuth, async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user id"
        })
    }

    const user = await User.findById(id).select(
        "firstName lastName photo skills experienceLevel location bio age gender experienceLevel photo skills githubUrl linkedinUrl twitterUrl portfolioUrl isPremium memberShipType emailId "
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
