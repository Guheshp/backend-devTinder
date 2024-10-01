const mongoose = require("mongoose")
const validator = require("validator");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 50
    },
    lastName: {
        type: String
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email address: " + value)
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("Enter Strong Password!")
            }
        }
    },
    age: {
        type: Number
    },
    gender: {
        type: String,
        validate(value) {
            if (!["male", "female", "others"].includes(value)) {
                throw new Error("Gender data not valid!")
            }
        }
    },
    photo: {
        type: String,
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Invalid photo URL: " + value)
            }
        }
    },
    skills: {
        type: [String],
    }
}, { timestamps: true })

userSchema.index({ firstName: 1, lastName: 1 })
userSchema.index({ gender: 1 })

const User = mongoose.model("User", userSchema)

module.exports = User
