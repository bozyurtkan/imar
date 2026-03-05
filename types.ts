
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
  webSources?: { uri: string; title: string }[];
}

export enum FileType {
  PDF = 'application/pdf',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  JPEG = 'image/jpeg',
  PNG = 'image/png'
}

export interface FavoriteItem {
  id: string; // The message ID of the assistant's reply
  userId: string;
  questionText: string;
  answerText: string;
  createdAt: string;
  category?: string; // e.g. "Derin Analiz", "Mevzuat Araması"
}


// ========== KREDİ SİSTEMİ TİPLERİ ==========

export interface CreditPlan {
  id: string;
  name: string;           // "free", "basic", "pro", "premium"
  displayName: string;     // "Ücretsiz", "Temel", "Pro", "Premium"
  monthlyCredit: number;
  price: number;
  features: string[];
  createdAt?: string;
}

export interface CreditModule {
  id: string;
  name: string;           // "chatbot", "deep_think", vb.
  displayName: string;
  creditCost: number;
  active: boolean;
  icon: string;
}

export interface CreditLog {
  id: string;
  userId: string;
  moduleId: string;
  moduleName: string;
  creditUsed: number;
  remainingAfter: number;
  createdAt: any;
}

export interface UserCredit {
  subscriptionPlan: string;
  totalCredit: number;
  remainingCredit: number;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  autoRenew: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  planId: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: any;
}
