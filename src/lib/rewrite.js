import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Fallback lookup dictionary for quick Roman/Urdu to English query conversion
const queryDictionary = [
  { keywords: ['cnic', 'شناختی کارڈ', 'identity card', 'nic'], rewrite: 'CNIC renewal online process NADRA Pak-Identity documents fee' },
  { keywords: ['passport', 'پاسپورٹ', 'pass port'], rewrite: 'Passport renewal fee urgent 10 year e-Passport DGIP online' },
  { keywords: ['ntn', 'tax', 'filer', 'ٹیکس', 'فائلر', 'iris'], rewrite: 'NTN registration FBR IRIS Active Taxpayer List status' },
  { keywords: ['bisp', '8171', 'kafaalat', 'بینظیر', 'کفالت'], rewrite: 'BISP Kafaalat 8171 eligibility payment registration status' },
  { keywords: ['pta', 'dirbs', 'imei', 'mobile tax', 'پی ٹی اے'], rewrite: 'PTA DIRBS mobile phone registration tax check IMEI' },
  { keywords: ['dlims', 'license', 'driving', 'لائسنس'], rewrite: 'DLIMS Punjab learner driving license application verification' },
  { keywords: ['hec', 'degree', 'attestation', 'ڈگری'], rewrite: 'HEC degree attestation online portal document requirements' },
  { keywords: ['secp', 'company', 'کمپنی', 'business'], rewrite: 'SECP private limited company registration name reservation' }
];

/**
 * Rewrites Roman Urdu or Urdu queries into concise English search terms for vector retrieval.
 */
export async function rewriteQuery(question, lang) {
  if (!question || lang === 'en') {
    return question;
  }

  // 1. Check fallback dictionary
  const lower = question.toLowerCase();
  for (const entry of queryDictionary) {
    if (entry.keywords.some(k => lower.includes(k))) {
      return entry.rewrite;
    }
  }

  // 2. If Gemini API key is available, ask LLM for a concise English search term
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = `Translate the following Pakistani user question (${lang}) into 4 to 8 concise English search keywords suited for document vector search on Pakistani government services websites. Return ONLY the keywords as plain text without quote marks.

Question: "${question}"`;

      const res = await model.generateContent(prompt);
      const text = res.response.text();
      if (text && text.trim().length > 0) {
        return text.trim().replace(/^["']|["']$/g, '');
      }
    } catch (err) {
      console.warn(`[rewriteQuery] LLM query rewrite failed: ${err.message}`);
    }
  }

  // Fallback: return original question
  return question;
}
