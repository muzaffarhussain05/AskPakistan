import { describe, it, expect } from 'vitest';
import { SYSTEM_PROMPT, buildUserPrompt } from '../src/lib/prompt.js';

describe('System Prompt & Context Builder', () => {
  it('contains strict grounding rules and language rules', () => {
    expect(SYSTEM_PROMPT).toContain('Answer ONLY using the numbered SOURCES');
    expect(SYSTEM_PROMPT).toContain('Urdu script question -> Respond in Urdu script');
    expect(SYSTEM_PROMPT).toContain('Cite sources inline as [1]');
  });

  it('builds numbered source blocks in user prompt', () => {
    const chunks = [
      { title: 'NADRA CNIC', siteName: 'NADRA', url: 'https://id.nadra.gov.pk', text: 'CNIC fee is 750.' }
    ];
    const userPrompt = buildUserPrompt('What is the CNIC fee?', chunks, 'en');
    expect(userPrompt).toContain('[1] Title: NADRA CNIC');
    expect(userPrompt).toContain('What is the CNIC fee?');
  });
});
