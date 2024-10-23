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
        } else if (skills.length > 10) {
            throw new Error("Skill should not exceed 10.");
        }
    }
};

const validateEditProfileData = (req) => {
    const ALLOWED_UPDATES = ["firstName", "lastName", "age", "gender", "skills", "photo"]

    const isEditAllowedData = Object.keys(req.body).every((field) => ALLOWED_UPDATES.includes(field))

    return isEditAllowedData;
}

module.exports = {
    validateSignUpData,
    validateEditProfileData
}