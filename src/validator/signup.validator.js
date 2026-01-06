const validator = require("validator")

const validateSignUpData = (req) => {
    const { firstName, lastName, emailId, password, age, gender, photo, skills } = req.body

    if (!firstName) {
    } else if (typeof firstName !== "string") {
        throw new Error("First name is required.");
    } else if (firstName.length < 4) {
        throw new Error("First name must be at least 4 characters long.");
    } else if (firstName.length > 50) {
        throw new Error("First name must be no longer than 50 characters.");
    }

    if (!lastName) {
        if (typeof lastName !== "string") {
            throw new Error("Last name must be a string.");
        }
    }
    if (!emailId) {
        throw new Error("Email ID is required.");
    } else if (!validator.isEmail(emailId)) {
        throw new Error("Invalid email address.");
    }
    if (!password) {
        throw new Error("Password is required.");
    } else if (!validator.isStrongPassword(password)) {
        throw new Error("Password must be strong and contain at least 8 characters, including uppercase, lowercase, numbers, and symbols.");
    }

    if (age !== undefined) {
        if (!Number.isInteger(age)) {
            throw new Error("Age must be a valid number.");
        } else if (age < 0 || age > 120) {
            throw new Error("Age must be between 0 and 120.");
        }
    }

    if (gender) {
        if (!["male", "female", "others"].includes(gender)) {
            throw new Error("Gender must be 'male', 'female', or 'others'.");
        }
    }

    if (photo) {
        if (!validator.isURL(photo)) {
            throw new Error("Invalid photo URL.");
        }
    }

    if (skills) {
        if (!Array.isArray(skills)) {
            throw new Error("Skills must be an array.");
        } else if (!skills.every(skill => typeof skill === "string")) {
            throw new Error("Each skill must be a string.");
        } else if (skills.length > 25) {
            throw new Error("Skill should not exceed 25.");
        }
    }
};

const validateEditProfileData = (req) => {
    const allowedFields = [
        "firstName",
        "lastName",
        "age",
        "gender",
        "photo",
        "bio",
        "experienceLevel",
        "skills",
        "location",
        "githubUrl",
        "linkedinUrl",
        "twitterUrl",
        "portfolioUrl"
    ];

    const requestFields = Object.keys(req.body);

    // 1. Check for unknown fields
    const isFieldsValid = requestFields.every(field =>
        allowedFields.includes(field)
    );

    if (!isFieldsValid) {
        console.error("Invalid fields detected in request:", requestFields.filter(f => !allowedFields.includes(f)));
        return false; // 🛑 FIXED: Now actually returns false if invalid fields are found
    }

    // 2. Validate nested location object if it exists
    if (req.body.location) {
        // Ensure location is an object
        if (typeof req.body.location !== "object") return false;

        // Ensure state and country are strings if provided (not empty checks, just type checks)
        // This allows partial updates if your schema allows it, or strict checks if required.
        // Based on your route logic, you require 'state' and 'country'.
        if (!req.body.location.state || !req.body.location.country) {
            console.error("Location missing state or country");
            return false;
        }
    }

    return true;
};

module.exports = {
    validateSignUpData,
    validateEditProfileData
}