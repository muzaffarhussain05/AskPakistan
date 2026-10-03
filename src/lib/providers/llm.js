import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

const provider = process.env.LLM_PROVIDER || 'gemini';
const geminiModelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const anthropicModelName = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';

/**
 * Generate completion from LLM provider (Gemini / Anthropic)
 */
export async function generateCompletion({ systemPrompt, userPrompt }) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

  if (provider === 'anthropic') {
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY_MISSING');
    }
    try {
      const anthropic = new Anthropic({ apiKey: anthropicApiKey });
      const response = await anthropic.messages.create({
        model: anthropicModelName,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      });
      const content = response.content?.[0]?.text;
      if (content) return content;
    } catch (err) {
      console.warn(`[llm.js] Anthropic API failed: ${err.message}`);
      throw new Error(`LLM_API_ERROR: ${err.message}`);
    }
  }

  // Default: Gemini LLM Provider
  if (!geminiApiKey || geminiApiKey.trim().length === 0) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: geminiModelName,
      systemInstruction: systemPrompt
    });
    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    if (text && text.trim().length > 0) {
      return text;
    }
    throw new Error('Empty response received from AI model');
  } catch (err) {
    console.warn(`[llm.js] Gemini API failed: ${err.message}`);
    throw new Error(`LLM_API_ERROR: ${err.message}`);
  }
}
