import robotsParser from 'robots-parser';

const CRAWL_USER_AGENT = process.env.CRAWL_USER_AGENT || 'AskPakistanBot/1.0 (+https://ask-pakistan.vercel.app/about)';
const CRAWL_DELAY_MS = parseInt(process.env.CRAWL_DELAY_MS || '1500', 10);
const lastFetchTimeMap = new Map();
const robotsCache = new Map();

/**
 * Checks robots.txt permission for a given URL
 */
export async function canFetch(urlStr) {
  try {
    const parsed = new URL(urlStr);
    const origin = parsed.origin;
    if (!robotsCache.has(origin)) {
      const robotsUrl = `${origin}/robots.txt`;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(robotsUrl, {
          headers: { 'User-Agent': CRAWL_USER_AGENT },
          signal: controller.signal
        });
        clearTimeout(timer);
        if (res.ok) {
          const txt = await res.text();
          robotsCache.set(origin, robotsParser(robotsUrl, txt));
        } else {
          robotsCache.set(origin, robotsParser(robotsUrl, ''));
        }
      } catch {
        robotsCache.set(origin, robotsParser(robotsUrl, ''));
      }
    }
    const robot = robotsCache.get(origin);
    return robot ? robot.isAllowed(urlStr, CRAWL_USER_AGENT) ?? true : true;
  } catch {
    return false;
  }
}

/**
 * Polite fetch with retry, timeout, user agent, and domain throttling
 */
export async function fetchPage(urlStr) {
  const allowed = await canFetch(urlStr);
  if (!allowed) {
    console.log(`[robots.txt] Skipping disallowed URL: ${urlStr}`);
    return null;
  }

  const parsed = new URL(urlStr);
  const host = parsed.hostname;

  // Domain throttle
  const lastTime = lastFetchTimeMap.get(host) || 0;
  const now = Date.now();
  if (now - lastTime < CRAWL_DELAY_MS) {
    await new Promise((r) => setTimeout(r, CRAWL_DELAY_MS - (now - lastTime)));
  }
  lastFetchTimeMap.set(host, Date.now());

  let attempts = 0;
  const maxAttempts = 3;
  while (attempts < maxAttempts) {
    attempts++;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(urlStr, {
        headers: {
          'User-Agent': CRAWL_USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/pdf,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,ur;q=0.8'
        },
        signal: controller.signal,
        redirect: 'follow'
      });
      clearTimeout(timer);

      if (!res.ok) {
        if (res.status >= 500 && attempts < maxAttempts) {
          await new Promise((r) => setTimeout(r, 2000 * attempts));
          continue;
        }
        return null;
      }

      const contentType = res.headers.get('content-type') || '';
      const isHtml = contentType.includes('text/html') || contentType.includes('application/xhtml+xml');
      const isPdf = contentType.includes('application/pdf') || urlStr.toLowerCase().endsWith('.pdf');

      if (!isHtml && !isPdf) {
        return null;
      }

      if (isPdf) {
        const buffer = await res.arrayBuffer();
        return {
          url: urlStr,
          contentType: 'application/pdf',
          buffer: Buffer.from(buffer),
          status: res.status
        };
      }

      const html = await res.text();
      return {
        url: urlStr,
        contentType: 'text/html',
        html,
        status: res.status
      };
    } catch (err) {
      if (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 2000 * attempts));
      } else {
        console.warn(`[fetchPage] Failed to fetch ${urlStr}: ${err.message}`);
        return null;
      }
    }
  }
  return null;
}
