const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function testAI() {
    try {
        console.log("1. Initializing AI...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Let's try to list models using the SDK to see what we have
        // (Note: Not all SDK versions expose listModels, so we wrap in try/catch)
        try {
            console.log("2. Checking available models...");
            // This is a common way to test connectivity
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("Test connection");
            console.log("✅ SUCCESS! Response:", result.response.text());
            return;
        } catch (e) {
            console.warn("⚠️ gemini-1.5-flash failed. Error:", e.message);
        }

        // FALLBACK: Try the older reliable model if flash fails
        console.log("3. Trying fallback model (gemini-pro)...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Test connection");
        console.log("✅ SUCCESS with Fallback! Response:", result.response.text());

    } catch (error) {
        console.error("❌ FATAL ERROR:", error.message);
        console.log("\n--- TROUBLESHOOTING ---");
        console.log("1. Run: npm list @google/generative-ai");
        console.log("   (It must be 0.12.0 or higher)");
        console.log("2. Create a new API Key at https://aistudio.google.com/");
    }
}

testAI();