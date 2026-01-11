class TokenBucket {
    constructor(capacity, refillRate) {
        this.capacity = capacity;       // Max tokens allowed in the bucket (Burst limit)
        this.refillRate = refillRate;   // Tokens added per second
        this.lastRefill = Date.now();
        this.tokens = capacity;         // Start with a full bucket
    }

    refill() {
        const now = Date.now();
        // Calculate how many seconds passed since last refill
        const secondsElapsed = (now - this.lastRefill) / 1000;

        // Calculate tokens to add: (Time * Rate)
        const tokensToAdd = secondsElapsed * this.refillRate;

        // Update tokens, but do not exceed capacity
        this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
        this.lastRefill = now;
    }

    tryConsume(amount = 1) {
        this.refill(); // Always refill before checking

        if (this.tokens >= amount) {
            this.tokens -= amount;
            return true; // Request Allowed
        }
        return false; // Request Denied (Not enough tokens)
    }
}

module.exports = TokenBucket;