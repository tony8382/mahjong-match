
import { GoogleGenAI, Type } from "@google/genai";
import { Encouragement } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getElderlyEncouragement = async (): Promise<Encouragement> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "請給正在玩麻將遊戲的長輩一句溫暖、鼓勵、吉祥的話語。請以『智慧老友』的身份發言。回傳格式必須是 JSON 包含 message 和 author 欄位。",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            author: { type: Type.STRING }
          },
          required: ["message", "author"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return data;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      message: "祝您身體健康，心情愉快，牌運亨通！",
      author: "您的麻將夥伴"
    };
  }
};
