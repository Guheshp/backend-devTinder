const express = require("express")
const router = express.Router()
const ConnectionRequestModel = require("../model/connectionRequest")
const User = require("../model/user")

const { userAuth } = require("../middleware/authmiddleware")


router.post(
    "/request/send/:status/:toUserId",
    userAuth,
    async (req, res) => {

        try {
            const fromUserId = req.user._id;
            const toUserId = req.params.toUserId;
            const status = req.params.status;

            const allowedStatus = ["ignored", "intrested"]
            if (!allowedStatus.includes(status)) {
                return res.status(400).json({
                    message: "Invalid status type" + status

                })
            }

            const toUser = await User.findById(toUserId);
            if (!toUser) {
                return res.status(400).json({
                    message: "User Not found!"
                })
            }

            const existingConnectionRequest = await ConnectionRequestModel.findOne({
                $or: [
                    { fromUserId, toUserId },
                    { fromUserId: toUserId, toUserId: fromUserId }
                ]
            })
            if (existingConnectionRequest) {
                return res.status(400).json({
                    message: "Connection Request already Exist!"
                })
            }

            const connectionRequest = new ConnectionRequestModel({
                fromUserId, toUserId, status
            })

            const data = await connectionRequest.save();

            res.json({
                success: req.user.firstName + " is " + status + " in " + toUser.firstName,
                data: data
            })
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "ERROR " + error.message
            })
        }
    }
)

router.post(
    "/request/review/:status/:requestId",
    userAuth,
    async (req, res) => {
        try {
            const loggedInUser = req.user
            const { status, requestId } = req.params;

            const allowedstatus = ["accepeted", "rejected"]
            if (!allowedstatus.includes(status)) {
                return res.status(400).json({
                    message: "Status not allowed!"
                })
            }

            const connectionRequest = await ConnectionRequestModel.findOne({
                _id: requestId,
                toUserId: loggedInUser._id,
                status: "intrested"
            })

            if (!connectionRequest) {
                return res.status(400).json({
                    message: "Connection request not found!"
                })
            }

            connectionRequest.status = status;
            const data = await connectionRequest.save()
            res.json({
                message: "Connection Request" + status, data
            })


        } catch (error) {
            res.status(400).json({
                success: false,
                message: "ERROR" + error.message
            })
        }
    }
)


module.exports = router