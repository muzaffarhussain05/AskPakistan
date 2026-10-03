const rateLimitMap = new Map();

const LIMIT = parseInt(process.env.RATE_LIMIT_PER_MIN || '10', 10);
const WINDOW_MS = 60 * 1000; // 1 minute window

/**
 * Checks IP rate limit
 */
export function checkRateLimit(ip = '127.0.0.1') {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + WINDOW_MS };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + WINDOW_MS;
    rateLimitMap.set(ip, record);
    return { allowed: true, remaining: LIMIT - 1 };
  }

  if (record.count >= LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  rateLimitMap.set(ip, record);
  return { allowed: true, remaining: LIMIT - record.count };
}
