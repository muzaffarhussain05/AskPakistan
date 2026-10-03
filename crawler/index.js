import fs from 'fs';
import path from 'path';
import { fetchPage } from './fetchPage.js';
import { extract } from './extract.js';
import { chunkText } from './chunk.js';
import { batchEmbedChunks } from './embed.js';
import { isPageUnchanged, storePageAndChunks } from './store.js';

// Auto-load .env.local or .env for standalone Node CLI execution
try {
  const envLocal = path.join(process.cwd(), '.env.local');
  const env = path.join(process.cwd(), '.env');
  if (fs.existsSync(envLocal)) {
    process.loadEnvFile(envLocal);
  } else if (fs.existsSync(env)) {
    process.loadEnvFile(env);
  }
} catch (err) {
  // Ignore env loading errors
}

// Parse command-line args
const args = process.argv.slice(2);
const targetSite = args.find(a => a.startsWith('--site='))?.split('=')[1];
const customLimit = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '0', 10);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');

const sourcesPath = path.join(process.cwd(), 'data', 'sources.json');
const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));

/**
 * Normalizes URL by stripping query parameters & fragment identifiers
 */
function normalizeUrl(rawUrl, baseUrl) {
  try {
    const parsed = new URL(rawUrl, baseUrl);
    parsed.hash = '';
    // Strip common tracking query params
    const searchParams = parsed.searchParams;
    ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'fbclid'].forEach(p => searchParams.delete(p));
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Checks if a URL is permitted under official .gov.pk rules and source allowlist
 */
function isAllowedDomain(urlStr, source) {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    
    // Hard rule: MUST be a .gov.pk host or explicit allowed base domain
    if (!host.endsWith('.gov.pk') && !host.endsWith('.gop.pk') && !host.endsWith('.edu.pk') && !host.endsWith('.org.pk')) {
      return false;
    }

    const baseHost = new URL(source.baseUrl).hostname.toLowerCase();
    return host === baseHost || host.endsWith('.' + baseHost);
  } catch {
    return false;
  }
}

/**
 * Main Crawler Runner
 */
async function runCrawler() {
  console.log(`\n=== ASK PAKISTAN OFFICIAL CRAWLER ===`);
  console.log(`Mode: ${dryRun ? 'DRY-RUN' : 'LIVE'} | Force: ${force}`);
  if (targetSite) console.log(`Target Site: ${targetSite}`);

  const sitesToCrawl = targetSite ? sources.filter(s => s.id === targetSite) : sources;
  let totalCrawled = 0;
  let totalChanged = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  let totalChunks = 0;

  for (const source of sitesToCrawl) {
    console.log(`\n--- Crawling ${source.name} (${source.id}) ---`);
    const maxPages = customLimit || source.maxPages || parseInt(process.env.CRAWL_MAX_PAGES_PER_SITE || '150', 10);
    const queue = source.seedUrls.map(u => ({ url: u, depth: 0 }));
    const visited = new Set();
    let siteCrawled = 0;

    while (queue.length > 0 && siteCrawled < maxPages) {
      const { url, depth } = queue.shift();
      const normUrl = normalizeUrl(url, source.baseUrl);

      if (!normUrl || visited.has(normUrl)) continue;
      visited.add(normUrl);

      if (!isAllowedDomain(normUrl, source)) {
        continue;
      }

      console.log(`Fetching [D:${depth}] ${normUrl}`);
      const pageRes = await fetchPage(normUrl);
      totalCrawled++;

      if (!pageRes) {
        totalFailed++;
        continue;
      }

      const extracted = await extract(pageRes);
      if (!extracted) {
        totalSkipped++;
        continue;
      }

      const unchanged = await isPageUnchanged(normUrl, extracted.pageHash, force);
      if (unchanged) {
        console.log(`  -> Unchanged (skipped embedding)`);
        totalSkipped++;
        continue;
      }

      const chunks = chunkText(extracted, source.name);
      console.log(`  -> ${chunks.length} chunks generated. Embedding...`);

      const embeddings = dryRun ? new Array(chunks.length).fill([]) : await batchEmbedChunks(chunks);

      const storeRes = await storePageAndChunks({
        siteId: source.id,
        siteName: source.name,
        topic: source.topic,
        url: normUrl,
        title: extracted.title,
        text: extracted.text,
        pageHash: extracted.pageHash,
        chunks,
        embeddings,
        dryRun
      });

      totalChanged++;
      totalChunks += storeRes.insertedChunks;
      siteCrawled++;

      // Extract links if depth < maxDepth
      if (depth < source.maxDepth && pageRes.html) {
        const linkMatches = pageRes.html.matchAll(/href=["']([^"']+)["']/gi);
        for (const match of linkMatches) {
          const rawHref = match[1];
          if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:')) continue;
          const foundUrl = normalizeUrl(rawHref, normUrl);
          if (foundUrl && !visited.has(foundUrl) && isAllowedDomain(foundUrl, source)) {
            queue.push({ url: foundUrl, depth: depth + 1 });
          }
        }
      }
    }
  }

  console.log(`\n================ CRAWL SUMMARY ================`);
  console.log(`Pages Crawled : ${totalCrawled}`);
  console.log(`Pages Changed : ${totalChanged}`);
  console.log(`Pages Skipped : ${totalSkipped}`);
  console.log(`Pages Failed  : ${totalFailed}`);
  console.log(`Total Chunks  : ${totalChunks}`);
  console.log(`===============================================\n`);
}

// Run if called directly
if (process.argv[1]?.endsWith('index.js') || process.argv[1]?.includes('crawler')) {
  runCrawler().catch(console.error);
}

export { runCrawler };
