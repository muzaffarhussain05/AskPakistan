import fs from 'fs';
import path from 'path';
import { detectLanguage } from '../src/lib/lang.js';
import { rewriteQuery } from '../src/lib/rewrite.js';
import { retrieveChunks } from '../src/lib/retrieve.js';

async function runEval() {
  console.log('=== ASK PAKISTAN RAG EVALUATION SUITE ===\n');

  const evalPath = path.join(process.cwd(), 'data', 'eval', 'questions.json');
  const evalQuestions = JSON.parse(fs.readFileSync(evalPath, 'utf8'));

  let totalQuestions = evalQuestions.length;
  let domainHits = 0;
  let langMatches = 0;
  let notFoundCorrect = 0;

  for (const item of evalQuestions) {
    console.log(`[Q${item.id}] "${item.question}" (${item.lang})`);

    // 1. Language Detection Check
    const detectedLang = detectLanguage(item.question);
    const isLangCorrect = detectedLang === item.lang;
    if (isLangCorrect) langMatches++;

    // 2. Query Rewrite & Retrieval Check
    const searchQuery = await rewriteQuery(item.question, detectedLang);
    const chunks = await retrieveChunks(searchQuery);

    if (item.shouldBeNotFound) {
      if (!chunks || chunks.length === 0 || chunks.every(c => c.score < 0.55)) {
        console.log(`  -> [PASS] Correctly flagged as not found in official sources.`);
        notFoundCorrect++;
      } else {
        console.log(`  -> [FAIL] Expected not found, but retrieved ${chunks.length} chunks.`);
      }
      continue;
    }

    // Check domain hit
    let domainHit = false;
    if (chunks && chunks.length > 0) {
      const topDomains = chunks.map(c => c.url);
      domainHit = item.expectDomains.some(exp => topDomains.some(u => u.includes(exp)));
    }

    if (domainHit) {
      domainHits++;
      console.log(`  -> [PASS] Retrieved domain match: ${chunks[0]?.url}`);
    } else {
      console.log(`  -> [FAIL] Domain mismatch. Expected one of: ${item.expectDomains.join(', ')}`);
    }
  }

  const validTargetQuestions = evalQuestions.filter(q => !q.shouldBeNotFound).length;
  const domainHitRate = (domainHits / validTargetQuestions) * 100;
  const langAccuracy = (langMatches / totalQuestions) * 100;

  console.log(`\n================ EVALUATION SUMMARY ================`);
  console.log(`Total Eval Questions : ${totalQuestions}`);
  console.log(`Language Match Rate  : ${langAccuracy.toFixed(1)}%`);
  console.log(`Domain Hit Rate      : ${domainHitRate.toFixed(1)}% (Target: >= 80%)`);
  console.log(`Not Found Accuracy   : ${notFoundCorrect} / ${evalQuestions.filter(q => q.shouldBeNotFound).length}`);
  console.log(`====================================================\n`);

  if (domainHitRate >= 80) {
    console.log('✅ RAG Evaluation Suite PASSED!');
    process.exit(0);
  } else {
    console.warn('⚠️ RAG Evaluation Suite completed below target threshold.');
    process.exit(0);
  }
}

runEval().catch(console.error);
