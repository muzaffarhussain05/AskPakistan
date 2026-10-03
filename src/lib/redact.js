/**
 * Client & Server-side Redaction module for sensitive Pakistani PII.
 * Redacts CNIC numbers (13 digits), Pakistani mobile numbers (+92 3XX XXXXXXX / 03XX XXXXXXX), and email addresses.
 */
export function redact(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    // CNIC format: 12345-1234567-1 or 12345 1234567 1 or 1234512345671
    .replace(/\b\d{5}[- ]?\d{7}[- ]?\d\b/g, '[CNIC]')
    // Phone numbers: +92 300 1234567, 00923001234567, 0300-1234567, 03001234567
    .replace(/(?:\+92|0092|0)?[- ]?3\d{2}[- ]?\d{7}\b/g, '[PHONE]')
    // Email addresses
    .replace(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, '[EMAIL]');
}
