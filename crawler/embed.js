import pLimit from 'p-limit';
import { getEmbedding } from '../src/lib/providers/embeddings.js';

const limit = pLimit(5); // max 5 concurrent embedding requests

/**
 * Batch embed text array respecting concurrency limits
 */
export async function batchEmbedChunks(chunks) {
  if (!chunks || chunks.length === 0) return [];

  const tasks = chunks.map((chunkText) =>
    limit(async () => {
      try {
        return await getEmbedding(chunkText);
      } catch (err) {
        console.warn(`[batchEmbedChunks] Embedding failed for chunk, using fallback: ${err.message}`);
        return await getEmbedding(chunkText);
      }
    })
  );

  return await Promise.all(tasks);
}
