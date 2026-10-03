/**
 * Chunks cleaned text into 300-500 token (~1200-1600 character) chunks with overlap.
 */
export function chunkText(extracted, siteName) {
  const { title, text } = extracted;
  if (!text || text.length < 200) return [];

  const CHUNK_SIZE = 1400; // ~350 tokens
  const OVERLAP = 200;    // ~15% overlap
  const prefix = `Title: ${title} | Site: ${siteName}\n\n`;

  // Split into structural paragraphs/sections first
  const paragraphs = text.split(/\n\n+/);
  const chunks = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    if ((currentChunk + '\n\n' + trimmedPara).length <= CHUNK_SIZE) {
      currentChunk = currentChunk ? currentChunk + '\n\n' + trimmedPara : trimmedPara;
    } else {
      if (currentChunk.length >= 200) {
        chunks.push(prefix + currentChunk);
      }
      
      // Calculate overlap from tail of currentChunk
      const tail = currentChunk.slice(Math.max(0, currentChunk.length - OVERLAP));
      currentChunk = tail ? tail + '\n\n' + trimmedPara : trimmedPara;

      // Handle massive single paragraphs by splitting sentence-wise
      while (currentChunk.length > CHUNK_SIZE + OVERLAP) {
        const slice = currentChunk.slice(0, CHUNK_SIZE);
        chunks.push(prefix + slice);
        currentChunk = currentChunk.slice(CHUNK_SIZE - OVERLAP);
      }
    }
  }

  if (currentChunk.length >= 100) {
    chunks.push(prefix + currentChunk);
  }

  return chunks;
}
