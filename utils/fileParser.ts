
import { FileType } from '../types';

declare const pdfjsLib: any;
declare const mammoth: any;

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
  // Önce Gemini OCR dene (font encoding sorunlarını çözer)
  // Dosya 4MB'dan küçükse Gemini OCR kullan
  if (file.size < 4 * 1024 * 1024) {
    try {
      return await parsePdfWithGemini(file);
    } catch (e) {
      console.warn("Gemini OCR başarısız, pdfjs'e düşülüyor:", e);
    }
  }
  return parsePdfWithPdfjs(file);
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
