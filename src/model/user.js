const mongoose = require("mongoose")
const validator = require("validator")

const userSchema = new mongoose.Schema(
    {
        /* ---------- Basic Info ---------- */
        firstName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50
        },

        lastName: {
            type: String,
            trim: true,
            maxlength: 50
        },

        emailId: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: validator.isEmail,
                message: "Invalid email address"
            }
        },

        password: {
            type: String,
            required: true,
            validate: {
                validator: validator.isStrongPassword,
                message: "Enter a strong password"
            }
        },

        /* ---------- Auth & Security ---------- */
        emailVerified: {
            type: Boolean,
            default: false
        },

        lastLoginAt: {
            type: Date
        },

        loginAttempts: {
            type: Number,
            default: 0
        },

        lockUntil: {
            type: Date
        },

        /* ---------- Profile ---------- */
        age: {
            type: Number,
            min: 18,
            max: 60
        },

        gender: {
            type: String,
            enum: ["male", "female", "others"]
        },

        bio: {
            type: String,
            maxlength: 3000
        },

        experienceLevel: {
            type: String,
            enum: ["fresher", "junior", "mid", "senior"],
            default: "fresher"
        },

        location: {
            state: { type: String, required: false },
            country: { type: String, default: "India" }
        },

        photo: {
            type: String,
            default:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYCZ0qae7TaC6iuCJf6WzgV97HR0rMLm8N5A&s",
            validate: {
                validator: validator.isURL,
                message: "Invalid photo URL"
            }
        },

        /* ---------- Skills ---------- */
        skills: {
            type: [String],
            validate: {
                validator: (value) => value.length <= 25,
                message: "Maximum 25 skills allowed"
            }
        },

        /* ---------- Social Links (Added) ---------- */
        githubUrl: {
            type: String,
            trim: true,
            validate: {
                // Allows empty/null, but if provided, must be a URL
                validator: (value) => !value || validator.isURL(value),
                message: "Invalid GitHub URL"
            }
        },
        linkedinUrl: {
            type: String,
            trim: true,
            validate: {
                validator: (value) => !value || validator.isURL(value),
                message: "Invalid LinkedIn URL"
            }
        },
        twitterUrl: {
            type: String,
            trim: true,
            validate: {
                validator: (value) => !value || validator.isURL(value),
                message: "Invalid Twitter URL"
            }
        },
        portfolioUrl: {
            type: String,
            trim: true,
            validate: {
                validator: (value) => !value || validator.isURL(value),
                message: "Invalid Portfolio URL"
            }
        },

        /* ---------- App Control ---------- */
        profileCompletion: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        isProfileComplete: {
            type: Boolean,
            default: false
        },

        isBlocked: {
            type: Boolean,
            default: false
        },

        /* ---------- Status (Soft Delete) ---------- */
        status: {
            type: Number,
            enum: [1, -1],
            default: 1,
            index: true
        },
        isPremium: {
            type: Boolean,
            default: false
        },
        memberShipType: {
            type: String,
            default: null
        },
    },
    { timestamps: true }
)

/* ---------- Indexes ---------- */
userSchema.index({ firstName: 1, lastName: 1 })
userSchema.index({ gender: 1 })
userSchema.index({ skills: 1 })
userSchema.index({ status: 1 })
userSchema.index({ "location.city": 1 })

/* ---------- Model ---------- */
const User = mongoose.model("User", userSchema)

module.exports = User