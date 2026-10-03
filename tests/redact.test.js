import { describe, it, expect } from 'vitest';
import { redact } from '../src/lib/redact.js';

describe('Redaction Module (CNIC, Phone, Email)', () => {
  it('redacts dashed and undashed Pakistani CNIC numbers', () => {
    expect(redact('My CNIC is 12345-1234567-1 please help.')).toBe('My CNIC is [CNIC] please help.');
    expect(redact('CNIC: 35202 1234567 8')).toBe('CNIC: [CNIC]');
    expect(redact('CNIC 4210112345671 is expired')).toBe('CNIC [CNIC] is expired');
  });

  it('redacts Pakistani mobile numbers in various formats', () => {
    expect(redact('Contact me at 03001234567')).toBe('Contact me at [PHONE]');
    expect(redact('Phone +92-300-1234567')).toBe('Phone [PHONE]');
    expect(redact('Number: 0092 333 9876543')).toBe('Number: [PHONE]');
  });

  it('redacts email addresses', () => {
    expect(redact('Email test@example.com for info')).toBe('Email [EMAIL] for info');
  });

  it('leaves normal text without sensitive PII unchanged', () => {
    const text = 'How do I renew my passport or CNIC online?';
    expect(redact(text)).toBe(text);
  });
});
