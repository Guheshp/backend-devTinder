const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../model/user")
const { validateSignUpData } = require("../validator/signup.validator")

router.post("/signup", async (req, res) => {

    try {
        validateSignUpData(req)
        const { firstName,
            lastName,
            emailId, password, age,
            gender,
            photo,
            skills } = req.body

        const passwordHash = await bcrypt.hash(password, 10);
        console.log(passwordHash)

        const userData = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
            age,
            gender,
            photo,
            skills
        });
        await userData.save();
        res.status(201).json({
            success: true,
            message: "User created successfully!",
            data: userData
        });
    } catch (error) {
        // console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

const generateAccessToken = async (user) => {
    const payload = {
        _id: user._id,
        firstname: user.firstName,
        lastname: user.lastName,
        email: user.emailId,
    };
    // console.log("playload", payload)
    const token = jwt.sign(payload, "BNIVoltas@215", { expiresIn: "1d" });
    return token;
}

router.post("/login", async (req, res) => {
    const { emailId, password } = req.body;
    // console.log("called")
    try {
        const user = await User.findOne({ emailId: emailId })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: `Invalid credentials!`
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {

            const token = await generateAccessToken(user)
            res.cookie("token", token, { httpOnly: true })

            res.status(200).json({
                success: true,
                message: "Login successfully!",
                token: token
            })
        } else {
            throw new Error("Invalid credentials!")
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error" + error.message,
        });
    }
})

router.post("/logout", async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now())
    });
    res.send("logout suuccessfull!")
})

module.exports = router