const multer = require("multer");

// Store file in memory (RAM) temporarily
const storage = multer.memoryStorage();

// File filter (Optional: Only accept images)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/webp") {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed!"), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit to 5MB
});

module.exports = upload;