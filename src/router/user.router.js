const express = require("express")
const { userAuth } = require("../middleware/authmiddleware")
const router = express.Router()
const ConnectionRequestModel = require("../model/connectionRequest")
const User = require("../model/user")

router.get("/user/request/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user

        const connectionRequest = await ConnectionRequestModel.find({
            toUserId: loggedInUser._id,
            status: "intrested"
        }).populate("fromUserId", ["firstName", "lastName"])

        res.status(200).json({
            message: "Data fetched successfully!",
            message: connectionRequest
        })


    } catch (error) {
        res.status(400).json({
            success: false,
            message: "ERROR " + error.message
        })
    }
})

router.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user
        const connectionRequest = await ConnectionRequestModel.find({
            $or: [
                { toUserId: loggedInUser._id, status: "accepeted" },
                { fromUserId: loggedInUser._id, status: "accepeted" }
            ]
        })
            .populate("fromUserId", ["firstName", "lastName", "photoUrl", "age", "gender", "skills"])
            .populate("toUserId", ["firstName", "lastName", "photoUrl", "age", "gender", "skills"])


        const data = connectionRequest.map((row) => {
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId;
            }
            return row.fromUserId
        })

        res.status(200).json({
            message: "Data fetched successfully!",
            message: data
        })


    } catch (error) {
        res.status(400).json({
            success: false,
            message: "ERROR " + error.message
        })
    }
})

router.get('/page/feed', userAuth, async (req, res) => {

    // console.log(ConnectionRequestModel)
    try {
        const loggedInUser = req.user

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit

        const skip = (page - 1) * limit

        if (!loggedInUser) {
            return res.status(401).json({ message: 'Unauthorized: User not found in request' });
        }

        const connectionRequest = await ConnectionRequestModel.find({
            $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }]
        }).select("fromUserId toUserId");

        const hideUserFromFeed = new Set();
        connectionRequest.forEach(req => {
            hideUserFromFeed.add(req.fromUserId.toString());
            hideUserFromFeed.add(req.toUserId.toString());
        });

        // console.log("Connection Requests:", connectionRequest);
        // console.log("Users to hide from feed:", Array.from(hideUserFromFeed));
        const users = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUserFromFeed) } },
                { _id: { $ne: loggedInUser._id } },
            ]
        }).select(["firstName", "lastName", "photoUrl", "age", "gender", "skills"])
            .skip(skip)
            .limit(limit)

        // console.log("Users fetched from DB:", users);

        res.status(200).json({
            data: users
        });
    } catch (error) {
        res.status(400).json({
            message: "ERROR " + error.message
        })
    }
})

module.exports = router