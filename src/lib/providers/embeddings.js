import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.EMBEDDING_MODEL || 'gemini-embedding-001';
const dims = parseInt(process.env.EMBEDDING_DIMS || '768', 10);

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Generate a deterministic pseudo-random 768-dim vector from hash (fallback for offline/mock)
 */
function generateFallbackEmbedding(text) {
  const hash = crypto.createHash('sha256').update(text).digest();
  const vector = new Array(dims);
  for (let i = 0; i < dims; i++) {
    const byte = hash[i % hash.length];
    vector[i] = Math.sin(byte + i);
  }
  // Normalize vector
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / norm);
}

/**
 * Embed a single string text
 */
export async function getEmbedding(text) {
  if (!text || typeof text !== 'string') {
    return generateFallbackEmbedding('empty');
  }

  if (!genAI) {
    return generateFallbackEmbedding(text);
  }

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.embedContent(text);
    if (result && result.embedding && Array.isArray(result.embedding.values)) {
      return result.embedding.values;
    }
    return generateFallbackEmbedding(text);
  } catch (err) {
    console.warn(`[getEmbedding] Gemini API error, falling back to mock vector: ${err.message}`);
    return generateFallbackEmbedding(text);
  }
}

/**
 * Batch embed multiple texts
 */
export async function getEmbeddingsBatch(texts) {
  const results = [];
  for (const txt of texts) {
    const emb = await getEmbedding(txt);
    results.push(emb);
  }
  return results;
}
