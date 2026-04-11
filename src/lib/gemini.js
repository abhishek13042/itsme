import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY
);

export const geminiModel = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash' 
});

export async function generateText(systemPrompt, userPrompt) {
  try {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    const result = await geminiModel.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini error:', error);
    throw error;
  }
}
