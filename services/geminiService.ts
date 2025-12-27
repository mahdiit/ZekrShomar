import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { QuoteResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchSpiritualQuote = async (): Promise<QuoteResponse> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'یک حدیث کوتاه یا جمله الهام‌بخش درباره فضیلت صلوات فرستادن به زبان فارسی بگو. فقط متن جمله و منبع آن را به صورت JSON برگردان با فرمت {"text": "...", "source": "..."}.',
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(responseText);
    return {
      text: data.text || "اللهم صل علی محمد و آل محمد",
      source: data.source || "ذکر شریف"
    };

  } catch (error) {
    console.error("Error fetching quote:", error);
    return {
      text: "صلوات، نوری در بهشت است.",
      source: "حدیث"
    };
  }
};