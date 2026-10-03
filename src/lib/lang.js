/**
 * Detects question language: 'ur' (Urdu script), 'roman-ur' (Roman Urdu in Latin script), or 'en' (English).
 */
export function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'en';

  const cleanText = text.trim();

  // 1. Urdu script detection (\u0600-\u06FF range)
  const urduCharRegex = /[\u0600-\u06FF]/;
  if (urduCharRegex.test(cleanText)) {
    return 'ur';
  }

  // 2. Roman Urdu pattern detection
  const lower = cleanText.toLowerCase();
  const romanUrduKeywords = [
    'kaise', 'kaisy', 'kya', 'kia', 'banwane', 'banwani', 'banayein', 'tareeqa', 'tarika',
    'fees', 'fee', 'kitni', 'kitna', 'kitne', 'hai', 'hain', 'hein', 'mein', 'main',
    'karo', 'karein', 'karen', 'batao', 'batayen', 'bataiye', 'tarika', 'hoga', 'hogi',
    'chahiye', 'chahaye', 'ka', 'ki', 'ko', 'say', 'se', 'wazaif', 'par', 'bhi'
  ];

  const words = lower.split(/\W+/).filter(Boolean);
  let romanMatches = 0;
  for (const word of words) {
    if (romanUrduKeywords.includes(word)) {
      romanMatches++;
    }
  }

  // If 2 or more Roman Urdu keyword matches, or ratio > 0.25 in short queries
  if (romanMatches >= 2 || (words.length > 0 && romanMatches / words.length >= 0.25)) {
    return 'roman-ur';
  }

  return 'en';
}
