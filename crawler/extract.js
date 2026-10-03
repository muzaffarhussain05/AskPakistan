import * as cheerio from 'cheerio';
import crypto from 'crypto';

let pdfParseModule = null;
async function getPdfParse() {
  if (!pdfParseModule) {
    const mod = await import('pdf-parse');
    pdfParseModule = mod.default || mod;
  }
  return pdfParseModule;
}

/**
 * Extracts clean text and title from HTML or PDF buffer.
 */
export async function extract(pageObj) {
  if (!pageObj) return null;

  if (pageObj.contentType === 'application/pdf' && pageObj.buffer) {
    try {
      const pdfParse = await getPdfParse();
      const data = await pdfParse(pageObj.buffer, { max: 40 });
      const rawText = data.text ? data.text.trim() : '';
      if (rawText.length < 200) return null;

      const cleanText = rawText.replace(/\s+/g, ' ');
      const title = pageObj.url.split('/').pop().replace('.pdf', '') || 'Government Document';
      const pageHash = crypto.createHash('sha256').update(cleanText).digest('hex');

      return {
        title,
        text: cleanText,
        pageHash
      };
    } catch (err) {
      console.warn(`[extract] PDF parsing error for ${pageObj.url}: ${err.message}`);
      return null;
    }
  }

  if (pageObj.html) {
    try {
      const $ = cheerio.load(pageObj.html);

      // Extract title
      const title = $('title').text().trim() || $('h1').first().text().trim() || 'Government Portal Page';

      // Remove unwanted elements
      $('script, style, nav, footer, header, form, iframe, .menu, .sidebar, .nav, .footer, .header, #menu, #footer, #header').remove();

      // Convert tables to readable text rows
      $('table').each((_, table) => {
        let tableText = '\n';
        $(table).find('tr').each((_, tr) => {
          const cells = [];
          $(tr).find('th, td').each((_, cell) => {
            cells.push($(cell).text().trim().replace(/\s+/g, ' '));
          });
          if (cells.some(c => c.length > 0)) {
            tableText += '| ' + cells.join(' | ') + ' |\n';
          }
        });
        $(table).replaceWith(tableText + '\n');
      });

      // Extract remaining visible text
      const bodyText = $('body').text() || $.text();
      const lines = bodyText
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);

      const cleanText = lines.join('\n').replace(/\n{3,}/g, '\n\n');

      if (cleanText.length < 200) return null;

      const pageHash = crypto.createHash('sha256').update(cleanText).digest('hex');

      return {
        title: title.replace(/\s+/g, ' '),
        text: cleanText,
        pageHash
      };
    } catch (err) {
      console.warn(`[extract] HTML extraction error for ${pageObj.url}: ${err.message}`);
      return null;
    }
  }

  return null;
}
