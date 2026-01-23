
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
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    fullText += strings.join(' ') + '\n';
  }
  
  return fullText;
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
