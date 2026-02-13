import { GoogleGenAI } from "@google/genai";

export const getBotReply = async (incomingMsg: string, context: string = "") => {
  // Always initialize a new GoogleGenAI instance for each request using process.env.API_KEY directly as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    // Use the .text property to get the generated text from the response object.
    return response.text;
  } catch (error) {
    console.error("AI Bot Error:", error);
    return null;
  }
};

export const getLogisticsBrainResponse = async (query: string) => {
  // Always initialize a new GoogleGenAI instance for each request using process.env.API_KEY directly as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: "Anda adalah Andri Logistics Brain. Berikan saran logistik dan strategi anti-ban WA yang paling mutakhir.",
      },
    });
    // Use the .text property to get the generated text from the response object.
    return response.text;
  } catch (error) {
    console.error("Logistics Brain Error:", error);
    return "Maaf, sistem AI sedang maintenance.";
  }
};