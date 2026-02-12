
import { GoogleGenAI, Type } from "@google/genai";
import { TacticalAdvice, WeatherData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFishingAdvice = async (
  weather: WeatherData,
  waterType: string,
  targetSeason: string,
  imageContent?: string // base64
): Promise<TacticalAdvice> => {
  const textPart = {
    text: `
      Handle a request for a modern carp fishing tactical advice.
      Current conditions:
      - Temperature: ${weather.temp}°C
      - Air Pressure: ${weather.pressure} hPa
      - Wind: ${weather.windSpeed} km/h from ${weather.windDirection}
      - Moon: ${weather.moonPhase} (${weather.moonIllumination}%)
      - Water Type: ${waterType}
      - Season: ${targetSeason}

      ${imageContent ? "The user provided an image of their fishing spot. Analyze visual structures like overhanging trees, reed lines, lilies, or shadows and suggest specific targets." : ""}

      Provide a JSON response with:
      1. strategyName: A catchy name.
      2. baitAdvice: Specific modern bait choice.
      3. rigAdvice: Best rig for these conditions.
      4. spotAdvice: Precise spots to fish.
      5. reasoning: Short explanation.
      6. activityScore: A number from 0 to 100 representing the bite probability based on all factors.
      
      Respond in German.
    `
  };

  const contents = imageContent 
    ? { parts: [{ inlineData: { data: imageContent, mimeType: 'image/jpeg' } }, textPart] }
    : { parts: [textPart] };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strategyName: { type: Type.STRING },
          baitAdvice: { type: Type.STRING },
          rigAdvice: { type: Type.STRING },
          spotAdvice: { type: Type.STRING },
          reasoning: { type: Type.STRING },
          activityScore: { type: Type.NUMBER },
        },
        required: ["strategyName", "baitAdvice", "rigAdvice", "spotAdvice", "reasoning", "activityScore"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}") as TacticalAdvice;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Could not generate advice.");
  }
};

export const getLocalInfo = async (location: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Finde aktuelle Informationen, Angelregeln oder Besonderheiten für das Karpfenangeln in der Region ${location}. Nutze die Google Suche.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  return response.text;
};
