
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { ImageSize, Page } from "../types";

// Helper for base64 decoding (manual implementation as requested)
function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper for PCM decoding (manual implementation as requested)
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Generate the initial story structure based on user prompt
export const generateStoryStructure = async (prompt: string): Promise<{ title: string; pages: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a short story for children based on this prompt: "${prompt}". 
    The story should be divided into 4-6 distinct pages. 
    Return a JSON object with a "title" string and an "pages" array of strings.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          pages: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ['title', 'pages']
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

// Generate a whimsical illustration for a specific story page
export const generateIllustration = async (pageText: string, storyTitle: string, size: ImageSize): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Use gemini-2.5-flash-image for standard 1K, upgrade to gemini-3-pro-image-preview for high-res
  const usePro = size === '2K' || size === '4K';
  const model = usePro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  const config: any = {
    imageConfig: {
      aspectRatio: "16:9"
    }
  };
  
  // imageSize option is only available for gemini-3-pro-image-preview
  if (usePro) {
    config.imageConfig.imageSize = size;
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: `A whimsical, kid-friendly illustration for a story titled "${storyTitle}". Scene: ${pageText}. Style: Vibrant, colorful, 3D animated movie style.` }]
      },
      config: config
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated in the response parts");
  } catch (error: any) {
    console.error(`Image generation error with ${model}:`, error);
    
    // Check for permission errors specifically
    if (error?.message?.includes('PERMISSION_DENIED') || error?.message?.includes('caller does not have permission')) {
      throw new Error("API_KEY_PERMISSION_ERROR");
    }
    
    throw error;
  }
};

// Convert text to high-quality audio using the TTS model
export const generateSpeech = async (text: string): Promise<AudioBuffer> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read this story page warmly and expressively: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");

  const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
  const decodedData = decodeBase64(base64Audio);
  return await decodeAudioData(decodedData, audioContext, 24000, 1);
};

// Send a chat message to the magical AI companion with history context
export const sendChatMessage = async (history: { role: 'user' | 'model'; text: string }[], message: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      ...history.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ],
    config: {
      systemInstruction: "You are a friendly, helpful, and magical AI companion for children. You help explain things from their storybooks or just chat about fun things. Keep your answers simple, encouraging, and safe for kids.",
    }
  });

  return response.text;
};
