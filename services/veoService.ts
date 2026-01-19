
import { GoogleGenAI } from "@google/genai";

export const checkAndRequestApiKey = async (): Promise<boolean> => {
  // @ts-ignore
  if (typeof window.aistudio === 'undefined') return true; // Fallback if not in environment
  // @ts-ignore
  const hasKey = await window.aistudio.hasSelectedApiKey();
  if (!hasKey) {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    return true; // Assume success after opening dialog
  }
  return true;
};

export const generateVeoVideo = async (
  base64Image: string,
  prompt: string,
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<string> => {
  // Create a new GoogleGenAI instance right before making an API call to ensure it uses the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || 'Make this image come to life with gentle cinematic movement',
      image: {
        imageBytes: base64Image.split(',')[1],
        mimeType: 'image/png',
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    while (!operation.done) {
      // Polling for video generation should use a 10s interval as per guidelines
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed: No URI returned");

    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found")) {
      // @ts-ignore
      if (typeof window.aistudio !== 'undefined') await window.aistudio.openSelectKey();
    }
    throw error;
  }
};
