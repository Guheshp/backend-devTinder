const calculateProfileStrength = (user) => {
    let score = 0;

    // --- Core Identity (30%) ---
    if (user.firstName && user.lastName) score += 10;
    // Check if photo exists and is NOT the default placeholder
    if (user.photo && user.photo !== "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYCZ0qae7TaC6iuCJf6WzgV97HR0rMLm8N5A&s") {
        score += 10;
    }

    if (user.emailId) score += 10; // Assuming email presence is enough for now

    // --- Personal Details (20%) ---
    if (user.age) score += 5;
    if (user.gender) score += 5;
    if (user.location?.state || user.location?.country) score += 10;

    // --- Professional Info (30%) ---
    if (user.bio && user.bio.length >= 20) score += 10;
    if (user.experienceLevel) score += 10;
    if (Array.isArray(user.skills) && user.skills.length >= 3) score += 10;

    // --- Social Links (20%) ---
    let socialScore = 0;
    if (user.githubUrl) socialScore += 5;
    if (user.linkedinUrl) socialScore += 5;
    if (user.twitterUrl) socialScore += 5;
    if (user.portfolioUrl) socialScore += 5;

    score += socialScore;

    // Cap score at 100 just in case
    if (score > 100) score = 100;

    return {
        score,
        isComplete: score === 100 // Strict 100% check
    };
};

module.exports = { calculateProfileStrength };