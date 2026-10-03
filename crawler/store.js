import { getDb } from '../src/lib/mongo.js';

// In-memory fallback storage when DB is unavailable or dry-run is active
const inMemoryPages = new Map();
const inMemoryChunks = [];

/**
 * Checks if a page has changed based on SHA-256 hash
 */
export async function isPageUnchanged(urlStr, pageHash, force = false) {
  if (force) return false;

  const db = await getDb();
  if (db) {
    try {
      const pageDoc = await db.collection('pages').findOne({ url: urlStr });
      if (pageDoc && pageDoc.pageHash === pageHash) {
        await db.collection('pages').updateOne(
          { url: urlStr },
          { $set: { lastCrawledAt: new Date() } }
        );
        return true;
      }
    } catch (err) {
      console.warn(`[store] DB error in isPageUnchanged: ${err.message}`);
    }
  } else {
    const memPage = inMemoryPages.get(urlStr);
    if (memPage && memPage.pageHash === pageHash) {
      memPage.lastCrawledAt = new Date();
      return true;
    }
  }

  return false;
}

/**
 * Stores page metadata and chunks in MongoDB
 */
export async function storePageAndChunks({ siteId, siteName, topic, url, title, text, pageHash, chunks, embeddings, dryRun = false }) {
  if (dryRun) {
    console.log(`[dry-run] Would store page: ${url} with ${chunks.length} chunks.`);
    return { insertedChunks: chunks.length, pageUpdated: true };
  }

  const chunkDocs = chunks.map((chunkText, idx) => ({
    url,
    canonicalUrl: url,
    siteId,
    siteName,
    title,
    topic,
    text: chunkText,
    chunkIndex: idx,
    embedding: embeddings[idx] || [],
    pageHash,
    lang: 'en',
    crawledAt: new Date()
  }));

  const db = await getDb();
  if (db) {
    try {
      // Upsert page metadata
      await db.collection('pages').updateOne(
        { url },
        {
          $set: {
            url,
            pageHash,
            lastCrawledAt: new Date(),
            status: 200,
            chunkCount: chunks.length,
            siteId
          }
        },
        { upsert: true }
      );

      // Delete existing chunks for this URL
      await db.collection('chunks').deleteMany({ url });

      // Insert new chunks
      if (chunkDocs.length > 0) {
        await db.collection('chunks').insertMany(chunkDocs);
      }

      return { insertedChunks: chunkDocs.length, pageUpdated: true };
    } catch (err) {
      console.error(`[store] DB error saving ${url}: ${err.message}`);
    }
  }

  // Fallback to in-memory store
  inMemoryPages.set(url, { url, pageHash, lastCrawledAt: new Date(), status: 200, chunkCount: chunks.length, siteId });
  // Remove existing chunks for this url
  for (let i = inMemoryChunks.length - 1; i >= 0; i--) {
    if (inMemoryChunks[i].url === url) {
      inMemoryChunks.splice(i, 1);
    }
  }
  inMemoryChunks.push(...chunkDocs);
  return { insertedChunks: chunkDocs.length, pageUpdated: true };
}

export function getInMemoryStore() {
  return { pages: inMemoryPages, chunks: inMemoryChunks };
}
