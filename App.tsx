
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  FileText, Send, Trash2, Plus, BookOpen, Loader2, Scale,
  ShieldCheck, Sun, Moon, CheckSquare,
  Square, Globe, ExternalLink, Zap, Sparkles, Key, AlertTriangle, Home, RotateCcw,
  ChevronRight, X, Download, Search, Menu, Link2, GitBranch, Gavel, ArrowRight, Hash,
  Mic, MicOff
} from 'lucide-react';
import { DocumentFile, Message } from './types';
import { parseFile, formatBytes } from './utils/fileParser';
import { geminiService } from './services/geminiService';
import { getMadde, getAllMaddeler, MevzuatMaddesi, getMevzuatGraph } from './data/mevzuatVeritabani';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { HistoryModal } from './components/HistoryModal';
import { AdminPanel } from './components/AdminPanel';
import { db, saveChatHistory, getChatSession, saveDocToLibrary, deleteDocFromLibrary, loadLibraryDocs } from './services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User, LogOut, LogIn, Clock, History, Shield } from 'lucide-react';

const DAILY_LIMIT = 50;

interface PDFExportSettings {
  fontSize: 'small' | 'medium' | 'large';
  theme: 'professional' | 'modern' | 'classic';
  title: string;
  showLogo: boolean;
  showDate: boolean;
  showIcons: boolean;
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
    jspdf?: any;
  }
}

const ImarApp: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isGeneralMode, setIsGeneralMode] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [uploadPendingFiles, setUploadPendingFiles] = useState<File[]>([]);
  const [currentDescription, setCurrentDescription] = useState('');
  const [hasKey, setHasKey] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMadde, setSelectedMadde] = useState<MevzuatMaddesi | null>(null);
  const [showMaddeModal, setShowMaddeModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showKnowledgeGraph, setShowKnowledgeGraph] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfSettings, setPdfSettings] = useState<PDFExportSettings>({
    fontSize: 'medium',
    theme: 'modern',
    title: 'İmarMevzuat.ai - Sohbet Geçmişi',
    showLogo: true,
    showDate: true,
    showIcons: true
  });

  // Filtrelenmiş belgeler
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const query = searchQuery.toLowerCase();
    return documents.filter(doc =>
      doc.name.toLowerCase().includes(query) ||
      doc.description?.toLowerCase().includes(query)
    );
  }, [documents, searchQuery]);

  useEffect(() => {
    // API anahtarı gömülü olduğu için her zaman var kabul ediyoruz.
    setHasKey(true);

    // Verileri Yükle (Cloud veya Local)
    const loadData = async () => {
      if (user) {
        // Her belge ayrı doküman: users/{uid}/documents/{docId}
        try {
          const libraryDocs = await loadLibraryDocs(user.uid);
          if (libraryDocs.length > 0) {
            setDocuments(libraryDocs);
          } else {
            // Migration: eski yapılardan veri taşıma
            let oldDocs: DocumentFile[] = [];
            // 1. users/{uid}/data/library'den kontrol et
            const libraryRef = doc(db, "users", user.uid, "data", "library");
            const librarySnap = await getDoc(libraryRef);
            if (librarySnap.exists() && librarySnap.data().documents?.length > 0) {
              oldDocs = librarySnap.data().documents;
            } else {
              // 2. users/{uid} root'dan kontrol et
              const oldDocRef = doc(db, "users", user.uid);
              const oldDocSnap = await getDoc(oldDocRef);
              if (oldDocSnap.exists() && oldDocSnap.data().documents?.length > 0) {
                oldDocs = oldDocSnap.data().documents;
              }
            }
            if (oldDocs.length > 0) {
              // Yeni yapıya migre et (her belge ayrı doküman)
              for (const d of oldDocs) {
                await saveDocToLibrary(user.uid, d);
              }
              setDocuments(oldDocs);
            } else {
              setDocuments([]);
            }
          }
        } catch (e) {
          console.error("Firestore loading error:", e);
        }
      } else {
        // Giriş yapmamışsa LocalStorage'dan çek
        const savedDocs = localStorage.getItem('imar_docs');
        if (savedDocs) {
          try { setDocuments(JSON.parse(savedDocs)); } catch (e) { console.error(e); }
        }
      }

      // Kredi bilgisini Firestore'dan yükle (giriş yapan kullanıcı)
      if (user) {
        try {
          const today = new Date().toDateString();
          const usageRef = doc(db, "users", user.uid, "data", "usage");
          const usageSnap = await getDoc(usageRef);
          if (usageSnap.exists() && usageSnap.data().date === today) {
            setUsageCount(usageSnap.data().count || 0);
          } else {
            // Migration: localStorage'daki eski kredi bilgisini Firestore'a taşı
            const savedUsage = localStorage.getItem('imar_usage_data');
            if (savedUsage) {
              const { date, count } = JSON.parse(savedUsage);
              if (date === today && count > 0) {
                setUsageCount(count);
                await setDoc(usageRef, { date: today, count });
              } else {
                setUsageCount(0);
              }
            } else {
              setUsageCount(0);
            }
          }
        } catch (e) {
          console.error("Usage load error:", e);
          setUsageCount(0);
        }
      }
    };

    loadData();
    const savedTheme = localStorage.getItem('imar_theme');
    setIsDarkMode(savedTheme !== 'false');
  }, []);

  const handleOpenKeySelector = async () => {
    alert("API Anahtarı sistem ortam değişkenlerinden (Cloudflare/Env) otomatik olarak alınmaktadır. Manuel giriş gerekli değildir.");
  };

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('imar_theme', isDarkMode.toString());
  }, [isDarkMode]);

  // Verileri Kaydet (Cloud veya Local)
  // Her belge ayrı Firestore dokümanı olarak saklanır → 1MB sınırı sorun olmaz
  const saveDocuments = async (newDocs: DocumentFile[]) => {
    const oldDocs = documents; // mevcut state (güncelleme öncesi)
    setDocuments(newDocs);

    if (user) {
      try {
        // Eklenen veya değişen belgeleri kaydet
        for (const newDoc of newDocs) {
          const oldDoc = oldDocs.find(d => d.id === newDoc.id);
          if (!oldDoc || oldDoc.isActive !== newDoc.isActive || oldDoc.content !== newDoc.content) {
            await saveDocToLibrary(user.uid, newDoc);
          }
        }
        // Silinen belgeleri Firestore'dan da kaldır
        for (const oldDoc of oldDocs) {
          if (!newDocs.find(d => d.id === oldDoc.id)) {
            await deleteDocFromLibrary(user.uid, oldDoc.id);
          }
        }
      } catch (e) {
        console.error("Error saving to cloud:", e);
      }
    } else {
      // Local'e kaydet
      if (newDocs.length > 0) localStorage.setItem('imar_docs', JSON.stringify(newDocs));
      else localStorage.removeItem('imar_docs');
    }
  };

  // User değişince verileri yeniden yükle
  useEffect(() => {
    // API anahtarı ayarı
    setHasKey(true);

    // Theme
    const savedTheme = localStorage.getItem('imar_theme');
    setIsDarkMode(savedTheme !== 'false');
  }, []);

  // User auth state değişince verileri güncelle
  useEffect(() => {
    const syncData = async () => {
      if (user) {
        try {
          // 1. Belgeleri Yükle
          const libraryDocs = await loadLibraryDocs(user.uid);
          if (libraryDocs.length > 0) {
            setDocuments(libraryDocs);
          } else {
            let oldDocs: DocumentFile[] = [];
            const libraryRef = doc(db, "users", user.uid, "data", "library");
            const librarySnap = await getDoc(libraryRef);
            if (librarySnap.exists() && librarySnap.data().documents?.length > 0) {
              oldDocs = librarySnap.data().documents;
            } else {
              const oldDocRef = doc(db, "users", user.uid);
              const oldDocSnap = await getDoc(oldDocRef);
              if (oldDocSnap.exists() && oldDocSnap.data().documents?.length > 0) {
                oldDocs = oldDocSnap.data().documents;
              } else {
                const localDocs = localStorage.getItem('imar_docs');
                if (localDocs) {
                  const parsed = JSON.parse(localDocs);
                  if (parsed.length > 0) oldDocs = parsed;
                }
              }
            }
            if (oldDocs.length > 0) {
              for (const d of oldDocs) {
                await saveDocToLibrary(user.uid, d);
              }
              setDocuments(oldDocs);
            } else {
              setDocuments([]);
            }
          }

          // 2. Kredi bilgisini Firestore'dan yükle
          const today = new Date().toDateString();
          const usageRef = doc(db, "users", user.uid, "data", "usage");
          const usageSnap = await getDoc(usageRef);
          if (usageSnap.exists() && usageSnap.data().date === today) {
            setUsageCount(usageSnap.data().count || 0);
          } else {
            // Migration: localStorage'daki eski kredi bilgisini Firestore'a taşı
            const savedUsage = localStorage.getItem('imar_usage_data');
            if (savedUsage) {
              const { date, count } = JSON.parse(savedUsage);
              if (date === today && count > 0) {
                setUsageCount(count);
                await setDoc(usageRef, { date: today, count });
              } else {
                setUsageCount(0);
              }
            } else {
              setUsageCount(0);
            }
          }

          // 3. Temiz sohbet
          setMessages([]);
        } catch (e) {
          console.error("Sync data error:", e);
        }
      } else {
        // Logout olduğunda local'e dön
        const savedDocs = localStorage.getItem('imar_docs');
        if (savedDocs) setDocuments(JSON.parse(savedDocs));
        else setDocuments([]);
        setMessages([]);

        // Giriş yapmamış kullanıcı: localStorage'dan kredi bilgisini oku
        const today = new Date().toDateString();
        const savedUsage = localStorage.getItem('imar_usage_data');
        if (savedUsage) {
          const { date, count } = JSON.parse(savedUsage);
          if (date === today) setUsageCount(count);
          else setUsageCount(0);
        } else {
          setUsageCount(0);
        }
      }
    };
    syncData();
  }, [user]);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  // iOS Safari viewport height fix
  useEffect(() => {
    const setAppHeight = () => {
      const vh = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty('--app-height', `${vh}px`);
    };
    setAppHeight();
    window.addEventListener('resize', setAppHeight);
    window.addEventListener('orientationchange', setAppHeight);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setAppHeight);
    }
    return () => {
      window.removeEventListener('resize', setAppHeight);
      window.removeEventListener('orientationchange', setAppHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', setAppHeight);
      }
    };
  }, []);

  // Otomatik Geçmiş Kaydetme
  useEffect(() => {
    if (user && messages.length > 0) {
      const timer = setTimeout(() => {
        saveChatHistory(user.uid, messages, user.email || undefined);
      }, 500); // 500ms gecikmeli kaydet (daha hızlı senkronizasyon)
      return () => clearTimeout(timer);
    }
  }, [messages, user]);

  // PDF Ayarları Modalı
  const PDFSettingsModal = () => {
    if (!showPDFModal) return null;

    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center modal-overlay p-4" onClick={() => setShowPDFModal(false)}>
        <div
          className="bg-dark-tertiary border border-dark-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-dark-border">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-bold text-warm-50 flex items-center gap-2">
                <Download size={20} className="text-accent" /> PDF Çıktı Ayarları
              </h3>
              <button onClick={() => setShowPDFModal(false)} className="p-2 hover:bg-dark-surface rounded-xl transition-colors">
                <X size={20} className="text-warm-400" />
              </button>
            </div>
            <p className="text-xs text-warm-500">Çıktı almadan önce sayfa düzenini özelleştirin.</p>
          </div>

          <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
            {/* Başlık */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-warm-500 uppercase tracking-widest">Belge Başlığı</label>
              <input
                type="text"
                value={pdfSettings.title}
                onChange={(e) => setPdfSettings({ ...pdfSettings, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-sm text-warm-50 focus:border-accent/50 outline-none transition-all"
              />
            </div>

            {/* Yazı Boyutu ve Tema */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-warm-500 uppercase tracking-widest">Yazı Boyutu</label>
                <select
                  value={pdfSettings.fontSize}
                  onChange={(e) => setPdfSettings({ ...pdfSettings, fontSize: e.target.value as any })}
                  className="w-full px-3 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-sm text-warm-50 focus:border-accent/50 outline-none transition-all cursor-pointer"
                >
                  <option value="small">Küçük (12px)</option>
                  <option value="medium">Orta (14px)</option>
                  <option value="large">Büyük (16px)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-warm-500 uppercase tracking-widest">Tema</label>
                <select
                  value={pdfSettings.theme}
                  onChange={(e) => setPdfSettings({ ...pdfSettings, theme: e.target.value as any })}
                  className="w-full px-3 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-sm text-warm-50 focus:border-accent/50 outline-none transition-all cursor-pointer"
                >
                  <option value="professional">Profesyonel (S&B)</option>
                  <option value="modern">Modern (Renkli)</option>
                  <option value="classic">Klasik (Sade)</option>
                </select>
              </div>
            </div>

            {/* Görünürlük Ayarları */}
            <div className="space-y-3 pt-2">
              <label className="text-[10px] font-bold text-warm-500 uppercase tracking-widest block mb-1">Görünüm</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setPdfSettings({ ...pdfSettings, showLogo: !pdfSettings.showLogo })}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-[11px] font-bold ${pdfSettings.showLogo ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-dark-surface border-dark-border text-warm-500'}`}
                >
                  Logo {pdfSettings.showLogo ? 'Açık' : 'Kapalı'}
                </button>
                <button
                  onClick={() => setPdfSettings({ ...pdfSettings, showDate: !pdfSettings.showDate })}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-[11px] font-bold ${pdfSettings.showDate ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-dark-surface border-dark-border text-warm-500'}`}
                >
                  Tarih {pdfSettings.showDate ? 'Açık' : 'Kapalı'}
                </button>
                <button
                  onClick={() => setPdfSettings({ ...pdfSettings, showIcons: !pdfSettings.showIcons })}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-[11px] font-bold ${pdfSettings.showIcons ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-dark-surface border-dark-border text-warm-500'}`}
                >
                  İkonlar {pdfSettings.showIcons ? 'Açık' : 'Kapalı'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-dark-surface border-t border-dark-border flex gap-3">
            <button
              onClick={() => setShowPDFModal(false)}
              className="flex-1 py-3 bg-dark-elevated hover:bg-dark-border text-warm-200 rounded-xl text-xs font-bold transition-all"
            >
              İptal
            </button>
            <button
              onClick={() => {
                setShowPDFModal(false);
                setTimeout(startPDFExport, 100);
              }}
              className="flex-2 flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-accent/20"
            >
              <FileText size={16} /> Çıktı Al
            </button>
          </div>
        </div>
      </div>
    );
  };

  const startPDFExport = () => {
    if (messages.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Pop-up engelleyici aktif olabilir.");
      return;
    }

    const currentDate = new Date().toLocaleDateString('tr-TR', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Tema Değişkenleri
    const themeStyles = {
      professional: {
        userBg: '#f8fafc',
        userBorder: '#e2e8f0',
        userText: '#000',
        aiBg: '#fff',
        aiBorder: '#e2e8f0',
        aiText: '#000',
        accent: '#000',
        aiLabel: '#64748b'
      },
      modern: {
        userBg: '#f0f4ff',
        userBorder: '#6366F1',
        userText: '#1e1b4b',
        aiBg: '#f0fdf4',
        aiBorder: '#22C55E',
        aiText: '#064e3b',
        accent: '#6366F1',
        aiLabel: '#22C55E'
      },
      classic: {
        userBg: '#fff',
        userBorder: '#ddd',
        userText: '#333',
        aiBg: '#fff',
        aiBorder: '#ddd',
        aiText: '#333',
        accent: '#444',
        aiLabel: '#777'
      }
    }[pdfSettings.theme];

    const fontSize = { small: '12px', medium: '14px', large: '16px' }[pdfSettings.fontSize];

    const messagesHTML = messages.map(msg => `
      <div class="message ${msg.role}">
        <div class="role-header">
          ${pdfSettings.showIcons ? (msg.role === 'user' ? '👤' : '🤖') : ''} 
          ${msg.role === 'user' ? 'KULLANICI' : 'MEVZUAT ASİSTANI'}
        </div>
        <div class="content">
          ${msg.text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
        </div>
      </div>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <title>${pdfSettings.title}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: #fff;
            color: #333;
            line-height: 1.6;
            font-size: ${fontSize};
          }
          .container { max-width: 800px; margin: 0 auto; }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid ${themeStyles.accent};
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: ${themeStyles.accent};
            margin-bottom: 5px;
            display: ${pdfSettings.showLogo ? 'block' : 'none'};
          }
          .title { font-size: 18px; font-weight: bold; margin: 10px 0; }
          .date {
            font-size: 11px;
            color: #666;
            display: ${pdfSettings.showDate ? 'block' : 'none'};
          }
          .message {
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 8px;
            /* page-break-inside: avoid; kaldırıldı, böylece uzun cevaplar sayfalar arasına yayılabilir */
          }
          .message.user {
            background: ${themeStyles.userBg};
            border-left: 4px solid ${themeStyles.userBorder};
            color: ${themeStyles.userText};
          }
          .message.assistant {
            background: ${themeStyles.aiBg};
            border-left: 4px solid ${themeStyles.aiBorder};
            color: ${themeStyles.aiText};
          }
          .role-header {
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: ${themeStyles.aiLabel};
            page-break-after: avoid; /* Başlık cevaptan ayrılmasın */
          }
          .content { white-space: pre-wrap; }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 10px;
            color: #999;
          }
          @media print {
            body { padding: 0; }
            .message { border: 1px solid #eee; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚖️ İmarMevzuat.ai</div>
            <div class="title">${pdfSettings.title}</div>
            <div class="date">${currentDate}</div>
          </div>
          <div class="messages">
            ${messagesHTML}
          </div>
          <div class="footer">
            İmarMevzuat.ai - Profesyonel Mevzuat Danışmanı
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const exportChatToPDF = () => {
    if (messages.length === 0) {
      alert("Dışa aktarılacak sohbet bulunmuyor.");
      return;
    }
    setShowPDFModal(true);
  };

  const finalizeUpload = async () => {
    if (uploadPendingFiles.length === 0) return;
    setIsParsing(true);
    const newDocs: DocumentFile[] = [];
    for (const file of uploadPendingFiles) {
      try {
        const textContent = await parseFile(file);
        newDocs.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type.includes('pdf') ? 'pdf' : file.type.includes('word') ? 'docx' : file.type.includes('image') ? 'image' : 'text',
          content: textContent,
          size: formatBytes(file.size),
          description: currentDescription || 'Tanımlanmamış Mevzuat',
          uploadDate: new Date().toLocaleDateString('tr-TR'),
          isActive: true
        });
      } catch (error) {
        console.error(error);
      }
    }
    saveDocuments([...documents, ...newDocs]);
    setIsParsing(false);
    setUploadPendingFiles([]);
    setCurrentDescription('');
  };

  const handleSummarize = async (doc: DocumentFile) => {
    if (isTyping) return;
    setIsTyping(true);
    setIsMobileMenuOpen(false);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: `${doc.name} belgesini özetle.`, timestamp: new Date() }]);
    try {
      const summary = await geminiService.summarizeDocument(doc);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: summary, timestamp: new Date() }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: "Hata: " + e.message, timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = inputValue.trim();
    if (!query || isTyping) return;

    if (usageCount >= DAILY_LIMIT) {
      alert("Günlük kullanım sınırına ulaştınız.");
      return;
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      let responseText = "";
      let references: string[] | undefined;

      if (isGeneralMode) {
        const res = await geminiService.askGeneral(query);
        responseText = res.text;
        references = res.sources.map((s: any) => s.web?.uri).filter(Boolean);
      } else {
        responseText = await geminiService.askQuestion(query, documents, messages);
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: responseText,
        timestamp: new Date(),
        references
      }]);

      const newCount = usageCount + 1;
      setUsageCount(newCount);
      if (user) {
        // Firestore'a kaydet — tüm cihazlarda senkron
        try {
          const usageRef = doc(db, "users", user.uid, "data", "usage");
          await setDoc(usageRef, { date: new Date().toDateString(), count: newCount });
        } catch (e) {
          console.error("Usage save error:", e);
        }
      } else {
        localStorage.setItem('imar_usage_data', JSON.stringify({ date: new Date().toDateString(), count: newCount }));
      }
    } catch (error: any) {
      const msg = error.message || "";
      if (msg.includes("API key") || msg.includes("not found")) {
        setHasKey(false);
      }
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: `Sistem Uyarısı: ${msg}\nLütfen sol menüdeki 'Anahtarı Bağla' butonuna tıklayarak API anahtarınızı seçin.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLinkComparison = async () => {
    if (!linkUrl.trim()) return;

    setShowLinkModal(false);
    setIsTyping(true);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      text: `Şu linkteki mevzuat değişikliğini analiz et: ${linkUrl}`,
      timestamp: new Date()
    }]);

    try {
      const result = await geminiService.compareLegislation(linkUrl, documents);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: result,
        timestamp: new Date()
      }]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: "Hata: " + error.message,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
      setLinkUrl('');
    }
  };

  const handleNewChat = () => {
    if (messages.length > 0) {
      if (user) {
        saveChatHistory(user.uid, messages, user.email || undefined);
      }
      setMessages([]);
    }
  };

  // Madde tıklama işleyicisi
  const handleMaddeClick = useCallback((maddeId: string) => {
    let madde = getMadde(maddeId);

    if (!madde) {
      // Dinamik madde oluşturma mantığı
      const cleanedId = maddeId.replace(/MADDE:\s*/i, '').replace(/[\[\]]/g, '').trim();
      const parts = cleanedId.split('/');
      const maddeNo = parts.length > 1 && parts[0].length !== 4 ? parts[0] : parts.length > 1 ? parts[1] : parts[0];
      const kanunNo = parts.length > 1 && parts[0].length === 4 ? parts[0] : "3194"; // Varsayılan kanun

      madde = {
        id: cleanedId,
        kanunNo: kanunNo,
        kanunAdi: "İmar Kanunu",
        maddeNo: maddeNo,
        baslik: `Madde ${maddeNo}`,
        icerik: "Bu madde içeriği şu an statik veritabanında bulunmamaktadır. Ancak yüklenen belge üzerinden bağlamı görüntüleyebilirsiniz.",
        iliskiliMaddeler: [],
        anahtatKelimeler: [],
        sonGuncelleme: new Date().toLocaleDateString('tr-TR')
      };
    }

    setSelectedMadde(madde);
    setShowMaddeModal(true);
  }, []);

  // İlişkili maddeye git
  const navigateToRelatedMadde = (maddeId: string) => {
    const madde = getMadde(maddeId);
    if (madde) {
      setSelectedMadde(madde);
    }
  };

  const renderText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\[MADDE: .*?\]|\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('[MADDE:')) {
        const maddeId = part.replace('[MADDE:', '').replace(']', '').trim();
        return (
          <button
            key={i}
            onClick={() => handleMaddeClick(maddeId)}
            className="inline-flex items-center gap-1 bg-accent/10 text-accent px-2 py-0.5 rounded-lg font-bold text-[11px] mx-0.5 border border-accent/20 hover:bg-accent/20 transition-colors cursor-pointer"
          >
            <Link2 size={10} />
            {part}
          </button>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-bold text-warm-50">{part.slice(2, -2)}</strong>;
      return part;
    });
  };

  // Madde Detay Modal Bileşeni
  const MaddeModal = () => {
    if (!showMaddeModal || !selectedMadde) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center modal-overlay p-4" onClick={() => setShowMaddeModal(false)}>
        <div
          className="bg-dark-tertiary border border-dark-border w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-dark-border bg-gradient-to-r from-accent/20 to-accent-dark/10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-warm-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                  <Hash size={12} />
                  {selectedMadde.kanunNo} Sayılı {selectedMadde.kanunAdi}
                </div>
                <h2 className="text-xl font-bold text-warm-50">Madde {selectedMadde.maddeNo}: {selectedMadde.baslik}</h2>
              </div>
              <button
                onClick={() => setShowMaddeModal(false)}
                className="p-2 text-warm-400 hover:text-warm-50 hover:bg-dark-surface rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {/* Madde İçeriği */}
            <div className="mb-6">
              <div className="text-warm-200 leading-relaxed whitespace-pre-wrap text-[14px]">
                {selectedMadde.icerik.split(/\*\*(.*?)\*\*/g).map((part, i) =>
                  i % 2 === 1 ? <strong key={i} className="text-accent">{part}</strong> : part
                )}
              </div>
            </div>

            {/* Anahtar Kelimeler */}
            <div className="mb-6">
              <h4 className="text-[10px] font-bold text-warm-500 uppercase tracking-widest mb-2">Anahtar Kelimeler</h4>
              <div className="flex flex-wrap gap-2">
                {selectedMadde.anahtatKelimeler.map((kelime, i) => (
                  <span key={i} className="px-3 py-1 bg-dark-surface border border-dark-border text-warm-300 rounded-full text-xs font-medium">
                    {kelime}
                  </span>
                ))}
              </div>
            </div>

            {/* İlişkili Maddeler */}
            <div className="mb-6">
              <h4 className="text-[10px] font-bold text-warm-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <GitBranch size={12} /> İlişkili Maddeler
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectedMadde.iliskiliMaddeler.map((relatedId) => {
                  const relatedMadde = getMadde(relatedId);
                  return (
                    <button
                      key={relatedId}
                      onClick={() => navigateToRelatedMadde(relatedId)}
                      className="p-3 bg-dark-surface hover:bg-dark-surface-hover border border-dark-border hover:border-accent/30 rounded-xl text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-accent">Madde {relatedId.split('/')[1]}</span>
                        <ArrowRight size={12} className="text-warm-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {relatedMadde && (
                        <p className="text-[10px] text-warm-500 mt-1 truncate">{relatedMadde.baslik}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Yargıtay Kararları - Şimdilik kapatıldı */}
            {/* {selectedMadde.yargitayKararlari && selectedMadde.yargitayKararlari.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Gavel size={12} /> Yargıtay / Danıştay Kararları
                </h4>
                <div className="space-y-2">
                  {selectedMadde.yargitayKararlari.map((karar, i) => (
                    <div key={i} className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-amber-700 dark:text-amber-400">{karar.karar}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{karar.tarih}</p>
                        </div>
                        {karar.link && (
                          <a
                            href={karar.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{karar.ozet}</p>
                    </div>
                  ))}
                </div>
              </div>
            )} */}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Son güncelleme: {selectedMadde.sonGuncelleme}</span>
            <button
              onClick={() => setShowKnowledgeGraph(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
            >
              <GitBranch size={14} /> İlişki Grafiği
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Knowledge Graph Bileşeni
  const KnowledgeGraphModal = () => {
    if (!showKnowledgeGraph) return null;

    const { nodes, edges } = getMevzuatGraph();

    // Basit bir grid-based görselleştirme
    const nodePositions: Record<string, { x: number; y: number }> = {};
    const cols = 3;
    nodes.forEach((node, i) => {
      nodePositions[node.id] = {
        x: (i % cols) * 200 + 100,
        y: Math.floor(i / cols) * 120 + 60
      };
    });

    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center modal-overlay p-4" onClick={() => setShowKnowledgeGraph(false)}>
        <div
          className="bg-dark-tertiary border border-dark-border w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 rounded-xl flex items-center justify-center text-accent">
                <GitBranch size={20} />
              </div>
              <div>
                <h3 className="font-bold text-warm-50">Mevzuat İlişki Grafiği</h3>
                <p className="text-xs text-warm-500">3194 Sayılı İmar Kanunu - Madde Bağlantıları</p>
              </div>
            </div>
            <button
              onClick={() => setShowKnowledgeGraph(false)}
              className="p-2 hover:bg-dark-surface rounded-xl transition-colors"
            >
              <X size={20} className="text-warm-400" />
            </button>
          </div>

          {/* Graph Area */}
          <div className="flex-1 overflow-auto p-6 bg-dark-primary">
            <svg width="700" height={Math.ceil(nodes.length / cols) * 120 + 100} className="mx-auto">
              {/* Edges */}
              {edges.map((edge, i) => {
                const source = nodePositions[edge.source];
                const target = nodePositions[edge.target];
                if (!source || !target) return null;
                return (
                  <line
                    key={i}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={selectedMadde?.id === edge.source || selectedMadde?.id === edge.target ? '#e8734a' : '#4a2f36'}
                    strokeWidth={selectedMadde?.id === edge.source || selectedMadde?.id === edge.target ? 2 : 1}
                    strokeDasharray="4"
                    className="transition-all"
                  />
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => {
                const pos = nodePositions[node.id];
                const isSelected = selectedMadde?.id === node.id;
                const isRelated = selectedMadde?.iliskiliMaddeler.includes(node.id);

                return (
                  <g key={node.id} className="cursor-pointer" onClick={() => {
                    setSelectedMadde(node);
                    setShowKnowledgeGraph(false);
                    setShowMaddeModal(true);
                  }}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? 35 : 30}
                      fill={isSelected ? '#e8734a' : isRelated ? '#d4553a' : '#321f25'}
                      stroke={isSelected ? '#f08860' : isRelated ? '#e8734a' : '#4a2f36'}
                      strokeWidth={isSelected ? 2 : 1}
                      className="transition-all hover:scale-110"
                      style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                    />
                    <text
                      x={pos.x}
                      y={pos.y - 5}
                      textAnchor="middle"
                      className={`text-xs font-bold ${isSelected ? 'fill-white' : 'fill-warm-200'}`}
                      style={{ fill: isSelected ? '#fff' : '#c9a3ac' }}
                    >
                      Md. {node.maddeNo}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 10}
                      textAnchor="middle"
                      className="text-[8px]"
                      style={{ fill: isSelected ? 'rgba(255,255,255,0.8)' : '#8b6b73' }}
                    >
                      {node.baslik.slice(0, 12)}{node.baslik.length > 12 ? '...' : ''}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-dark-border flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-accent"></div>
              <span className="text-xs text-warm-400">Seçili Madde</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-accent-dark"></div>
              <span className="text-xs text-warm-400">İlişkili Madde</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ background: '#321f25', border: '1px solid #4a2f36' }}></div>
              <span className="text-xs text-warm-400">Diğer Maddeler</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Sidebar bileşeni - hem desktop hem mobile için
  // Sidebar bileşeni - daraltılabilir
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const expanded = isMobile || isSidebarExpanded;

    return (
      <>
        {/* Sidebar Header - Logo */}
        <div className="p-3 flex items-center justify-center border-b border-dark-border" style={{ minHeight: '60px' }}>
          {expanded ? (
            <div className="flex items-center justify-between w-full px-1">
              <div className="flex items-center gap-3">
                <button onClick={() => !isMobile && setIsSidebarExpanded(false)} className="sidebar-logo-btn" title="Sidebar'ı Daralt">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-lg shadow-accent/20 flex-shrink-0">
                    <Scale size={18} className="text-white" />
                  </div>
                </button>
                <span className="sidebar-label font-extrabold tracking-tight text-[15px] text-warm-50">İmarMevzuat.ai</span>
              </div>
              {isMobile && (
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-warm-400 hover:text-warm-50 hover:bg-dark-surface rounded-lg transition-all">
                  <X size={18} />
                </button>
              )}
            </div>
          ) : (
            <button onClick={() => setIsSidebarExpanded(true)} className="sidebar-logo-btn" title="Sidebar'ı Genişlet">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-lg shadow-accent/20">
                <Scale size={18} className="text-white" />
              </div>
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="px-2 pt-3 pb-2 space-y-1">
          <button onClick={handleNewChat} className="sidebar-nav-item" data-tip="Yeni Sohbet">
            <Home size={20} className="nav-icon text-warm-300 flex-shrink-0" />
            <span className="sidebar-label">Yeni Sohbet</span>
          </button>

          {user && (
            <button onClick={() => { setShowHistoryModal(true); setIsMobileMenuOpen(false); }} className="sidebar-nav-item" data-tip="Sohbet Geçmişi">
              <History size={20} className="nav-icon flex-shrink-0" />
              <span className="sidebar-label">Sohbet Geçmişi</span>
            </button>
          )}

          <button onClick={() => setShowKnowledgeGraph(true)} className="sidebar-nav-item" data-tip="Mevzuat Grafiği">
            <GitBranch size={20} className="nav-icon flex-shrink-0" />
            <span className="sidebar-label">Mevzuat Grafiği</span>
          </button>

          <button onClick={() => setShowLinkModal(true)} className="sidebar-nav-item" data-tip="Mevzuat Karşılaştır">
            <Globe size={20} className="nav-icon flex-shrink-0" />
            <span className="sidebar-label">Mevzuat Karşılaştır</span>
          </button>

          {isAdmin && (
            <button onClick={() => { setShowAdminPanel(true); setIsMobileMenuOpen(false); }} className="sidebar-nav-item" data-tip="Admin Paneli">
              <Shield size={20} className="nav-icon flex-shrink-0" />
              <span className="sidebar-label">Admin Paneli</span>
            </button>
          )}
        </div>

        {/* Expandable content sections */}
        <div className="sidebar-section flex flex-col flex-1 min-h-0">
          {/* Divider */}
          <div className="mx-3 border-t border-dark-border" />

          {/* Search */}
          <div className="px-3 pt-3 flex-shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Belge ara..."
                className="w-full pl-9 pr-4 py-2 bg-dark-surface border border-dark-border rounded-xl text-xs text-warm-50 focus:outline-none focus:border-accent/50 placeholder-warm-500 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-500 hover:text-warm-300">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Documents Library - scrollable */}
          <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3 custom-scrollbar min-h-0">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[10px] font-bold text-warm-500 uppercase tracking-widest">Kütüphane</span>
              <span className="text-[9px] bg-dark-surface text-warm-400 px-2 py-0.5 rounded-full font-bold">{documents.length}</span>
            </div>

            {!hasKey && (
              <div className="mb-3 p-3 bg-red-900/20 border border-red-800/50 rounded-xl">
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <AlertTriangle size={14} />
                  <span className="text-[10px] font-bold">API Anahtarı Gerekli</span>
                </div>
                <button onClick={handleOpenKeySelector} className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 transition-all">
                  <Key size={12} /> Anahtarı Bağla
                </button>
              </div>
            )}

            <div className="space-y-1.5">
              {filteredDocuments.length === 0 && documents.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-dark-border rounded-xl text-warm-500 text-[10px] font-semibold">Henüz belge yüklenmedi</div>
              ) : filteredDocuments.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-dark-border rounded-xl text-warm-500 text-[10px]">"{searchQuery}" için sonuç yok</div>
              ) : (
                filteredDocuments.map(doc => (
                  <div key={doc.id} className={`p-2.5 rounded-xl border transition-all cursor-default ${doc.isActive ? 'bg-accent/5 border-accent/20' : 'bg-dark-surface border-dark-border hover:border-warm-700'}`}>
                    <div className="flex gap-2">
                      <div onClick={() => saveDocuments(documents.map(d => d.id === doc.id ? { ...d, isActive: !d.isActive } : d))} className="mt-0.5 cursor-pointer flex-shrink-0">
                        {doc.isActive ? <CheckSquare size={14} className="text-accent" /> : <Square size={14} className="text-warm-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold truncate text-warm-100">{doc.name}</p>
                        <p className="text-[9px] text-warm-500 truncate">{doc.description}</p>
                        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-dark-border/50">
                          <button onClick={() => handleSummarize(doc)} className="text-[9px] font-bold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors"><Sparkles size={10} /> Özetle</button>
                          <button onClick={() => saveDocuments(documents.filter(x => x.id !== doc.id))} className="text-warm-600 hover:text-red-400 transition-colors"><Trash2 size={11} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>


        {/* Sidebar Footer */}
        <div className="sidebar-footer p-2 border-t border-dark-border">
          <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && setUploadPendingFiles(Array.from(e.target.files))} className="hidden" multiple accept=".pdf,.docx,.jpg,.jpeg,.png" />

          {expanded ? (
            <button onClick={() => fileInputRef.current?.click()} className="w-full bg-gradient-to-r from-accent to-accent-dark hover:from-accent-hover hover:to-accent text-white py-2.5 rounded-xl shadow-lg shadow-accent/15 flex items-center justify-center gap-2 text-xs font-bold transition-all hover:shadow-accent/25 active:scale-[0.98]">
              <Plus size={15} /> Mevzuat Yükle
            </button>
          ) : (
            <button onClick={() => fileInputRef.current?.click()} className="sidebar-nav-item justify-center" data-tip="Yükle">
              <Plus size={18} className="nav-icon text-accent flex-shrink-0" />
            </button>
          )}

          {/* User Section */}
          <div className="mt-2">
            {user ? (
              expanded ? (
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-dark-surface transition-all group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-amber-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="sidebar-label flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-warm-100 truncate">{user.displayName || 'Kullanıcı'}</p>
                    <p className="text-[9px] text-warm-500 truncate">{user.email}</p>
                  </div>
                  <button onClick={() => logout()} className="p-1.5 text-warm-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-dark-elevated" title="Çıkış">
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsSidebarExpanded(true)} className="sidebar-nav-item justify-center" data-tip={user.displayName || user.email || 'Profil'}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-amber-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </div>
                </button>
              )
            ) : (
              expanded ? (
                <button onClick={() => setIsAuthModalOpen(true)} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-dark-surface transition-all text-warm-300 hover:text-warm-50 text-[12px] font-medium">
                  <LogIn size={16} /> <span className="sidebar-label">Giriş Yap</span>
                </button>
              ) : (
                <button onClick={() => setIsAuthModalOpen(true)} className="sidebar-nav-item justify-center" data-tip="Giriş Yap">
                  <LogIn size={20} className="nav-icon flex-shrink-0" />
                </button>
              )
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="app-container flex w-full bg-dark-primary overflow-hidden" style={{ height: 'var(--app-height, 100dvh)' }}>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop (Collapsible) */}
      <aside
        className={`sidebar hidden lg:flex border-r border-dark-border bg-dark-secondary flex-col h-full z-40 flex-shrink-0 relative ${isSidebarExpanded ? 'expanded' : ''}`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="sidebar-toggle"
          title={isSidebarExpanded ? 'Daralt' : 'Genişlet'}
        >
          <ChevronRight size={18} className={`transition-transform duration-300 ${isSidebarExpanded ? 'rotate-180' : ''}`} />
        </button>
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile (Slide-in, always expanded) */}
      <aside className={`fixed inset-y-0 left-0 w-[280px] max-w-[85vw] border-r border-dark-border bg-dark-secondary flex flex-col z-[60] transform transition-transform duration-300 lg:hidden overflow-y-auto pb-safe ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ height: 'var(--app-height, 100dvh)' }}>
        <SidebarContent isMobile={true} />
      </aside>

      <main className="flex-1 flex flex-col bg-dark-primary min-w-0 relative">
        {/* Subtle gradient glow at top */}
        <div className="absolute top-0 left-0 right-0 h-80 gradient-hero pointer-events-none z-0" />

        {/* Header - Minimal */}
        <header className="h-14 flex items-center justify-between px-4 lg:px-6 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-warm-400 hover:text-warm-50 hover:bg-dark-surface rounded-lg transition-all"
            >
              <Menu size={20} />
            </button>
            <div className="hidden lg:flex items-center gap-2 text-warm-400 text-[11px] font-medium">
              <ShieldCheck size={14} className="text-green-400" />
              <span>Aktif Belge: {documents.filter(d => d.isActive).length}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Günlük Kullanım - Header'da */}
            <div className="flex items-center gap-2 px-3 py-2 bg-dark-surface border border-dark-border rounded-xl">
              <span className="text-[10px] font-semibold text-warm-400">Kredi</span>
              <div className="w-16 h-1.5 bg-dark-elevated rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accent to-accent-dark rounded-full transition-all duration-700" style={{ width: `${(usageCount / DAILY_LIMIT) * 100}%` }}></div>
              </div>
              <span className="text-[10px] font-bold text-accent">{usageCount}/{DAILY_LIMIT}</span>
            </div>
            {messages.length > 0 && (
              <button
                onClick={exportChatToPDF}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all bg-dark-surface hover:bg-dark-surface-hover text-warm-300 hover:text-warm-50 border border-dark-border"
              >
                <Download size={14} />
                <span className="hidden sm:inline">PDF</span>
              </button>
            )}
            <button
              onClick={() => setIsGeneralMode(!isGeneralMode)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all border ${isGeneralMode ? 'bg-accent/15 text-accent border-accent/30' : 'bg-dark-surface text-warm-300 border-dark-border hover:bg-dark-surface-hover hover:text-warm-50'}`}
            >
              <Globe size={14} />
              <span className="hidden sm:inline">Web {isGeneralMode ? 'Açık' : 'Kapalı'}</span>
            </button>
          </div>
        </header>

        {/* Chat Content Area */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 space-y-4 lg:space-y-5 custom-scrollbar overscroll-contain z-10">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-4">
              {/* Hero Section - Like Yupp AI */}
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-8 float-anim border border-accent/10">
                <Scale size={32} className="text-accent" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-warm-50 mb-3 leading-tight tracking-tight">
                Profesyonel Mevzuat<br />Asistanınız
              </h2>
              <p className="text-warm-400 text-sm leading-relaxed mb-10 max-w-md">
                Belgelerinizi yükleyin ve imar mevzuatı hakkında sorular sorun
              </p>

              {/* Quick Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl">
                {[
                  { q: "3194 Sayılı Kanun 18. madde nedir?", icon: <BookOpen size={16} />, color: "text-blue-400" },
                  { q: "İstanbul İmar Yönetmeliği çekme mesafesi?", icon: <Scale size={16} />, color: "text-purple-400" },
                  { q: "Mevzuata göre otopark şartları?", icon: <Gavel size={16} />, color: "text-emerald-400" }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setInputValue(item.q)}
                    className="p-4 bg-dark-surface hover:bg-dark-surface-hover border border-dark-border hover:border-warm-700 rounded-2xl text-left transition-all group"
                  >
                    <div className={`mb-3 ${item.color}`}>{item.icon}</div>
                    <p className="text-[11px] font-medium text-warm-200 leading-snug group-hover:text-warm-50 transition-colors">{item.q}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
                <div className={`max-w-[90%] lg:max-w-[75%] rounded-2xl px-4 lg:px-5 py-3 lg:py-4 ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-accent to-accent-dark text-white shadow-lg shadow-accent/10'
                  : 'bg-dark-surface border border-dark-border text-warm-100'
                  }`}>
                  <div className={`flex items-center gap-2 mb-2 text-[8px] font-bold uppercase tracking-widest ${msg.role === 'user' ? 'text-white/50' : 'text-warm-500'}`}>
                    {msg.role === 'user' ? <Zap size={10} /> : <ShieldCheck size={10} className="text-green-400" />}
                    <span>{msg.role === 'user' ? 'SORU' : 'MEVZUAT YANITI'}</span>
                  </div>
                  <div className="text-[12px] lg:text-[13px] leading-relaxed whitespace-pre-wrap font-medium">
                    {msg.role === 'assistant' ? (
                      <div className="space-y-4">
                        <div>{renderText(msg.text)}</div>
                        {msg.references && msg.references.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-dark-border">
                            {msg.references.map((r, i) => (
                              <a key={i} href={r} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-1.5 bg-dark-elevated border border-dark-border rounded-lg text-[9px] font-bold text-accent hover:text-accent-hover transition-colors">
                                <ExternalLink size={10} /> Kaynak {i + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : msg.text}
                  </div>
                </div>
              </div>
            ))
          )}
          {isTyping && (
            <div className="flex justify-start animate-in">
              <div className="bg-dark-surface rounded-2xl px-5 py-4 border border-dark-border flex items-center gap-2">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input - Glassmorphism */}
        <div className="chat-input-wrapper p-3 lg:p-5 z-10" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)' }}>
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative">
            <div className={`relative bg-dark-surface border rounded-2xl overflow-hidden transition-all focus-within:border-accent/40 focus-within:shadow-[0_0_0_3px_rgba(232,115,74,0.1)] ${isListening ? 'border-red-500/60 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' : 'border-dark-border'}`}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isListening ? 'Dinleniyor... Konuşun' : 'İmar mevzuatı hakkında soru sorun...'}
                disabled={isTyping}
                className="w-full bg-transparent pl-5 pr-24 py-4 text-sm text-warm-50 placeholder-warm-600 focus:outline-none disabled:opacity-50"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {/* Microphone Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isListening) {
                      // Stop listening
                      if (recognitionRef.current) {
                        recognitionRef.current.stop();
                      }
                      setIsListening(false);
                    } else {
                      // Start listening
                      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                      if (!SpeechRecognition) {
                        alert('Tarayıcınız sesli girişi desteklemiyor.');
                        return;
                      }
                      const recognition = new SpeechRecognition();
                      recognition.lang = 'tr-TR';
                      recognition.interimResults = true;
                      recognition.continuous = true;
                      recognition.maxAlternatives = 1;

                      let finalTranscript = inputValue;

                      recognition.onresult = (event: any) => {
                        let interimTranscript = '';
                        for (let i = event.resultIndex; i < event.results.length; i++) {
                          const transcript = event.results[i][0].transcript;
                          if (event.results[i].isFinal) {
                            finalTranscript += (finalTranscript ? ' ' : '') + transcript;
                          } else {
                            interimTranscript += transcript;
                          }
                        }
                        setInputValue(finalTranscript + (interimTranscript ? ' ' + interimTranscript : ''));
                      };

                      recognition.onerror = (event: any) => {
                        console.error('Speech recognition error:', event.error);
                        setIsListening(false);
                      };

                      recognition.onend = () => {
                        setIsListening(false);
                      };

                      recognitionRef.current = recognition;
                      recognition.start();
                      setIsListening(true);
                    }
                  }}
                  disabled={isTyping}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-20 ${isListening
                    ? 'bg-red-500 text-white mic-pulse shadow-lg shadow-red-500/30'
                    : 'text-warm-400 hover:text-warm-50 hover:bg-dark-elevated'
                    }`}
                  title={isListening ? 'Kaydı Durdur' : 'Sesli Giriş'}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-dark text-white flex items-center justify-center shadow-lg shadow-accent/20 active:scale-95 transition-all hover:shadow-accent/30 disabled:opacity-20 disabled:shadow-none"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </form>
          <div className="mt-2 text-center text-[10px] text-warm-600 font-medium">
            Yüklediğiniz mevzuat belgeleri üzerinden arama yapar
          </div>
        </div>
      </main>

      {
        uploadPendingFiles.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4">
            <div className="bg-dark-tertiary border border-dark-border w-full max-w-sm rounded-2xl p-6 shadow-2xl scale-in">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-accent"><FileText size={24} /></div>
                <button onClick={() => setUploadPendingFiles([])} className="p-2 hover:bg-dark-surface rounded-lg transition-all"><X size={18} className="text-warm-500" /></button>
              </div>
              <h4 className="text-lg font-bold mb-1 text-warm-50">Dosya Bilgisi</h4>
              <p className="text-[11px] text-warm-500 mb-5">Bu belge hangi yönetmelikle ilgili?</p>
              <input autoFocus type="text" value={currentDescription} onChange={(e) => setCurrentDescription(e.target.value)} placeholder="Örn: Otopark Yönetmeliği 2024" className="w-full bg-dark-surface border border-dark-border focus:border-accent/40 rounded-xl px-4 py-3 text-sm focus:outline-none text-warm-50 placeholder-warm-600 transition-all" onKeyDown={(e) => e.key === 'Enter' && finalizeUpload()} />
              <div className="flex gap-3 mt-6">
                <button onClick={finalizeUpload} disabled={isParsing} className="flex-1 bg-gradient-to-r from-accent to-accent-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-accent/15 flex items-center justify-center gap-2 hover:shadow-accent/25 transition-all active:scale-[0.98]">
                  {isParsing ? <Loader2 size={16} className="animate-spin" /> : "Kütüphaneye Ekle"}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Link Comparison Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4" onClick={() => setShowLinkModal(false)}>
          <div className="bg-dark-tertiary border border-dark-border w-full max-w-md rounded-2xl p-6 shadow-2xl scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400"><Globe size={20} /></div>
                <div>
                  <h3 className="font-bold text-warm-50">Mevzuat Karşılaştır</h3>
                  <p className="text-[10px] text-warm-500">Resmi Gazete vb. linkini girin</p>
                </div>
              </div>
              <button onClick={() => setShowLinkModal(false)} className="p-2 hover:bg-dark-surface rounded-lg transition-all"><X size={18} className="text-warm-500" /></button>
            </div>

            <div className="mb-5">
              <label className="text-[10px] uppercase font-bold text-warm-500 mb-2 block">Link (URL)</label>
              <input
                autoFocus
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://www.resmigazete.gov.tr/..."
                className="w-full bg-dark-surface border border-dark-border focus:border-emerald-500/40 rounded-xl px-4 py-3 text-sm focus:outline-none text-warm-50 placeholder-warm-600 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleLinkComparison()}
              />
            </div>

            <button
              onClick={handleLinkComparison}
              disabled={!linkUrl.trim()}
              className="w-full py-3 bg-emerald-600 disabled:bg-dark-elevated disabled:text-warm-600 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <GitBranch size={16} />
              Analiz Et ve Karşılaştır
            </button>
          </div>
        </div>
      )}

      {/* Madde Detay Modal */}
      <MaddeModal />

      {/* Knowledge Graph Modal */}
      <KnowledgeGraphModal />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {showHistoryModal && (
        <HistoryModal
          show={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          onSelectSession={(historyMessages) => {
            setMessages(historyMessages);
            setShowHistoryModal(false);
          }}
        />
      )}

      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      <PDFSettingsModal />
    </div >
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <ImarApp />
  </AuthProvider>
);

export default App;
