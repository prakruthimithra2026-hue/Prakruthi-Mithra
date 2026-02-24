
import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

const getHandbookContext = (lang: Language) => `
You are 'Prakruthi Mithra', an expert AI assistant specialized in APCNF (Andhra Pradesh Community Managed Natural Farming).
Your knowledge is based on the APCNF Handbook.
Always provide practical, step-by-step advice for farmers. 
Strictly advise against chemical fertilizers or pesticides.

If the user provides an image, analyze it for pests or diseases and recommend natural APCNF solutions (like Kashayam, Neemastram, etc.).
If the user provides audio, it is a recorded voice message of their query.

IMPORTANT: Respond ONLY in the requested language: ${lang === 'te' ? 'Telugu' : lang === 'hi' ? 'Hindi' : 'English'}.
Use simple, friendly language suitable for rural farmers.
`;

export async function askPrakruthiMithra(
  userQuery: string, 
  lang: Language, 
  image?: { data: string; mimeType: string },
  audio?: { data: string; mimeType: string }
) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const parts: any[] = [{ text: userQuery || "Please analyze this input." }];

    if (image) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType,
        },
      });
    }

    if (audio) {
      parts.push({
        inlineData: {
          data: audio.data,
          mimeType: audio.mimeType,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts }],
      config: {
        systemInstruction: getHandbookContext(lang),
        temperature: 0.7,
      },
    });

    return response.text || "";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (lang === 'te') return "క్షమించాలి, సమస్య ఏర్పడింది. దయచేసి మళ్ళీ ప్రయత్నిచండి.";
    if (lang === 'hi') return "क्षमा करें, कोई समस्या हुई। कृपया पुनः प्रयास करें।";
    return "Sorry, an error occurred. Please try again.";
  }
}

export async function getSpeech(text: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}

/**
 * Translates application content objects to a target language.
 * Optimized to preserve IDs and ensure all keys remain intact.
 */
export async function translateContent(item: any, sourceLang: Language, targetLang: Language, type: 'crop' | 'kashayam' | 'principle') {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const sourceLangName = sourceLang === 'te' ? 'Telugu' : sourceLang === 'hi' ? 'Hindi' : 'English';
  const targetLangName = targetLang === 'te' ? 'Telugu' : targetLang === 'hi' ? 'Hindi' : 'English';

  const { image, ...lightweightItem } = item;

  const prompt = `
    Translate the following ${type} content from ${sourceLangName} to ${targetLangName}. 
    RULES:
    1. Maintain the EXACT same JSON keys.
    2. Do NOT translate the "id" value. It must remain exactly: "${lightweightItem.id}".
    3. Translate only the human-readable string values like "name", "description", "sowing", "purpose", "preparation", "usage".
    4. Return ONLY the valid JSON object.
    
    Data to translate: ${JSON.stringify(lightweightItem)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const translatedText = response.text;
    if (translatedText) {
      try {
        const translatedObj = JSON.parse(translatedText);
        // Force the ID to match perfectly just in case
        translatedObj.id = lightweightItem.id;
        return { ...translatedObj, image };
      } catch (e) {
        console.error("JSON Parse error in translation", e);
      }
    }
  } catch (error) {
    console.error("Translation API Error:", error);
  }
  return item;
}
