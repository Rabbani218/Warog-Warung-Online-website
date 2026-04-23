import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
    console.error("API Key missing");
    process.exit(1);
}

console.log("Testing with API Key:", apiKey.substring(0, 5) + "...");

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function test() {
    try {
        const result = await model.generateContent("Halo, siapa kamu?");
        console.log("Reply:", result.response.text());
    } catch (error) {
        console.error("Error:", error.message);
    }
}

test();
