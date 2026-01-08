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
        // 1. Define all the fields you want to fetch (Space separated string)
        const USER_SAFE_DATA = "firstName lastName photo age gender bio skills experienceLevel location githubUrl linkedinUrl twitterUrl portfolioUrl isPremium memberShipType emailId";

        const connectionRequests = await ConnectionRequestModel.find({
            status: "accepeted", // Make sure this matches your DB value (check for typos like 'accepted' vs 'accepeted')
            $or: [
                { fromUserId: req.user._id },
                { toUserId: req.user._id }
            ]
        })
            .populate("fromUserId", USER_SAFE_DATA)
            .populate("toUserId", USER_SAFE_DATA);

        const data = connectionRequests.map(r =>
            r.fromUserId._id.toString() === req.user._id.toString()
                ? r.toUserId
                : r.fromUserId
        );

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post("/feed", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        // 1. Pagination Logic (From Body)
        // Default to Page 1, Limit 10 if not provided
        const page = Math.max(parseInt(req.body.page) || 1, 1);
        const limit = Math.min(parseInt(req.body.limit) || 10, 50);
        const skip = (page - 1) * limit;

        // 2. Find all connection requests (interactions) involving the current user
        // We do this to HIDE anyone you have already liked/rejected/matched with
        const interactions = await ConnectionRequestModel.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }
            ]
        }).select("fromUserId toUserId");

        // 3. Create a Set of IDs to hide
        const hiddenIdsSet = new Set();

        interactions.forEach((interaction) => {
            hiddenIdsSet.add(interaction.fromUserId.toString());
            hiddenIdsSet.add(interaction.toUserId.toString());
        });

        // Always hide the logged-in user themselves
        hiddenIdsSet.add(loggedInUser._id.toString());

        // 4. Convert Set back to Mongoose ObjectIds for the query
        const hiddenObjectIds = Array.from(hiddenIdsSet).map(id => new mongoose.Types.ObjectId(id));

        // 5. Define Safe Data Fields (Optional but recommended)
        const USER_SAFE_DATA = "firstName lastName photo age gender bio skills experienceLevel location githubUrl linkedinUrl twitterUrl portfolioUrl isPremium memberShipType emailId";

        // 6. The Main Query
        const users = await User.find({
            _id: { $nin: hiddenObjectIds }, // Exclude hidden IDs
            status: 1,                      // Only active users
            isBlocked: false                // No blocked users
        })
            .select(USER_SAFE_DATA)             // Only return safe fields
            .sort({ isProfileComplete: -1, _id: 1 }) // SORT: Complete profiles first (-1), then by ID (1)
            .skip(skip)
            .limit(limit);

        // 7. Send Response
        res.json({
            success: true,
            data: users
        });

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

router.post("/search", userAuth, async (req, res) => {
    try {
        const { query } = req.body;
        const loggedInUserId = req.user._id;

        // 1. Validation: Ensure query exists
        if (!query || typeof query !== "string" || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid search query"
            });
        }

        const searchText = query.trim();

        // 2. Define the Search Filter
        // Use $or to find a match in ANY of these fields
        const searchCriteria = {
            $or: [
                // 'i' option makes it case-insensitive (matches 'React', 'react', 'REACT')
                { firstName: { $regex: searchText, $options: "i" } },
                { lastName: { $regex: searchText, $options: "i" } },
                { skills: { $regex: searchText, $options: "i" } } // Automatically searches inside the array
            ],
            // 3. Exclusions
            _id: { $ne: loggedInUserId }, // Don't show myself
            status: 1,                    // Only active accounts
            isBlocked: false              // No blocked users
        };

        // 4. Safe Data Projection (Hide passwords/emails)
        const USER_SAFE_DATA = "firstName lastName photo age gender bio skills experienceLevel location githubUrl linkedinUrl twitterUrl portfolioUrl isPremium memberShipType emailId";

        // 5. Execute Query
        // Limit to 20 results to keep it fast
        const results = await User.find(searchCriteria)
            .select(USER_SAFE_DATA)
            .limit(10);

        res.json({
            success: true,
            count: results.length,
            data: results
        });

    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({
            success: false,
            message: "Error processing search request"
        });
    }
});

module.exports = router
