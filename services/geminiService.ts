import { GoogleGenAI, Type } from "@google/genai";
import { AIRsponseItem } from "../types";

const parseInvoiceItem = async (text: string): Promise<AIRsponseItem | null> => {
  if (!process.env.API_KEY) {
    console.error("API Key not found");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Parse the following invoice item text into structured data. 
      If quantity is missing, assume 1. If price is missing, assume 0. 
      Translate the description to German (Deutsch) using professional invoice terminology.
      Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "Item description in German" },
            quantity: { type: Type.NUMBER, description: "Quantity of items" },
            price: { type: Type.NUMBER, description: "Unit price" }
          },
          required: ["description", "quantity", "price"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIRsponseItem;
    }
    return null;

  } catch (error) {
    console.error("Error parsing item with Gemini:", error);
    return null;
  }
};

export const geminiService = {
  parseInvoiceItem
};