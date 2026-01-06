// src/find-models.js
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ No API Key found in .env file!");
    process.exit(1);
}

console.log("🔍 Querying Google API for available models...");

// We use native fetch to bypass SDK version issues
async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("\n❌ API Error:", data.error.message);
            console.log("👉 This usually means the API Key is invalid or the 'Generative Language API' is not enabled in Google Cloud Console.");
            return;
        }

        console.log("\n✅ SUCCESS! Here are the models your key can access:\n");

        // Filter for models that support "generateContent"
        const contentModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));

        contentModels.forEach(model => {
            console.log(`Model Name: ${model.name}`); // This is the EXACT string you need to copy
            console.log(`Description: ${model.displayName}`);
            console.log("------------------------------------------------");
        });

        if (contentModels.length === 0) {
            console.log("⚠️ No content generation models found. You might only have access to embedding models.");
        }

    } catch (error) {
        console.error("Network Error:", error.message);
    }
}

listModels();