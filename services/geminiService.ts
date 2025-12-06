import { GoogleGenAI } from "@google/genai";
import { Session } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateFocusInsight = async (sessions: Session[]): Promise<string> => {
  const ai = getClient();
  if (!ai) return "To enable AI insights, please configure your API Key.";

  // Filter for recent sessions to keep payload small and relevant
  const recentSessions = sessions.slice(0, 20).map(s => ({
    date: new Date(s.date).toLocaleDateString(),
    duration: s.durationMinutes,
    type: s.type,
    note: s.note
  }));

  const prompt = `
    Analyze these recent productivity sessions:
    ${JSON.stringify(recentSessions)}

    Provide a very brief, minimalist, "whisper-style" insight or encouragement (max 2 sentences). 
    Focus on patterns or general encouragement. 
    Tone: Calm, professional, Zen.
    Do not use emojis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Stay present. Your focus is building.";
  }
};