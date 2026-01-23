
export interface DocumentFile {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'image' | 'text';
  content: string;
  size: string;
  description?: string;
  uploadDate: string;
  isActive: boolean; // Added for selection logic
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  references?: string[];
}

export enum FileType {
  PDF = 'application/pdf',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  JPEG = 'image/jpeg',
  PNG = 'image/png'
}
