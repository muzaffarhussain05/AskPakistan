import { describe, it, expect } from 'vitest';
import { detectLanguage } from '../src/lib/lang.js';

describe('Language Detection Module', () => {
  it('detects English questions', () => {
    expect(detectLanguage('How do I renew my CNIC online?')).toBe('en');
    expect(detectLanguage('What is the urgent passport fee?')).toBe('en');
  });

  it('detects Urdu script questions', () => {
    expect(detectLanguage('شناختی کارڈ آن لائن کیسے رینیو کروائیں؟')).toBe('ur');
    expect(detectLanguage('پاسپورٹ کی فیس کتنی ہے؟')).toBe('ur');
  });

  it('detects Roman Urdu questions', () => {
    expect(detectLanguage('NICOP banwane ka tareeqa kya hai?')).toBe('roman-ur');
    expect(detectLanguage('Urgent passport ki kitni fee hai?')).toBe('roman-ur');
  });
});
