const calculateProfileStrength = (user) => {
    let score = 0
    const missing = []

    if (user.firstName && user.lastName) score += 10
    else missing.push("Name")

    if (user.age) score += 10
    else missing.push("Age")

    if (user.gender) score += 10
    else missing.push("Gender")

    if (user.photo) score += 15
    else missing.push("Photo")

    if (user.bio && user.bio.length >= 20) score += 15
    else missing.push("Bio")

    if (Array.isArray(user.skills) && user.skills.length >= 3) score += 20
    else missing.push("Skills")

    if (user.location?.state) score += 10
    else missing.push("Location")

    if (user.experienceLevel) score += 10
    else missing.push("Experience Level")

    return {
        score,
        isComplete: score >= 80,
        missing
    }
}

module.exports = calculateProfileStrength
