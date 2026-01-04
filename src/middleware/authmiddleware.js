const jwt = require("jsonwebtoken")
const User = require("../model/user")

const userAuth = async (req, res, next) => {

    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({
                message: "Please Login!"
            })
        }
        const decodedMessage = await jwt.verify(token, process.env.JWT_SECRET);
        const { _id } = decodedMessage
        const user = await User.findById(_id)
        if (!user) {
            throw new Error("User not found!")
        }
        req.user = user
        next()

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error" + error.message,
        });
    }
}

module.exports = {
    userAuth
}