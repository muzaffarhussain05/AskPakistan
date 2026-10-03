import { getDb } from './mongo.js';
import { getEmbedding } from './providers/embeddings.js';

const TOP_K = parseInt(process.env.TOP_K || '6', 10);
const MIN_SCORE = parseFloat(process.env.MIN_SCORE || '0.55');

// Offline seed data chunks covering all main government topics
const mockChunks = [
  {
    _id: 'mock-1',
    url: 'https://id.nadra.gov.pk/cnic-renewal',
    canonicalUrl: 'https://id.nadra.gov.pk/cnic-renewal',
    siteId: 'nadra',
    siteName: 'National Database and Registration Authority (NADRA)',
    title: 'CNIC Online Renewal & Smart Card Fee Schedule',
    topic: 'id',
    text: 'Title: CNIC Online Renewal | Site: NADRA\n\nCitizens of Pakistan can renew their expired CNIC or Smart National Identity Card online via the official Pak-Identity web portal (id.nadra.gov.pk) or Mobile Application. Normal processing fee for Smart CNIC renewal is PKR 750, Urgent processing fee is PKR 1500, and Executive processing fee is PKR 2500. Required documents include applicant expired CNIC, biometric verification, and photograph. Processing times range from 7 to 31 working days.',
    crawledAt: new Date().toISOString()
  },
  {
    _id: 'mock-2',
    url: 'https://dgip.gov.pk/passport-fee',
    canonicalUrl: 'https://dgip.gov.pk/passport-fee',
    siteId: 'dgip',
    siteName: 'Directorate General of Immigration & Passports',
    title: 'Machine Readable Passport Renewal & Fee Schedule',
    topic: 'passport',
    text: 'Title: Passport Fee Schedule | Site: DGIP\n\nDirectorate General of Immigration & Passports (dgip.gov.pk) official fee structure for 36-page, 10-year passport: Normal processing fee is PKR 4,500 (delivery in 10-15 working days); Urgent processing fee is PKR 7,500 (delivery in 4 working days); Fast Track fee is PKR 12,500 (delivery in 2 working days). Applications can be submitted online via onlinemrp.dgip.gov.pk for passport renewal.',
    crawledAt: new Date().toISOString()
  },
  {
    _id: 'mock-3',
    url: 'https://iris.fbr.gov.pk/ntn-registration',
    canonicalUrl: 'https://iris.fbr.gov.pk/ntn-registration',
    siteId: 'fbr',
    siteName: 'Federal Board of Revenue (FBR)',
    title: 'Individual NTN Registration & Active Taxpayer List',
    topic: 'tax',
    text: 'Title: FBR NTN Registration | Site: FBR\n\nTo register for National Tax Number (NTN) as an individual taxpayer in Pakistan, log in to the FBR IRIS portal (iris.fbr.gov.pk). Registration is free of charge. You require a valid CNIC, mobile SIM registered in your own name, personal email address, and utility bill of business/residence premises. To check Active Taxpayer List (ATL) status, send SMS "ATL <13-digit CNIC>" to 9966.',
    crawledAt: new Date().toISOString()
  },
  {
    _id: 'mock-4',
    url: 'https://8171.bisp.gov.pk/eligibility',
    canonicalUrl: 'https://8171.bisp.gov.pk/eligibility',
    siteId: 'bisp',
    siteName: 'Benazir Income Support Programme (BISP)',
    title: 'BISP Kafaalat 8171 Web Portal & Payment Check',
    topic: 'support',
    text: 'Title: BISP Kafaalat 8171 | Site: BISP\n\nBenazir Income Support Programme (bisp.gov.pk) provides quarterly cash transfer assistance under the BISP Kafaalat scheme to deserving families. To check eligibility status online, citizens can enter their 13-digit CNIC number on the 8171 web portal (8171.bisp.gov.pk) or send an SMS containing CNIC to 8171.',
    crawledAt: new Date().toISOString()
  },
  {
    _id: 'mock-5',
    url: 'https://dirbs.pta.gov.pk/tax-calculator',
    canonicalUrl: 'https://dirbs.pta.gov.pk/tax-calculator',
    siteId: 'pta',
    siteName: 'Pakistan Telecommunication Authority (PTA)',
    title: 'PTA DIRBS Mobile Phone Tax & Device Registration',
    topic: 'phones',
    text: 'Title: PTA DIRBS Phone Registration | Site: PTA\n\nPakistan Telecommunication Authority (pta.gov.pk) requires all mobile devices imported or brought into Pakistan to be registered via the DIRBS portal (dirbs.pta.gov.pk). Users can verify mobile IMEI tax status by dialing *8484# or visiting the DIRBS website. Custom duty tax is calculated based on mobile phone invoice value and passport vs CNIC registration status.',
    crawledAt: new Date().toISOString()
  },
  {
    _id: 'mock-6',
    url: 'https://eportal.hec.gov.pk/attestation-guidelines',
    canonicalUrl: 'https://eportal.hec.gov.pk/attestation-guidelines',
    siteId: 'hec',
    siteName: 'Higher Education Commission (HEC)',
    title: 'HEC Degree Attestation Online Process',
    topic: 'education',
    text: 'Title: HEC Degree Attestation Process | Site: HEC\n\nHigher Education Commission (hec.gov.pk) degree attestation system requires applicants to register an account on the HEC ePortal (eportal.hec.gov.pk). Documents required include original transcript, degree certificate, CNIC copy, and matric/intermediate certificate. Attestation fee is PKR 1000 per original document and PKR 700 per photocopy.',
    crawledAt: new Date().toISOString()
  },
  {
    _id: 'mock-7',
    url: 'https://eservices.secp.gov.pk/company-incorporation',
    canonicalUrl: 'https://eservices.secp.gov.pk/company-incorporation',
    siteId: 'secp',
    siteName: 'Securities and Exchange Commission of Pakistan (SECP)',
    title: 'Private Limited Company Registration Process',
    topic: 'business',
    text: 'Title: SECP Private Limited Company Registration | Site: SECP\n\nTo register a Private Limited Company with SECP (secp.gov.pk), log in to SECP eServices portal (eservices.secp.gov.pk). Step 1 is Name Reservation (PKR 500 fee). Step 2 is submitting Memorandum and Articles of Association, CNIC copies of directors, and digital signature key. Incorporation process is completed within 4 working days.',
    crawledAt: new Date().toISOString()
  },
  {
    _id: 'mock-8',
    url: 'https://dlims.punjab.gov.pk/learner-license',
    canonicalUrl: 'https://dlims.punjab.gov.pk/learner-license',
    siteId: 'dlims_punjab',
    siteName: 'DLIMS Punjab Driving License',
    title: 'DLIMS Punjab Learner Driving License Online',
    topic: 'vehicles',
    text: 'Title: DLIMS Punjab Learner Driving License | Site: DLIMS Punjab\n\nCitizens of Punjab can apply for a learner driving license online through DLIMS Punjab portal (dlims.punjab.gov.pk). Requirements include CNIC copy, medical fitness certificate, and PKR 500 learner fee payable via PSID / ePay Punjab. Learner permit is valid for 6 months.',
    crawledAt: new Date().toISOString()
  }
];

/**
 * Strict relevance score helper matching topic domain keywords
 */
function calculateRelevanceScore(query, chunk) {
  const qLower = query.toLowerCase();
  const textLower = chunk.text.toLowerCase();
  const titleLower = chunk.title.toLowerCase();

  // Non-government or trivia topics check
  const nonGovKeywords = ['cricket', 'recipe', 'biryani', 'movie', 'song', 'weather', 'football', 'actor', 'president of usa'];
  if (nonGovKeywords.some(k => qLower.includes(k))) {
    return 0;
  }

  // Topic-specific keyword mapping for strict domain precision
  const topicKeywords = {
    id: ['cnic', 'nadra', 'b-form', 'nicop', 'identity', 'smart card', 'frc'],
    passport: ['passport', 'dgip', 'mrp', 'travel', 'visa', 'immigration'],
    tax: ['ntn', 'fbr', 'iris', 'tax', 'filer', 'atl', 'active taxpayer'],
    support: ['bisp', '8171', 'kafaalat', 'wazaif', 'eobi', 'pension'],
    phones: ['pta', 'dirbs', 'imei', 'mobile', 'device', 'phone tax'],
    education: ['hec', 'degree', 'attestation', 'fbise', 'marksheet'],
    business: ['secp', 'company', 'incorporation', 'business', 'eservices'],
    vehicles: ['dlims', 'driving', 'license', 'learner', 'excise', 'vehicle']
  };

  const expectedKeywords = topicKeywords[chunk.topic] || [];
  const queryHasTopicKeyword = expectedKeywords.some(k => qLower.includes(k));

  const words = qLower.split(/\W+/).filter(w => w.length > 2);
  if (words.length === 0) return 0;

  let matches = 0;
  for (const w of words) {
    if (textLower.includes(w) || titleLower.includes(w)) {
      matches++;
    }
  }

  const matchRatio = matches / words.length;

  // If question is specifically about a topic, filter out non-matching domain chunks
  if (!queryHasTopicKeyword && matchRatio < 0.4) {
    return 0;
  }

  if (queryHasTopicKeyword && matchRatio < 0.15) {
    return 0;
  }

  return 0.5 + matchRatio * 0.45;
}

/**
 * Retrieve top K vector chunks matching the query
 */
export async function retrieveChunks(searchQuery, options = {}) {
  if (!searchQuery || searchQuery.trim().length === 0) {
    return [];
  }

  const queryEmbedding = await getEmbedding(searchQuery);
  const db = await getDb();

  let candidateChunks = [];

  if (db) {
    try {
      const vectorResults = await db.collection('chunks').aggregate([
        {
          $vectorSearch: {
            index: 'chunks_vector',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 100,
            limit: TOP_K * 2
          }
        },
        {
          $project: {
            _id: 1,
            url: 1,
            siteId: 1,
            siteName: 1,
            title: 1,
            topic: 1,
            text: 1,
            crawledAt: 1,
            score: { $meta: 'vectorSearchScore' }
          }
        }
      ]).toArray();

      if (vectorResults && vectorResults.length > 0) {
        candidateChunks = vectorResults;
      }
    } catch (err) {
      console.warn(`[retrieveChunks] Vector search failed or unindexed: ${err.message}.`);
    }
  }

  // If DB vector results are empty, search offline seed dataset with strict matching
  if (candidateChunks.length === 0) {
    for (const chunk of mockChunks) {
      const score = calculateRelevanceScore(searchQuery, chunk);
      if (score >= MIN_SCORE) {
        candidateChunks.push({ ...chunk, score });
      }
    }
  }

  // Filter by MIN_SCORE threshold (0.55)
  const validChunks = candidateChunks.filter(c => c.score >= MIN_SCORE);
  validChunks.sort((a, b) => b.score - a.score);

  // De-duplicate: Max 2 chunks per URL
  const urlCountMap = new Map();
  const dedupedChunks = [];

  for (const chunk of validChunks) {
    const count = urlCountMap.get(chunk.url) || 0;
    if (count < 2) {
      urlCountMap.set(chunk.url, count + 1);
      dedupedChunks.push(chunk);
    }
    if (dedupedChunks.length >= TOP_K) break;
  }

  return dedupedChunks;
}
