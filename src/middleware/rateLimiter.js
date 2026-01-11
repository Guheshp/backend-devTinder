const TokenBucket = require("../utils/TokenBucket");

// Store buckets in memory: Map<UserId, TokenBucket>
const buckets = new Map();

/**
 * @param {number} capacity - Max burst size (e.g., 10 requests at once)
 * @param {number} refillRate - Tokens per second (e.g., 0.1 = 1 token every 10 seconds)
 */
const tokenBucketLimiter = (capacity, refillRate) => {
    return (req, res, next) => {
        // Identify the user: Use User ID if logged in, otherwise IP address
        const key = req.user ? req.user._id.toString() : req.ip;

        // If user doesn't have a bucket, give them one
        if (!buckets.has(key)) {
            buckets.set(key, new TokenBucket(capacity, refillRate));
        }

        const userBucket = buckets.get(key);

        if (userBucket.tryConsume(1)) {
            // ✅ Success: Token taken, proceed
            next();
        } else {
            // ❌ Fail: Bucket empty
            res.status(429).json({
                success: false,
                message: "Rate limit exceeded. Please wait a moment before trying again."
            });
        }
    };
};

module.exports = { tokenBucketLimiter };