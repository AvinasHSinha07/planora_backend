import { GoogleGenerativeAI } from "@google/generative-ai";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

const getEventRecommendations = async (userPreferences: string) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Based on the following user preferences: "${userPreferences}", recommend 3 types of event categories and a brief theme for each. Format as JSON.`;
        
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        return { recommendations: responseText };
    } catch (error) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, "AI recommendation engine failed");
    }
};

export const AiService = {
    getEventRecommendations
};
