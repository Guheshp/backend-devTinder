const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { userAuth } = require("../middleware/authmiddleware");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

router.post("/suggest-courses", userAuth, async (req, res) => {
    try {
        const user = req.user;
        const userSkills = user.skills || [];

        if (userSkills.length === 0) {
            return res.json({
                success: false,
                message: "Please add some skills to your profile first!"
            });
        }

        const skillsText = userSkills.join(", ");

        const prompt = `
            Act as a Senior Technical Career Coach.
            The user knows: ${skillsText}.
            Goal: Become a top-tier Full Stack MERN Developer.

            Analyze the gaps. Return a strict JSON object with three specific arrays.
            
            IMPORTANT: 
            - Return ONLY valid JSON.
            - Do NOT use Trailing Commas.
            - Do NOT use comments // inside JSON.
            - Do NOT use markdown formatting.

            Structure:
            {
               "mustHave": [
                  { 
                    "skill": "Skill Name", 
                    "reason": "Why needed", 
                    "youtube": {
                        "title": "Video Title",
                        "url": "https://www.youtube.com/watch?v=VIDEO_ID"
                    },
                    "udemy": {
                        "title": "Udemy Course Name",
                        "searchQuery": "Search Term"
                    }
                  }
               ],
               "recommended": [
                  { "skill": "Skill Name", "reason": "Why needed" }
               ],
               "goodToKnow": [
                  { "skill": "Skill Name", "reason": "Why needed" }
               ]
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // --- IMPROVED CLEANUP LOGIC ---
        // 1. Remove Markdown code blocks
        text = text.replace(/```json/g, "").replace(/```/g, "");

        // 2. Remove any text outside the first { and last }
        const firstBrace = text.indexOf("{");
        const lastBrace = text.lastIndexOf("}");

        if (firstBrace !== -1 && lastBrace !== -1) {
            text = text.substring(firstBrace, lastBrace + 1);
        }

        // 3. Try to parse
        try {
            const jsonResponse = JSON.parse(text);
            res.json({ success: true, data: jsonResponse });
        } catch (parseError) {
            console.error("JSON Parse Failed. Raw Text from AI:", text);
            throw new Error("AI returned malformed data. Please try again.");
        }

    } catch (err) {
        console.error("AI Error:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to fetch suggestions",
            details: err.message
        });
    }
});

module.exports = router;