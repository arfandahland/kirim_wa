
import { GoogleGenAI, Type } from "@google/genai";

const getAIInstance = () => {
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getBotReply = async (incomingMsg: string, context: string = "") => {
  const ai = getAIInstance();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: incomingMsg,
      config: {
        systemInstruction: `Anda adalah 'Andri Logistik AI Support'. 
        Tugas utama: Menjawab pertanyaan pelanggan tentang pengiriman paket, cek resi, dan info gudang.
        Karakter: Sopan, Professional, Cepat, dan Informatif.
        
        Konteks Andri Logistik saat ini: 
        ${context || "Gudang buka 24 jam. Pengiriman setiap hari. Melayani seluruh Indonesia. Admin ramah."}
        
        Aturan:
        1. Jika ditanya cek resi, minta pelanggan menunggu sebentar.
        2. Jika ditanya biaya, arahkan untuk memberikan detail berat dan tujuan.
        3. Selalu akhiri dengan 'Salam, Tim Andri Logistik'.`,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI Bot Error:", error);
    return null;
  }
};

export const getLogisticsBrainResponse = async (query: string) => {
  const ai = getAIInstance();
  if (!ai) return "API_KEY tidak ditemukan.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: "Anda adalah Andri Logistics Brain. Berikan saran logistik dan strategi anti-ban WA yang paling mutakhir.",
      },
    });
    return response.text;
  } catch (error) {
    return "Maaf, sistem AI sedang maintenance.";
  }
};
