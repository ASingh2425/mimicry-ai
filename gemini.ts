import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { AnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to check for API key
export const hasApiKey = () => !!apiKey;

/**
 * Analyzes the provided text samples to extract style, tone, and format.
 * Returns a structured object with a system instruction and quantitative metrics.
 */
export const analyzeStyle = async (samples: string[]): Promise<AnalysisResult> => {
  if (!apiKey) throw new Error("API Key not found");

  const combinedText = samples.join("\n\n---\n\n");
  
  const prompt = `
    You are an expert literary stylometric analyst and LLM fine-tuning engineer.
    Analyze the following text samples provided by a user. 
    Your goal is to create a "Style Profile" that can be used to instruct an LLM to write exactly like this author.
    
    1. Extract a precise 'systemInstruction' that captures the voice, tone, sentence structure, vocabulary complexity, common formatting quirks, and perspective. Be extremely specific.
    2. Rate the writing style on 5 metrics (0-100): 
       - Creativity (novelty of ideas/metaphors)
       - Technicality (jargon, structural rigidity)
       - Conciseness (economy of words)
       - Vocabulary (complexity/rarity of words)
       - Emotion (expressiveness/subjectivity)
    3. Provide a 1-sentence summary of the style.

    Samples:
    ${combinedText.substring(0, 30000)} // Limit context if very large
  `;

  // We ask for JSON response
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            systemInstruction: { type: Type.STRING, description: "The system instruction prompt to replicate the style." },
            summary: { type: Type.STRING, description: "A one sentence summary of the author's voice." },
            metrics: {
              type: Type.OBJECT,
              properties: {
                creativity: { type: Type.NUMBER },
                technicality: { type: Type.NUMBER },
                conciseness: { type: Type.NUMBER },
                vocabulary: { type: Type.NUMBER },
                emotion: { type: Type.NUMBER },
              },
              required: ["creativity", "technicality", "conciseness", "vocabulary", "emotion"]
            }
          },
          required: ["systemInstruction", "metrics", "summary"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from model");
    
    return JSON.parse(jsonText) as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

/**
 * Generates content using the "fine-tuned" system instruction.
 */
export const generateInStyle = async (
  prompt: string, 
  systemInstruction: string,
  history: { role: string, parts: { text: string }[] }[]
): Promise<string> => {
  if (!apiKey) throw new Error("API Key not found");

  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: history,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.8, // Slightly creative to allow style expression
    }
  });

  const response = await chat.sendMessage({ message: prompt });
  return response.text || "";
};