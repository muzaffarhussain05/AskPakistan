import { NextResponse } from 'next/server';
import { redact } from '@/lib/redact';
import { detectLanguage } from '@/lib/lang';
import { rewriteQuery } from '@/lib/rewrite';
import { retrieveChunks } from '@/lib/retrieve';
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/prompt';
import { generateCompletion } from '@/lib/providers/llm';
import { checkRateLimit } from '@/lib/rateLimit';

export const maxDuration = 30;

export async function POST(req) {
  try {
    // 1. IP Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rate = checkRateLimit(ip);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a minute before asking another question.' },
        { status: 429 }
      );
    }

    // 2. Validate Body Input
    const body = await req.json().catch(() => ({}));
    const rawQuestion = body.question;

    if (!rawQuestion || typeof rawQuestion !== 'string') {
      return NextResponse.json({ error: 'Question is required.' }, { status: 400 });
    }

    const trimmed = rawQuestion.trim();
    if (trimmed.length < 3 || trimmed.length > 500) {
      return NextResponse.json(
        { error: 'Question must be between 3 and 500 characters.' },
        { status: 400 }
      );
    }

    // 3. Defense in Depth: Server-side Redaction
    const redactedQuestion = redact(trimmed);

    // 4. Language Detection
    const lang = detectLanguage(redactedQuestion);

    // 5. Query Rewrite for Roman Urdu & Urdu Script
    const searchQuery = await rewriteQuery(redactedQuestion, lang);

    // 6. Vector Retrieval from MongoDB / Seed Dataset
    const chunks = await retrieveChunks(searchQuery);

    // 7. Handle No Relevant Chunks Found (Confidence: None)
    if (!chunks || chunks.length === 0) {
      const fallbackMsg = lang === 'ur'
        ? 'معذرت، یہ معلومات کسی بھی سرکاری (.gov.pk) ویب سائٹ سے حاصل نہیں ہو سکیں۔ براہ کرم ہماری ڈائریکٹری دیکھیں یا متعلقہ پورٹل پر رجوع کریں۔'
        : lang === 'roman-ur'
        ? 'Maazrat, yeh maloomat kisi bhi sarkari (.gov.pk) website par nahi mil sakin. Barah-e-karam official portals directory check karein.'
        : 'I could not find verified information regarding this question in official Pakistani government (.gov.pk) sources. Please check our official Directory page to visit official portals directly.';

      return NextResponse.json({
        answer: fallbackMsg,
        language: lang,
        sources: [],
        confidence: 'none',
        lastChecked: new Date().toISOString()
      });
    }

    // Determine confidence level based on top chunk score
    const topScore = chunks[0]?.score || 0.6;
    const confidence = topScore >= 0.7 ? 'high' : 'low';

    // Format & deduplicate sources strictly matching retrieved chunks
    const sourceMap = new Map();
    for (const chunk of chunks) {
      if (!sourceMap.has(chunk.url)) {
        sourceMap.set(chunk.url, {
          title: chunk.title,
          url: chunk.url,
          site: chunk.siteName,
          crawledAt: chunk.crawledAt || new Date().toISOString()
        });
      }
    }
    const sources = Array.from(sourceMap.values());
    const latestCrawlDate = sources[0]?.crawledAt || new Date().toISOString();

    // 8. Generate LLM Answer strictly from retrieved context
    const userPrompt = buildUserPrompt(redactedQuestion, chunks, lang);
    let answer = '';

    try {
      answer = await generateCompletion({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt
      });
    } catch (llmErr) {
      console.warn('[API /api/ask LLM Error]:', llmErr.message);

      if (llmErr.message?.includes('GEMINI_API_KEY_MISSING')) {
        const msg = lang === 'ur'
          ? '⚠️ **اے آئی ماڈل کی سروس عارضی طور پر غیر فعال ہے**\n\nگوگل جیمنائی کی اے آئی کی (GEMINI_API_KEY) موجود نہیں ہے۔ برائے مہربانی اپنا GEMINI_API_KEY درج کریں اور دوبارہ کوشش کریں۔'
          : lang === 'roman-ur'
          ? '⚠️ **AI Model Service Key Unconfigured**\n\nGemini API key missing hai. Barah-e-karam GEMINI_API_KEY ko `.env.local` mein add karein aur dobara try karein.'
          : '⚠️ **AI Service Key Required**\n\nThe AI model key (`GEMINI_API_KEY`) is not configured yet. Please add your `GEMINI_API_KEY` in `.env.local` to receive live AI generated answers.';

        return NextResponse.json({
          answer: msg,
          language: lang,
          sources,
          confidence: 'low',
          lastChecked: latestCrawlDate
        });
      }

      // Generic LLM API Error (Network timeout, rate limit, API service down)
      const errNotice = lang === 'ur'
        ? '⚠️ **سروس میں عارضی دشواری**\n\nاے آئی ماڈل سروس اس وقت دستیاب نہیں ہے یا کنکشن کا مسئلہ ہے۔ برائے مہربانی چند لمحوں بعد دوبارہ کوشش کریں۔'
        : lang === 'roman-ur'
        ? '⚠️ **Service Temporarily Unavailable**\n\nAI model service mein temporary issue aa raha hai. Barah-e-karam kuch der baad dobara try karein.'
        : '⚠️ **AI Service Temporarily Unavailable**\n\nThe AI service is currently experiencing high traffic or a temporary network connection issue. Please try again in a few moments.';

      return NextResponse.json({
        answer: errNotice,
        language: lang,
        sources,
        confidence: 'low',
        lastChecked: latestCrawlDate
      });
    }

    return NextResponse.json({
      answer,
      language: lang,
      sources,
      confidence,
      lastChecked: latestCrawlDate
    });
  } catch (err) {
    console.error('[API /api/ask error]:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request. Please try again.' },
      { status: 500 }
    );
  }
}
