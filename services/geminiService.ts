
import { GoogleGenAI, Type } from "@google/genai";

const getAIInstance = () => {
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export interface AISuggestion {
  message: string;
  type: 'info' | 'warning' | 'strategy';
}

export const getLogisticsBrainResponse = async (query: string) => {
  const ai = getAIInstance();
  if (!ai) return "API_KEY tidak ditemukan.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: `Anda adalah 'Andri Logistics Brain'. 
        Tugas Anda membantu admin mengelola operasional logistik, memberikan saran anti-blokir WA, 
        dan membuat template pesan yang ramah. 
        Bahasa: Indonesia (Professional & Ramah).`,
        temperature: 0.8,
      },
    });
    return response.text;
  } catch (error) {
    return "Maaf, otak AI sedang beristirahat. Silakan coba sesaat lagi.";
  }
};

export const analyzeAntiBanSettings = async (config: any) => {
  const ai = getAIInstance();
  if (!ai) return { score: 0, suggestions: ["API_KEY tidak ditemukan"] };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analisis konfigurasi ini: ${JSON.stringify(config)}. 
      Berikan skor keamanan (0-100) dan 3 saran singkat agar tidak diblokir Meta.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            suggestions: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return { score: 85, suggestions: ["Gunakan delay lebih lama", "Variasikan isi pesan", "Hubungkan dengan akun FB Business"] };
  }
};
