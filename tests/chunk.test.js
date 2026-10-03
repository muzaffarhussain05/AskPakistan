import { describe, it, expect } from 'vitest';
import { chunkText } from '../crawler/chunk.js';

describe('Text Chunking Module', () => {
  it('creates prefixed chunks with expected structure', () => {
    const extracted = {
      title: 'CNIC Renewal Guidelines',
      text: 'Paragraph 1 describing the official NADRA CNIC renewal process in detail. Citizens can apply online through Pak-Identity portal with biometric verification.\n\nParagraph 2 containing official fee schedules and document requirements. Normal Smart CNIC fee is PKR 750, Urgent Smart CNIC fee is PKR 1500, and Executive Smart CNIC fee is PKR 2500.'
    };
    const chunks = chunkText(extracted, 'NADRA');
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0]).toContain('Title: CNIC Renewal Guidelines | Site: NADRA');
  });

  it('returns empty array for short or invalid text', () => {
    expect(chunkText({ title: '', text: 'Too short' }, 'NADRA')).toEqual([]);
  });
});
