
import { FileType } from '../types';

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
const MAMMOTH_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export const parseFile = async (file: File): Promise<string> => {
  const fileType = file.type;

  if (fileType === FileType.PDF) {
    return parsePdf(file);
  } else if (fileType === FileType.DOCX) {
    return parseDocx(file);
  } else if (fileType.startsWith('image/')) {
    return parseImage(file);
  } else {
    return "Desteklenmeyen dosya türü.";
  }
};

const parsePdf = async (file: File): Promise<string> => {
  // 4MB altı: tüm PDF'i tek seferde Gemini'ye gönder
  if (file.size < 4 * 1024 * 1024) {
    try {
      return await parsePdfWithGemini(file);
    } catch (e) {
      console.warn("Gemini OCR başarısız, pdfjs'e düşülüyor:", e);
      return parsePdfWithPdfjs(file);
    }
  }

  // 4MB üzeri: sayfa sayfa pdfjs ile çıkar, sonra Gemini ile düzelt
  try {
    const rawText = await parsePdfWithPdfjs(file);
    const fixed = await fixTextWithGemini(rawText);
    return fixed;
  } catch (e) {
    console.warn("Büyük PDF düzeltme başarısız, ham metin kullanılıyor:", e);
    return parsePdfWithPdfjs(file);
  }
};

const fixTextWithGemini = async (rawText: string): Promise<string> => {
  // 8000 karakterlik parçalar halinde gönder
  const CHUNK_SIZE = 8000;
  const chunks: string[] = [];
  for (let i = 0; i < rawText.length; i += CHUNK_SIZE) {
    chunks.push(rawText.slice(i, i + CHUNK_SIZE));
  }

  const fixed: string[] = [];
  for (const chunk of chunks) {
    const response = await fetch('/api/extract-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: chunk }),
    });
    if (!response.ok) throw new Error('fix API failed');
    const { text } = await response.json();
    fixed.push(text || chunk);
  }
  return fixed.join('\n');
};

const parsePdfWithGemini = async (file: File): Promise<string> => {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const response = await fetch('/api/extract-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: base64 }),
  });

  if (!response.ok) throw new Error('PDF extract API failed');
  const { text } = await response.json();
  if (!text || text.length < 100) throw new Error('Yetersiz metin döndü');
  return text;
};

const parsePdfWithPdfjs = async (file: File): Promise<string> => {
  await loadScript(PDFJS_CDN);
  const pdfjsLib = (window as any).pdfjsLib;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent({ normalizeWhitespace: true });

    let pageText = '';
    let lastEndX = -Infinity;
    let lastY = -Infinity;

    for (const item of content.items as any[]) {
      if (!('str' in item) || !item.str) continue;

      const currentX = item.transform[4];
      const currentY = item.transform[5];
      const itemWidth = item.width || 0;

      if (lastY !== -Infinity && Math.abs(currentY - lastY) > 3) {
        pageText += '\n';
        lastEndX = -Infinity;
      }

      if (lastEndX !== -Infinity && currentX > lastEndX + 2) {
        if (!pageText.endsWith(' ') && !item.str.startsWith(' ')) {
          pageText += ' ';
        }
      }

      pageText += item.str;
      lastEndX = currentX + itemWidth;
      lastY = currentY;

      if (item.hasEOL) {
        pageText += '\n';
        lastEndX = -Infinity;
      }
    }

    fullText += pageText + '\n\n';
  }

  return fullText.trim();
};

const parseDocx = async (file: File): Promise<string> => {
  await loadScript(MAMMOTH_CDN);
  const mammoth = (window as any).mammoth;
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

const parseImage = async (file: File): Promise<string> => {
  // For images, we provide the base64 to Gemini directly in a real scenario, 
  // but for the "context text" flow, we indicate it's an image.
  // In our app logic, images will be handled via OCR prompts if needed.
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(`[Resim İçeriği: ${file.name}]`);
    };
    reader.readAsDataURL(file);
  });
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
