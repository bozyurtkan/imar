
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { OfficialGazetteModal } from './components/OfficialGazetteModal';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { LegalPage } from './components/LegalPage';
import { ArticlePage } from './components/ArticlePage';
import { BlogPage } from './components/BlogPage';
import { CookieBanner } from './components/CookieBanner';
import {
  FileText, Send, Trash2, Plus, BookOpen, Loader2, Scale,
  ShieldCheck, Sun, Moon, CheckSquare,
  Square, Globe, ExternalLink, Zap, Sparkles, Key, AlertTriangle, Home, RotateCcw,
  ChevronRight, X, Download, Search, Menu, Link2, GitBranch, Gavel, ArrowRight, Hash,
  Mic, MicOff, ScrollText, Brain, Copy, Check, Star, HelpCircle
} from 'lucide-react';
// ... rest of imports



import { DocumentFile, Message, FavoriteItem } from './types';
import { parseFile, formatBytes } from './utils/fileParser';
import { geminiService } from './services/geminiService';
import { getMadde, getAllMaddeler, MevzuatMaddesi, getMevzuatGraph } from './data/mevzuatVeritabani';
import { getDemoDocuments } from './data/demoMevzuat';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { HistoryModal } from './components/HistoryModal';
import { FavoritesModal } from './components/FavoritesModal';
import { AdminPanel } from './components/AdminPanel';
import { OnboardingTour } from './components/OnboardingTour';
import { HelpCenterModal } from './components/HelpCenterModal';
import { db, saveChatHistory, getChatSession, saveDocToLibrary, deleteDocFromLibrary, loadLibraryDocs, saveFavorite, deleteFavorite, getFavorites } from './services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User, LogOut, LogIn, Clock, History, Shield, AlertCircle } from 'lucide-react';
import { getUserCredit, checkCredit, deductCredit, initializeDefaultData } from './services/creditService';
import { UserCredit } from './types';

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

const generateDemoDocuments = (): DocumentFile[] => {
  const extraDocs = getDemoDocuments();

  // Sadece sizin yüklediğiniz 3 belgeyi dönüyoruz.
  // İmar Kanunu (id: auto-imar-kanunu) varsayılan olarak aktif gelsin.
  return extraDocs.map((doc) => ({
    ...doc,
    isActive: doc.id === 'auto-imar-kanunu'
  }));
};

const ImarApp: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>(() => Date.now().toString(36) + Math.random().toString(36).substr(2, 5));
  const [inputValue, setInputValue] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('imar_theme');
    return saved === 'dark';
  });
  const [isGeneralMode, setIsGeneralMode] = useState(false);
  // Kredi sistemi state'leri
  const [userCredit, setUserCredit] = useState<UserCredit>({
    subscriptionPlan: 'free',
    totalCredit: 100,
    remainingCredit: 100,
    subscriptionStartDate: '',
    subscriptionEndDate: '',
    autoRenew: false
  });
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const [uploadPendingFiles, setUploadPendingFiles] = useState<File[]>([]);
  const [currentDescription, setCurrentDescription] = useState('');
  const [hasKey, setHasKey] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMadde, setSelectedMadde] = useState<MevzuatMaddesi | null>(null);
  const [showMaddeModal, setShowMaddeModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showResmiGazeteModal, setShowResmiGazeteModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showKnowledgeGraph, setShowKnowledgeGraph] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [isDeepThinkMode, setIsDeepThinkMode] = useState(false);
  const [showDeepThinkToast, setShowDeepThinkToast] = useState(false);
  const [isLoadingMaddeAI, setIsLoadingMaddeAI] = useState(false);
  const [typingMessageIndex, setTypingMessageIndex] = useState(0);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('imar_onboarding_completed') !== 'true';
  });
  const [activeTour, setActiveTour] = useState<'library' | 'webSearch'>('library');
  const [showHelpCenter, setShowHelpCenter] = useState(false);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleToggleFavorite = async (msg: Message) => {
    if (!user) {
      alert("Favorilere eklemek için giriş yapmalısınız.");
      return;
    }
    const isFav = favorites.find(f => f.id === msg.id);
    if (isFav) {
      await deleteFavorite(user.uid, msg.id);
      setFavorites(prev => prev.filter(f => f.id !== msg.id));
    } else {
      const index = messages.findIndex(m => m.id === msg.id);
      const questionText = index > 0 && messages[index - 1].role === 'user' ? messages[index - 1].text : "Soru bulunamadı";
      const newFav: FavoriteItem = {
        id: msg.id,
        userId: user.uid,
        questionText,
        answerText: msg.text,
        createdAt: new Date().toISOString(),
        category: msg.text.startsWith('🧠') ? 'Derin Analiz' : 'Mevzuat Araması'
      };
      await saveFavorite(user.uid, newFav);
      setFavorites(prev => [newFav, ...prev]);
    }
  };

  const normalTypingMessages = [
    "Araştırıyorum...",
    "Mevzuatı inceliyorum...",
    "Hemen bakıyorum...",
    "Sizin için hazırlıyorum...",
    "Belgeleri tarıyorum..."
  ];

  const deepThinkTypingMessages = [
    "Derin düşünüyorum...",
    "Detaylı analiz yapıyorum...",
    "Maddeleri çapraz kontrol ediyorum...",
    "Hukuki muhakeme yürütüyorum...",
    "Kapsamlı bir yanıt hazırlıyorum..."
  ];

  // Typing mesajlarını döndür
  useEffect(() => {
    if (!isTyping) {
      setTypingMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setTypingMessageIndex(prev => prev + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, [isTyping]);

  const [pdfSettings, setPdfSettings] = useState<PDFExportSettings>({
    fontSize: 'medium',
    theme: 'modern',
    title: 'İmar Mevzuat - Sohbet Geçmişi',
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

  // Theme toggle effect
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('theme-transition');
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('imar_theme', isDarkMode ? 'dark' : 'light');
    // Remove transition class after animation
    const timer = setTimeout(() => root.classList.remove('theme-transition'), 350);
    return () => clearTimeout(timer);
  }, [isDarkMode]);

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
            const hasActive = libraryDocs.some(d => d.isActive);
            if (!hasActive) {
              const updatedDocs = libraryDocs.map(d =>
                d.id === 'auto-imar-kanunu' ? { ...d, isActive: true } : d
              );
              setDocuments(updatedDocs);
            } else {
              setDocuments(libraryDocs);
            }
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
              const demoDocs = generateDemoDocuments();
              for (const d of demoDocs) {
                await saveDocToLibrary(user.uid, d);
              }
              setDocuments(demoDocs);
            }
          }
        } catch (e) {
          console.error("Firestore loading error:", e);
        }
      } else {
        // Giriş yapmamışsa LocalStorage'dan çek
        const savedDocs = localStorage.getItem('imar_docs');
        if (savedDocs) {
          try {
            const parsed: DocumentFile[] = JSON.parse(savedDocs);
            if (parsed.length > 0) {
              const hasActive = parsed.some(d => d.isActive);
              if (!hasActive) {
                const updatedParsed = parsed.map(d =>
                  d.id === 'auto-imar-kanunu' ? { ...d, isActive: true } : d
                );
                setDocuments(updatedParsed);
                localStorage.setItem('imar_docs', JSON.stringify(updatedParsed));
              } else {
                setDocuments(parsed);
              }
            } else {
              const demoDocs = generateDemoDocuments();
              localStorage.setItem('imar_docs', JSON.stringify(demoDocs));
              setDocuments(demoDocs);
            }
          } catch (e) { console.error(e); }
        } else {
          const demoDocs = generateDemoDocuments();
          localStorage.setItem('imar_docs', JSON.stringify(demoDocs));
          setDocuments(demoDocs);
        }
      }

      // Kredi bilgisini Firestore'dan yükle
      if (user) {
        try {
          await initializeDefaultData();
          const credit = await getUserCredit(user.uid);
          setUserCredit(credit);
          // %10 altı uyarı kontrolü
          if (credit.totalCredit > 0 && credit.remainingCredit <= credit.totalCredit * 0.1) {
            setShowCreditWarning(true);
          }
        } catch (e) {
          console.error("Kredi yükleme hatası:", e);
        }
      }
    };

    loadData();
    const savedTheme = localStorage.getItem('imar_theme');
    setIsDarkMode(savedTheme !== 'false');
  }, []);

  useEffect(() => {
    if (user) {
      getFavorites(user.uid).then(setFavorites).catch(console.error);
    } else {
      setFavorites([]);
    }
  }, [user]);

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
            const hasActive = libraryDocs.some(d => d.isActive);
            if (!hasActive) {
              const updatedDocs = libraryDocs.map(d =>
                d.id === 'auto-imar-kanunu' ? { ...d, isActive: true } : d
              );
              setDocuments(updatedDocs);
            } else {
              setDocuments(libraryDocs);
            }
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
              const demoDocs = generateDemoDocuments();
              for (const d of demoDocs) {
                await saveDocToLibrary(user.uid, d);
              }
              setDocuments(demoDocs);
            }
          }

          // 2. Kredi bilgisini yükle
          const credit = await getUserCredit(user.uid);
          setUserCredit(credit);
          if (credit.totalCredit > 0 && credit.remainingCredit <= credit.totalCredit * 0.1) {
            setShowCreditWarning(true);
          }

          // 3. Temiz sohbet
          setMessages([]);
        } catch (e) {
          console.error("Sync data error:", e);
        }
      } else {
        // Logout olduğunda local'e dön
        const savedDocs = localStorage.getItem('imar_docs');
        if (savedDocs) {
          try {
            const parsed: DocumentFile[] = JSON.parse(savedDocs);
            if (parsed.length > 0) {
              const hasActive = parsed.some(d => d.isActive);
              if (!hasActive) {
                const updatedParsed = parsed.map(d =>
                  d.id === 'auto-imar-kanunu' ? { ...d, isActive: true } : d
                );
                setDocuments(updatedParsed);
                localStorage.setItem('imar_docs', JSON.stringify(updatedParsed));
              } else {
                setDocuments(parsed);
              }
            } else {
              setDocuments(generateDemoDocuments());
            }
          } catch (e) { console.error(e) }
        } else {
          setDocuments(generateDemoDocuments());
        }
        setMessages([]);
        setUserCredit({ subscriptionPlan: 'free', totalCredit: 100, remainingCredit: 100, subscriptionStartDate: '', subscriptionEndDate: '', autoRenew: false });
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
        saveChatHistory(user.uid, messages, user.email || undefined, sessionId);
      }, 1000); // 1 saniye debounce (daha güvenilir)
      return () => clearTimeout(timer);
    }
  }, [messages, user, sessionId]);

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
            <div class="logo">⚖️ İmar Mevzuat</div>
            <div class="title">${pdfSettings.title}</div>
            <div class="date">${currentDate}</div>
          </div>
          <div class="messages">
            ${messagesHTML}
          </div>
          <div class="footer">
            İmar Mevzuat - Profesyonel Mevzuat Danışmanı
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

  const handleSummarize = async (docFile: DocumentFile) => {
    if (isTyping) return;

    // Kredi kontrolü
    if (user) {
      const creditCheck = await checkCredit(user.uid, 'document_summary');
      if (!creditCheck.sufficient) {
        alert(`Kredi yetersiz! Bu işlem ${creditCheck.cost} kredi gerektiriyor, kalan: ${creditCheck.remaining}`);
        return;
      }
    }

    setIsTyping(true);
    setIsMobileMenuOpen(false);
    const userMsg = { id: Date.now().toString(), role: 'user' as const, text: `${docFile.name} belgesini özetle.`, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    try {
      const summary = await geminiService.summarizeDocument(docFile);
      const aiMsg = { id: (Date.now() + 1).toString(), role: 'assistant' as const, text: summary, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);

      if (user) {
        const allMessages = [...messages, userMsg, aiMsg];
        await saveChatHistory(user.uid, allMessages, user.email || undefined, sessionId);
        // Kredi düş
        const result = await deductCredit(user.uid, 'document_summary');
        if (result.success) {
          setUserCredit(prev => ({ ...prev, remainingCredit: result.remainingCredit }));
        }
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant' as const, text: "Hata: " + e.message, timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, overrideQuery?: string) => {
    e?.preventDefault();
    const query = (overrideQuery || inputValue).trim();
    if (!query || isTyping) return;

    // Modül ID'sini belirle
    const moduleId = isGeneralMode ? 'web_search' : isDeepThinkMode ? 'deep_think' : 'chatbot';

    // Backend-first kredi kontrolü
    if (user) {
      const creditCheck = await checkCredit(user.uid, moduleId);
      if (!creditCheck.sufficient) {
        alert(`Kredi yetersiz! Bu işlem ${creditCheck.cost} kredi gerektiriyor, kalan krediniz: ${creditCheck.remaining}`);
        return;
      }
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      let responseText = "";
      let references: string[] | undefined;
      let webSources: { uri: string; title: string }[] | undefined;

      if (isGeneralMode) {
        const res = await geminiService.askGeneral(query, documents);
        responseText = res.text;
        references = res.sources.map((s: any) => s.web?.uri).filter(Boolean);
        webSources = res.sources
          .filter((s: any) => s.web?.uri)
          .map((s: any) => ({ uri: s.web.uri, title: s.web.title || new URL(s.web.uri).hostname }));
      } else if (isDeepThinkMode) {
        responseText = await geminiService.askDeepThink(query, documents, messages);
      } else {
        responseText = await geminiService.askQuestion(query, documents, messages);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: responseText,
        timestamp: new Date(),
        references,
        webSources
      };

      setMessages(prev => [...prev, aiMsg]);

      // Firestore'a AI yanıtı dahil tüm mesajları kaydet
      if (user) {
        const allMessages = [...messages, userMsg, aiMsg];
        await saveChatHistory(user.uid, allMessages, user.email || undefined, sessionId);
        console.log('[ChatHistory] Sohbet kaydedildi:', allMessages.length, 'mesaj');
      }

      // Atomic kredi düşümü (backend-first)
      if (user) {
        const result = await deductCredit(user.uid, moduleId);
        if (result.success) {
          setUserCredit(prev => ({ ...prev, remainingCredit: result.remainingCredit }));
          // %10 altı uyarı
          if (userCredit.totalCredit > 0 && result.remainingCredit <= userCredit.totalCredit * 0.1) {
            setShowCreditWarning(true);
          }
        }
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

    // Kredi kontrolü
    if (user) {
      const creditCheck = await checkCredit(user.uid, 'link_analysis');
      if (!creditCheck.sufficient) {
        alert(`Kredi yetersiz! Bu işlem ${creditCheck.cost} kredi gerektiriyor, kalan: ${creditCheck.remaining}`);
        return;
      }
    }

    setShowLinkModal(false);
    setIsTyping(true);
    const userMsg = { id: Date.now().toString(), role: 'user' as const, text: `Şu linkteki mevzuat değişikliğini analiz et: ${linkUrl}`, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const compareResult = await geminiService.compareLegislation(linkUrl, documents);
      const aiMsg = { id: (Date.now() + 1).toString(), role: 'assistant' as const, text: compareResult, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);

      if (user) {
        const allMessages = [...messages, userMsg, aiMsg];
        await saveChatHistory(user.uid, allMessages, user.email || undefined, sessionId);
        // Kredi düş
        const creditResult = await deductCredit(user.uid, 'link_analysis');
        if (creditResult.success) {
          setUserCredit(prev => ({ ...prev, remainingCredit: creditResult.remainingCredit }));
        }
      }
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant' as const,
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
        saveChatHistory(user.uid, messages, user.email || undefined, sessionId);
      }
      setMessages([]);
      setSessionId(Date.now().toString(36) + Math.random().toString(36).substr(2, 5));
    }
  };

  // Madde tıklama işleyicisi
  const handleMaddeClick = useCallback(async (maddeId: string) => {
    let madde = getMadde(maddeId);

    // ID'yi temizle
    const cleanedId = maddeId.replace(/MADDE:\s*/i, '').replace(/[\[\]]/g, '').trim();
    const parts = cleanedId.split('/');
    const maddeNo = parts.length > 1 && parts[0].length !== 4 ? parts[0] : parts.length > 1 ? parts[1] : parts[0];
    const kanunNo = parts.length > 1 && parts[0].length === 4 ? parts[0] : "3194";

    // Fıkra bilgisini ayıkla ("18, Fıkra 2" gibi)
    const fikraMatch = maddeNo.match(/^(.+?),\s*Fıkra\s*(\d+)/i);
    const cleanMaddeNo = fikraMatch ? fikraMatch[1].trim() : maddeNo;
    const fikraNo = fikraMatch ? fikraMatch[2] : null;
    const displayTitle = fikraNo ? `Madde ${cleanMaddeNo}, Fıkra ${fikraNo}` : `Madde ${cleanMaddeNo}`;

    if (!madde) {
      // Statik veritabanında yok → placeholder ile aç, sonra AI ile zenginleştir
      madde = {
        id: cleanedId,
        kanunNo: kanunNo,
        kanunAdi: "İmar Kanunu",
        maddeNo: cleanMaddeNo,
        baslik: displayTitle,
        icerik: "", // Boş bırak, AI dolduracak
        iliskiliMaddeler: [],
        anahtatKelimeler: [],
        sonGuncelleme: new Date().toLocaleDateString('tr-TR')
      };

      setSelectedMadde(madde);
      setShowMaddeModal(true);
      setIsLoadingMaddeAI(true);

      // AI ile madde içeriğini getir
      try {
        const aiContent = await geminiService.analyzeMadde(kanunNo, cleanMaddeNo, fikraNo);
        setSelectedMadde(prev => prev ? {
          ...prev,
          icerik: aiContent.icerik,
          anahtatKelimeler: aiContent.anahtarKelimeler || [],
          iliskiliMaddeler: aiContent.iliskiliMaddeler || []
        } : prev);
      } catch (e: any) {
        setSelectedMadde(prev => prev ? {
          ...prev,
          icerik: "Bu maddenin analizi şu an yapılamadı. Lütfen tekrar deneyin."
        } : prev);
      } finally {
        setIsLoadingMaddeAI(false);
      }
    } else {
      setSelectedMadde(madde);
      setShowMaddeModal(true);
    }
  }, [documents]);

  // İlişkili maddeye git
  const navigateToRelatedMadde = (maddeId: string) => {
    const madde = getMadde(maddeId);
    if (madde) {
      setSelectedMadde(madde);
    }
  };

  const renderText = (text: string) => {
    if (!text) return null;
    // AI bazen madde referanslarını kalın (**) içinde yazıyor — önce temizle
    const cleanedText = text.replace(/\*\*(\[MADDE:.*?\])\*\*/g, '$1');
    const parts = cleanedText.split(/(\[MADDE: .*?\]|\*\*.*?\*\*)/g);
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
                <h2 className="text-xl font-bold text-warm-50">{selectedMadde.baslik}</h2>
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
              {isLoadingMaddeAI ? (
                <div className="flex flex-col items-center justify-center py-12 text-warm-400 gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Brain size={24} className="text-purple-400 animate-pulse" />
                  </div>
                  <p className="text-sm font-medium">Madde analiz ediliyor...</p>
                  <p className="text-xs text-warm-600">Derin düşünce ile içerik hazırlanıyor</p>
                </div>
              ) : selectedMadde.icerik ? (
                <div className="text-warm-200 leading-relaxed whitespace-pre-wrap text-[14px]">
                  {selectedMadde.icerik.split(/\*\*(.*?)\*\*/g).map((part, i) =>
                    i % 2 === 1 ? <strong key={i} className="text-accent">{part}</strong> : part
                  )}
                </div>
              ) : (
                <div className="text-warm-500 text-sm italic">İçerik bulunamadı.</div>
              )}
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

    const [localGraphData, setLocalGraphData] = useState<{ nodes: any[], edges: any[] } | null>(null);
    const [isAnalyzingGraph, setIsAnalyzingGraph] = useState(false);
    const [selectedGraphDocId, setSelectedGraphDocId] = useState<string>("default");
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

    // Varsayılan veri (3194)
    const defaultGraph = useMemo(() => {
      const { nodes, edges } = getMevzuatGraph();
      return {
        nodes: nodes.map(n => ({ id: n.id, label: `Md. ${n.maddeNo}`, desc: n.baslik, full: n })),
        edges: edges
      };
    }, []);

    // Gösterilecek veri
    const displayData = localGraphData || defaultGraph;
    const graphNodes = displayData.nodes;
    const graphEdges = displayData.edges;

    // Geliştirilmiş layout hesaplama
    const CARD_W = 140;
    const CARD_H = 54;
    const H_GAP = 280;
    const V_GAP = 160;
    const PADDING = 80;
    const cols = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(graphNodes.length))));

    const nodePositions: Record<string, { x: number; y: number }> = {};
    graphNodes.forEach((node, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      // Satır kaydırması (honeycomb efekti) — çakışmayı önler
      const offsetX = row % 2 === 1 ? H_GAP / 2 : 0;
      nodePositions[node.id] = {
        x: PADDING + col * H_GAP + offsetX + CARD_W / 2,
        y: PADDING + row * V_GAP + CARD_H / 2
      };
    });

    const rows = Math.ceil(graphNodes.length / cols);
    const svgW = cols * H_GAP + PADDING * 2 + H_GAP / 2;
    const svgH = rows * V_GAP + PADDING * 2;

    // Hangi edge'ler hovered node'a bağlı?
    const connectedNodeIds = useMemo(() => {
      if (!hoveredNodeId) return new Set<string>();
      const ids = new Set<string>();
      ids.add(hoveredNodeId);
      graphEdges.forEach(e => {
        if (e.source === hoveredNodeId) ids.add(e.target);
        if (e.target === hoveredNodeId) ids.add(e.source);
      });
      return ids;
    }, [hoveredNodeId, graphEdges]);

    const handleAnalyzeGraph = async () => {
      if (selectedGraphDocId === "default") {
        setLocalGraphData(null);
        return;
      }

      const doc = documents.find(d => d.id === selectedGraphDocId);
      if (!doc) return;

      setIsAnalyzingGraph(true);
      try {
        const result = await geminiService.extractGraphFromText(doc.content);
        if (result.nodes.length > 0) {
          setLocalGraphData(result);
        } else {
          alert("Bu belgeden ilişki grafiği çıkarılamadı.");
        }
      } catch (error: any) {
        alert("Analiz hatası: " + error.message);
      } finally {
        setIsAnalyzingGraph(false);
      }
    };

    // Bezier curve path oluştur (edge'ler için)
    const getEdgePath = (sx: number, sy: number, tx: number, ty: number) => {
      const dx = tx - sx;
      const dy = ty - sy;
      // Dikey mesafe fazlaysa dikey eğri, yoksa yatay eğri
      if (Math.abs(dy) > Math.abs(dx)) {
        const cp = Math.abs(dy) * 0.3;
        return `M ${sx} ${sy} C ${sx} ${sy + cp}, ${tx} ${ty - cp}, ${tx} ${ty}`;
      } else {
        const cp = Math.abs(dx) * 0.3;
        return `M ${sx} ${sy} C ${sx + cp} ${sy}, ${tx - cp} ${ty}, ${tx} ${ty}`;
      }
    };

    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center modal-overlay p-4" onClick={() => setShowKnowledgeGraph(false)}>
        <div
          className="bg-dark-tertiary border border-dark-border w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 rounded-xl flex items-center justify-center text-accent flex-shrink-0">
                <GitBranch size={20} />
              </div>
              <div>
                <h3 className="font-bold text-warm-50">Mevzuat İlişki Grafiği</h3>
                <p className="text-xs text-warm-500">Madde üzerine gelin → bağlantıları görün</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <select
                value={selectedGraphDocId}
                onChange={(e) => setSelectedGraphDocId(e.target.value)}
                className="bg-dark-surface border border-dark-border text-warm-50 text-xs rounded-xl px-3 py-2 outline-none focus:border-accent/50 max-w-[220px] truncate"
              >
                <option value="default">Varsayılan (3194 İmar Kanunu)</option>
                {documents.map(d => (
                  <option key={d.id} value={d.id}>{d.name.length > 35 ? d.name.substring(0, 35) + '…' : d.name}</option>
                ))}
              </select>

              <button
                onClick={handleAnalyzeGraph}
                disabled={isAnalyzingGraph || (selectedGraphDocId === "default" && !localGraphData)}
                className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"
              >
                {isAnalyzingGraph ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {selectedGraphDocId === "default" ? "Varsayılanı Yükle" : "Analiz Et"}
              </button>

              <button
                onClick={() => setShowKnowledgeGraph(false)}
                className="p-2 hover:bg-dark-surface rounded-xl transition-colors"
              >
                <X size={20} className="text-warm-400" />
              </button>
            </div>
          </div>

          {/* Graph Area */}
          <div className="flex-1 overflow-auto bg-dark-primary relative min-h-[450px]">
            {isAnalyzingGraph ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-warm-400 gap-3">
                <Loader2 size={32} className="animate-spin text-accent" />
                <p className="text-sm font-medium">Yapay zeka mevzuatı analiz ediyor...</p>
                <p className="text-xs text-warm-600">Bu işlem belgenin boyutuna göre zaman alabilir.</p>
              </div>
            ) : graphNodes.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-warm-500">
                <GitBranch size={40} className="mb-3 opacity-30" />
                <p className="text-sm">Gösterilecek veri bulunamadı.</p>
                <p className="text-xs text-warm-600 mt-1">Kütüphaneden bir belge seçip "Analiz Et" butonuna basın.</p>
              </div>
            ) : (
              <div className="p-4">
                <svg
                  viewBox={`0 0 ${svgW} ${svgH}`}
                  width="100%"
                  height={Math.max(svgH, 400)}
                  className="mx-auto"
                  style={{ maxWidth: `${svgW}px` }}
                >
                  {/* Grid pattern arka plan */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isDarkMode ? '#1f1d2a' : '#f0e8e0'} strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" rx="12" />

                  {/* Edges (Bezier curves) */}
                  {graphEdges.map((edge, i) => {
                    const sourcePos = nodePositions[edge.source];
                    const targetPos = nodePositions[edge.target];
                    if (!sourcePos || !targetPos) return null;

                    const isHighlighted = hoveredNodeId && (edge.source === hoveredNodeId || edge.target === hoveredNodeId);
                    const isFaded = hoveredNodeId && !isHighlighted;

                    const path = getEdgePath(sourcePos.x, sourcePos.y, targetPos.x, targetPos.y);
                    const midX = (sourcePos.x + targetPos.x) / 2;
                    const midY = (sourcePos.y + targetPos.y) / 2;

                    return (
                      <g key={`edge-${i}`} style={{ opacity: isFaded ? 0.15 : 1, transition: 'opacity 0.3s' }}>
                        <path
                          d={path}
                          fill="none"
                          stroke={isHighlighted ? (isDarkMode ? '#e8734a' : '#c4501a') : (isDarkMode ? '#3d3148' : '#d4c4b8')}
                          strokeWidth={isHighlighted ? 2.5 : 1.2}
                          strokeDasharray={isHighlighted ? 'none' : '6 3'}
                          className="transition-all duration-300"
                        />
                        {/* İlişki etiketi */}
                        {edge.relation && (
                          <g>
                            <rect
                              x={midX - 24} y={midY - 8} width="48" height="16" rx="4"
                              fill={isDarkMode ? '#1a1825' : '#faf6f2'}
                              stroke={isDarkMode ? '#2d2a35' : '#e8ddd4'}
                              strokeWidth="0.5"
                              opacity="0.95"
                            />
                            <text
                              x={midX} y={midY + 3}
                              textAnchor="middle"
                              fontSize="8"
                              fontWeight="600"
                              fill={isDarkMode ? '#8b7b94' : '#9a8b7a'}
                            >
                              {edge.relation.length > 8 ? edge.relation.substring(0, 8) + '..' : edge.relation}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Nodes (Rounded Rectangle Cards) */}
                  {graphNodes.map((node) => {
                    const pos = nodePositions[node.id];
                    if (!pos) return null;

                    const nx = pos.x - CARD_W / 2;
                    const ny = pos.y - CARD_H / 2;
                    const isHovered = hoveredNodeId === node.id;
                    const isConnected = connectedNodeIds.has(node.id);
                    const isFaded = hoveredNodeId && !isConnected;

                    return (
                      <g
                        key={`node-${node.id}`}
                        className="cursor-pointer"
                        style={{ opacity: isFaded ? 0.2 : 1, transition: 'opacity 0.3s, transform 0.2s' }}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        onClick={() => {
                          if (node.full) {
                            setSelectedMadde(node.full);
                            setShowKnowledgeGraph(false);
                            setShowMaddeModal(true);
                          } else {
                            alert(`${node.label || node.id}\n\n${node.desc || ''}`);
                          }
                        }}
                      >
                        {/* Glow efekt (hover) */}
                        {isHovered && (
                          <rect
                            x={nx - 4} y={ny - 4}
                            width={CARD_W + 8} height={CARD_H + 8}
                            rx="16"
                            fill="none"
                            stroke={isDarkMode ? '#e8734a' : '#c4501a'}
                            strokeWidth="1"
                            opacity="0.4"
                          />
                        )}
                        {/* Kart arkaplanı */}
                        <rect
                          x={nx} y={ny}
                          width={CARD_W} height={CARD_H}
                          rx="12"
                          fill={isHovered
                            ? (isDarkMode ? '#3a2f20' : '#fef3ec')
                            : isConnected && hoveredNodeId
                              ? (isDarkMode ? '#2d2535' : '#fff8f3')
                              : (isDarkMode ? '#1e1c28' : '#fdfaf7')
                          }
                          stroke={isHovered
                            ? (isDarkMode ? '#e8734a' : '#c4501a')
                            : isConnected && hoveredNodeId
                              ? (isDarkMode ? '#6b4a3a' : '#d4a080')
                              : (isDarkMode ? '#2d2a35' : '#e4d8d0')
                          }
                          strokeWidth={isHovered ? 2 : 1}
                          className="transition-all duration-200"
                        />
                        {/* Sol accent çizgisi */}
                        <rect
                          x={nx} y={ny}
                          width="4" height={CARD_H}
                          rx="2"
                          fill={isHovered ? (isDarkMode ? '#e8734a' : '#c4501a') : (isDarkMode ? '#3a3545' : '#d4c4b8')}
                        />
                        {/* Başlık (label) */}
                        <text
                          x={nx + 14} y={ny + 20}
                          fontSize="11"
                          fontWeight="700"
                          fill={isHovered ? (isDarkMode ? '#f0a070' : '#b84a10') : (isDarkMode ? '#e5e7eb' : '#3a3020')}
                          className="pointer-events-none"
                        >
                          {(node.label || node.id).length > 18 ? (node.label || node.id).substring(0, 18) + '…' : (node.label || node.id)}
                        </text>
                        {/* Açıklama (desc) */}
                        <text
                          x={nx + 14} y={ny + 37}
                          fontSize="9"
                          fill={isDarkMode ? '#6b7280' : '#9a8b7a'}
                          className="pointer-events-none"
                        >
                          {node.desc ? (node.desc.length > 20 ? node.desc.substring(0, 20) + '…' : node.desc) : ''}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-5 text-[10px] text-warm-500">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-3.5 rounded border bg-dark-surface" style={{ borderColor: isDarkMode ? '#2d2a35' : '#e4d8d0' }}></div>
                <span>Madde</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="20" height="8"><path d="M 0 4 Q 10 0 20 4" fill="none" stroke={isDarkMode ? '#3d3148' : '#d4c4b8'} strokeWidth="1.2" strokeDasharray="4 2" /></svg>
                <span>Atıf</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-3.5 rounded border-2" style={{ borderColor: isDarkMode ? '#e8734a' : '#c4501a', background: 'transparent' }}></div>
                <span>Seçili / İlişkili</span>
              </div>
            </div>
            <span className="text-[10px] text-warm-600">{graphNodes.length} madde · {graphEdges.length} bağlantı</span>
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
        <div className="h-14 flex items-center justify-center border-b border-dark-border flex-shrink-0">
          {expanded ? (
            <div className="flex items-center justify-between w-full px-1">
              <div className="flex items-center gap-3">
                <button onClick={() => !isMobile && setIsSidebarExpanded(false)} className="sidebar-logo-btn" title="Sidebar'ı Daralt">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-lg shadow-accent/20 flex-shrink-0">
                    <Scale size={18} className="text-white" />
                  </div>
                </button>
                <span className="sidebar-label font-extrabold tracking-tight text-[15px] text-warm-50">İmar Mevzuat</span>
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
            <>
              <button onClick={() => { setShowHistoryModal(true); setIsMobileMenuOpen(false); }} className="sidebar-nav-item" data-tip="Sohbet Geçmişi">
                <History size={20} className="nav-icon flex-shrink-0" />
                <span className="sidebar-label">Sohbet Geçmişi</span>
              </button>
              <button onClick={() => { setShowFavoritesModal(true); setIsMobileMenuOpen(false); }} className="sidebar-nav-item" data-tip="Favorilerim">
                <Star size={20} className="nav-icon flex-shrink-0" />
                <span className="sidebar-label">Favorilerim</span>
              </button>
            </>
          )}

          <button onClick={() => setShowKnowledgeGraph(true)} className="sidebar-nav-item" data-tip="Mevzuat Grafiği">
            <GitBranch size={20} className="nav-icon flex-shrink-0" />
            <span className="sidebar-label">Mevzuat Grafiği</span>
          </button>

          <button onClick={() => setShowLinkModal(true)} className="sidebar-nav-item" data-tip="Mevzuat Karşılaştır" data-tour-id="tour-compare-btn">
            <Globe size={20} className="nav-icon flex-shrink-0" />
            <span className="sidebar-label">Mevzuat Karşılaştır</span>
          </button>

          <button onClick={() => { setShowResmiGazeteModal(true); setIsMobileMenuOpen(false); }} className="sidebar-nav-item" data-tip="Resmi Gazete Takip">
            <ScrollText size={20} className="nav-icon flex-shrink-0" />
            <span className="sidebar-label">Resmi Gazete</span>
          </button>

          {isAdmin && (
            <button onClick={() => { setShowAdminPanel(true); setIsMobileMenuOpen(false); }} className="sidebar-nav-item" data-tip="Admin Paneli">
              <Shield size={20} className="nav-icon flex-shrink-0" />
              <span className="sidebar-label">Admin Paneli</span>
            </button>
          )}
          <button onClick={() => { setShowHelpCenter(true); setIsMobileMenuOpen(false); }} className="sidebar-nav-item" data-tip="Kullanım Rehberi">
            <HelpCircle size={20} className="nav-icon flex-shrink-0" />
            <span className="sidebar-label">Kullanım Rehberi</span>
          </button>
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
              <span className="text-[10px] font-bold text-warm-500 uppercase tracking-widest" data-tour-id="tour-library-title">Kütüphane</span>
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
                      <div onClick={() => saveDocuments(documents.map(d => d.id === doc.id ? { ...d, isActive: !d.isActive } : d))} className="mt-0.5 cursor-pointer flex-shrink-0" data-tour-id={doc === filteredDocuments[0] ? 'tour-doc-toggle' : undefined}>
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
            <button onClick={() => fileInputRef.current?.click()} data-tour-id="tour-upload-btn" className="w-full bg-gradient-to-r from-accent to-accent-dark hover:from-accent-hover hover:to-accent text-white py-2.5 rounded-xl shadow-lg shadow-accent/15 flex items-center justify-center gap-2 text-xs font-bold transition-all hover:shadow-accent/25 active:scale-[0.98]">
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
        <header className="h-14 flex items-center justify-between px-4 lg:px-6 z-10 flex-shrink-0 border-b border-dark-border">
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
            {/* Kredi Göstergesi - Header'da */}
            <div className={`flex items-center gap-2 px-3 py-2 bg-dark-surface border rounded-xl transition-all ${userCredit.remainingCredit <= 0 ? 'border-red-500/50' :
              userCredit.totalCredit > 0 && userCredit.remainingCredit <= userCredit.totalCredit * 0.1 ? 'border-amber-500/50' :
                'border-dark-border'
              }`}>
              <span className="text-[10px] font-semibold text-warm-400">Kredi</span>
              <div className="w-16 h-1.5 bg-dark-elevated rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${userCredit.remainingCredit <= 0 ? 'bg-red-500' :
                  userCredit.totalCredit > 0 && userCredit.remainingCredit <= userCredit.totalCredit * 0.1 ? 'bg-gradient-to-r from-amber-500 to-red-500' :
                    'bg-gradient-to-r from-accent to-accent-dark'
                  }`} style={{ width: `${userCredit.totalCredit > 0 ? Math.min(100, (userCredit.remainingCredit / userCredit.totalCredit) * 100) : 0}%` }}></div>
              </div>
              <span className={`text-[10px] font-bold ${userCredit.remainingCredit <= 0 ? 'text-red-400' :
                userCredit.totalCredit > 0 && userCredit.remainingCredit <= userCredit.totalCredit * 0.1 ? 'text-amber-400' :
                  'text-accent'
                }`}>{userCredit.remainingCredit}/{userCredit.totalCredit}</span>
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
              id="tour-web-toggle"
              data-tour-id="tour-web-toggle"
              onClick={() => setIsGeneralMode(!isGeneralMode)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all border ${isGeneralMode ? 'bg-accent/15 text-accent border-accent/30' : 'bg-dark-surface text-warm-300 border-dark-border hover:bg-dark-surface-hover hover:text-warm-50'}`}
            >
              <Globe size={14} />
              <span className="hidden sm:inline">Web {isGeneralMode ? 'Açık' : 'Kapalı'}</span>
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center gap-1.5 p-2 rounded-xl text-[11px] font-semibold transition-all bg-dark-surface text-warm-300 border border-dark-border hover:bg-dark-surface-hover hover:text-warm-50"
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-400" />}
            </button>
          </div>
        </header>

        {/* Düşük Kredi Uyarı Banner */}
        {showCreditWarning && userCredit.remainingCredit > 0 && (
          <div className="mx-4 lg:mx-6 mt-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between z-10 animate-in">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-400 shrink-0" />
              <span className="text-[11px] font-semibold text-amber-300">
                Krediniz azalıyor! Kalan: <span className="font-black">{userCredit.remainingCredit}</span> / {userCredit.totalCredit}
              </span>
            </div>
            <button onClick={() => setShowCreditWarning(false)} className="text-amber-500 hover:text-amber-300 transition-colors p-1">
              <X size={14} />
            </button>
          </div>
        )}
        {userCredit.remainingCredit <= 0 && (
          <div className="mx-4 lg:mx-6 mt-2 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 z-10 animate-in">
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <span className="text-[11px] font-semibold text-red-300">
              Krediniz tükendi! Soru sormak veya modül kullanmak için kredi satın almanız gerekmektedir.
            </span>
          </div>
        )}

        {/* Chat Content Area */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 space-y-4 lg:space-y-5 custom-scrollbar overscroll-contain z-10">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center pt-8 lg:pt-20 text-center max-w-2xl mx-auto px-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl" data-tour-id="tour-prompt-cards">
                {(() => {
                  const hasCustomDocs = documents.some(d => d.id !== 'demo-3194-sample-kanun' && d.isActive);
                  const activeDocsCount = documents.filter(d => d.isActive).length;

                  let cards = [];
                  if (activeDocsCount === 0) {
                    cards = [
                      {
                        title: "Genel Soru",
                        q: "İmar Kanunu nedir ve amacı nedir?",
                        desc: "Seçili belge yok, genel bilgilerimle yanıt vereceğim.",
                        icon: <Globe size={18} />, color: "text-amber-400", bg: "bg-amber-500/5", border: "hover:border-amber-500/30"
                      },
                      {
                        title: "Web Araması",
                        q: "2024 yılı güncel imar belgeleri haberleri var mı?",
                        desc: "Web arama modunu açarak internette güncel mevzuat taraması yapın.",
                        icon: <Search size={18} />, color: "text-blue-400", bg: "bg-blue-500/5", border: "hover:border-blue-500/30"
                      },
                      {
                        title: "Biliyor muydunuz?",
                        q: "Ruhsatsız bir yapının yıkım kararı nasıl alınır?",
                        desc: "Genel hukuki tecrübem ile size sürecin işleyişini anlatayım.",
                        icon: <Brain size={18} />, color: "text-purple-400", bg: "bg-purple-500/5", border: "hover:border-purple-500/30"
                      }
                    ];
                  } else if (hasCustomDocs) {
                    cards = [
                      {
                        title: "Belge Özeti",
                        q: "Yüklediğim belgelerin kapsamlı bir özetini çıkarır mısın?",
                        desc: "Yüklediğiniz mevzuat belgelerinin genel analizini yapın.",
                        icon: <FileText size={18} />, color: "text-indigo-400", bg: "bg-indigo-500/5", border: "hover:border-indigo-500/30"
                      },
                      {
                        title: "Kritik Hususlar",
                        q: "Bu belgelerde dikkat etmem gereken zorunluluklar veya tarihler nelerdir?",
                        desc: "Belge içindeki hukuki süreleri ve yaptırımları bulun.",
                        icon: <Clock size={18} />, color: "text-emerald-400", bg: "bg-emerald-500/5", border: "hover:border-emerald-500/30"
                      },
                      {
                        title: "Risk Analizi",
                        q: "Belgedeki hükümlere uymamanın yasal yaptırımları nelerdir?",
                        desc: "Mevzuattaki riskleri detaylandırır.",
                        icon: <AlertTriangle size={18} />, color: "text-rose-400", bg: "bg-rose-500/5", border: "hover:border-rose-500/30"
                      }
                    ];
                  } else {
                    cards = [
                      {
                        title: "Hızlı Senaryo 1",
                        q: "3194 Sayılı Kanun 18. fıkrasına göre DOP oranı nedir?",
                        desc: "Madde-18 (Arazi Düzenlemesi) üzerinden hızlı test yapın.",
                        icon: <BookOpen size={18} />, color: "text-blue-400", bg: "bg-blue-500/5", border: "hover:border-blue-500/30"
                      },
                      {
                        title: "Hızlı Senaryo 2",
                        q: "Bina derinliği ve çekme mesafesi yönetmeliği nedir?",
                        desc: "Yüklenen mevzuat üzerinden teknik detayları sorgulayın.",
                        icon: <Scale size={18} />, color: "text-purple-400", bg: "bg-purple-500/5", border: "hover:border-purple-500/30"
                      },
                      {
                        title: "Hızlı Senaryo 3",
                        q: "İmar para cezası 2024 yılı için nasıl hesaplanır?",
                        desc: "42. madde kapsamındaki cezai işlemleri analiz edin.",
                        icon: <Gavel size={18} />, color: "text-emerald-400", bg: "bg-emerald-500/5", border: "hover:border-emerald-500/30"
                      }
                    ];
                  }

                  return cards.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setInputValue(item.q)}
                      className={`flex flex-col p-5 bg-dark-secondary ${item.bg} border border-dark-border ${item.border} rounded-2xl text-left transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-dark-surface border border-dark-border group-hover:scale-110 transition-transform ${item.color}`}>
                        {item.icon}
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-warm-500 mb-1">{item.title}</h4>
                      <p className="text-[13px] font-bold text-warm-100 mb-2 leading-tight group-hover:text-accent transition-colors">{item.q}</p>
                      <p className="text-[11px] text-warm-500 leading-snug">{item.desc}</p>
                    </button>
                  ));
                })()}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
                <div className={`group max-w-[90%] lg:max-w-[75%] rounded-2xl px-4 lg:px-5 py-3 lg:py-4 relative ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-accent to-accent-dark text-white shadow-lg shadow-accent/10'
                  : 'bg-dark-surface border border-dark-border text-warm-100'
                  }`}>
                  <div className={`flex items-center justify-between gap-2 mb-2 text-[8px] font-bold uppercase tracking-widest ${msg.role === 'user' ? 'text-white/50' : 'text-warm-500'}`}>
                    <div className="flex items-center gap-2">
                      {msg.role === 'user' ? <Zap size={10} /> : (msg.text.startsWith('🧠') ? <Brain size={10} className="text-purple-600 dark:text-purple-400" /> : <ShieldCheck size={10} className="text-green-600 dark:text-green-400" />)}
                      <span>{msg.role === 'user' ? 'SORU' : (msg.text.startsWith('🧠') ? 'DERİN ANALİZ' : 'MEVZUAT YANITI')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => handleToggleFavorite(msg)}
                          className={`p-1.5 -mr-0.5 -mt-1 rounded-lg transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:bg-dark-elevated text-warm-400 hover:text-yellow-500`}
                          title={favorites.some(f => f.id === msg.id) ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                        >
                          <Star size={14} className={favorites.some(f => f.id === msg.id) ? "fill-yellow-500 text-yellow-500" : ""} />
                        </button>
                      )}
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className={`p-1.5 -mr-1.5 -mt-1 rounded-lg transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 ${msg.role === 'user' ? 'hover:bg-white/10 text-white/70 hover:text-white' : 'hover:bg-dark-elevated text-warm-400 hover:text-warm-100'}`}
                        title="Kopyala"
                      >
                        {copiedMessageId === msg.id ? <Check size={14} className={msg.role === 'user' ? "text-white" : "text-green-500"} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="text-[12px] lg:text-[13px] leading-relaxed whitespace-pre-wrap font-medium">
                    {msg.role === 'assistant' ? (
                      <div className="space-y-4">
                        <div>{renderText(msg.text)}</div>
                        {msg.webSources && msg.webSources.length > 0 ? (
                          <div className="mt-4 pt-4 border-t border-accent/20">
                            <div className="flex items-center gap-2 mb-3">
                              <Globe size={12} className="text-accent" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-accent">Web Kaynakları</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {msg.webSources.map((src, i) => (
                                <a
                                  key={i}
                                  href={src.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent/25 rounded-xl text-[11px] font-bold text-accent hover:bg-accent/20 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 transition-all duration-200"
                                >
                                  <ExternalLink size={12} className="shrink-0 group-hover:scale-110 transition-transform" />
                                  <span className="truncate max-w-[200px]">{src.title}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        ) : msg.references && msg.references.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-accent/20">
                            <div className="flex items-center gap-2 mb-3">
                              <Globe size={12} className="text-accent" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-accent">Web Kaynakları</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {msg.references.map((r, i) => (
                                <a key={i} href={r} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent/25 rounded-xl text-[11px] font-bold text-accent hover:bg-accent/20 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 transition-all duration-200">
                                  <ExternalLink size={12} className="shrink-0 group-hover:scale-110 transition-transform" />
                                  <span className="truncate max-w-[200px]">{(() => { try { return new URL(r).hostname; } catch { return `Kaynak ${i + 1}`; } })()}</span>
                                </a>
                              ))}
                            </div>
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
              <div className={`rounded-2xl px-5 py-4 border flex items-center gap-3 ${isDeepThinkMode
                ? 'bg-purple-100 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/30'
                : 'bg-dark-surface border-dark-border'
                }`}>
                {isDeepThinkMode
                  ? <Brain size={16} className="text-purple-700 dark:text-purple-400 animate-pulse" />
                  : <Loader2 size={16} className="text-accent animate-spin" />
                }
                <span
                  key={typingMessageIndex}
                  className={`text-sm font-medium animate-in ${isDeepThinkMode ? 'text-purple-800 dark:text-purple-300' : 'text-warm-300'
                    }`}
                >
                  {isDeepThinkMode
                    ? deepThinkTypingMessages[typingMessageIndex % deepThinkTypingMessages.length]
                    : normalTypingMessages[typingMessageIndex % normalTypingMessages.length]
                  }
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input - Glassmorphism */}
        <div className="chat-input-wrapper p-3 lg:p-5 z-10" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)' }}>
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative">
            {/* Deep Think Toast */}
            {showDeepThinkToast && (
              <div className={`absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 z-20 animate-in shadow-lg whitespace-nowrap ${isDarkMode ? 'bg-purple-900/80 text-purple-200 border border-purple-700/50' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                <Brain size={14} /> Derin Düşünce modu aktif — Gelişmiş muhakeme ve çok adımlı analiz
              </div>
            )}
            <div className={`relative bg-dark-surface border rounded-2xl overflow-hidden transition-all focus-within:border-accent/40 focus-within:shadow-[0_0_0_3px_rgba(196,80,26,0.1)] flex items-end ${isListening ? 'border-red-500/60 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' : isDeepThinkMode ? 'border-purple-500/40 shadow-[0_0_0_3px_rgba(147,51,234,0.1)]' : 'border-dark-border'}`}>
              <textarea
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (inputValue.trim() && !isTyping) {
                      e.currentTarget.form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                      // Reset height after submit
                      e.currentTarget.style.height = 'auto';
                    }
                  }
                }}
                rows={1}
                placeholder={isListening ? 'Dinleniyor... Konuşun' : 'İmar mevzuatı hakkında soru sorun...'}
                disabled={isTyping}
                className="w-full bg-transparent pl-5 pr-24 py-4 text-sm text-warm-50 placeholder-warm-600 focus:outline-none disabled:opacity-50 resize-none overflow-y-auto min-h-[52px]"
                style={{ maxHeight: '150px' }}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                {/* Deep Think Toggle */}
                <button
                  type="button"
                  id="tour-deep-think"
                  data-tour-id="tour-deep-think"
                  onClick={() => {
                    const newState = !isDeepThinkMode;
                    setIsDeepThinkMode(newState);
                    if (newState) {
                      setShowDeepThinkToast(true);
                      setTimeout(() => setShowDeepThinkToast(false), 3000);
                    } else {
                      setShowDeepThinkToast(false);
                    }
                  }}
                  disabled={isTyping}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-20 ${isDeepThinkMode
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                    : 'text-warm-400 hover:text-warm-50 hover:bg-dark-elevated'
                    }`}
                  title={isDeepThinkMode ? 'Derin Düşünce Kapalı' : 'Derin Düşünce Aç'}
                >
                  <Brain size={16} />
                </button>
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
          <div className="mt-2 text-center text-[10px] text-warm-600 font-medium min-h-[15px] transition-all duration-300">
            {isGeneralMode && isDeepThinkMode
              ? "Hem web kaynaklarını hem belgelerinizi birleştirerek derin hukuki analiz yapar"
              : isGeneralMode
                ? "Tüm web'i tarayarak güncel mevzuat ve içtihatlarda arama yapar"
                : isDeepThinkMode
                  ? "Belgeleriniz üzerinde çok adımlı hukuki muhakeme ve detaylı analiz yapar"
                  : "Yüklediğiniz mevzuat belgeleri üzerinden arama yapar"}
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
                data-tour-id="tour-compare-input"
                className="w-full bg-dark-surface border border-dark-border focus:border-emerald-500/40 rounded-xl px-4 py-3 text-sm focus:outline-none text-warm-50 placeholder-warm-600 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleLinkComparison()}
              />
            </div>

            <button
              onClick={handleLinkComparison}
              disabled={!linkUrl.trim()}
              data-tour-id="tour-compare-submit"
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

      {/* Official Gazette Modal */}
      <OfficialGazetteModal isOpen={showResmiGazeteModal} onClose={() => setShowResmiGazeteModal(false)} />

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

      {showFavoritesModal && (
        <FavoritesModal
          show={showFavoritesModal}
          onClose={() => setShowFavoritesModal(false)}
          favorites={favorites}
          onRemoveFavorite={async (id) => {
            if (user) {
              await deleteFavorite(user.uid, id);
              setFavorites(prev => prev.filter(f => f.id !== id));
            }
          }}
          renderText={renderText}
        />
      )}

      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      <PDFSettingsModal />

      {/* Help Center Modal */}
      <HelpCenterModal
        isOpen={showHelpCenter}
        onClose={() => setShowHelpCenter(false)}
        onSelectTour={(tType) => {
          setActiveTour(tType);
          setShowHelpCenter(false);
          setShowOnboarding(true);
        }}
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={showOnboarding}
        tourType={activeTour}
        onClose={() => setShowOnboarding(false)}
        onExpandSidebar={() => setIsSidebarExpanded(true)}
      />
    </div >
  );
};

const AppRouter: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'landing' | 'login' | 'app' | 'legal' | 'article' | 'blog'>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/makale/')) return 'article';
    if (path.startsWith('/makaleler')) return 'blog';
    return 'landing';
  });
  const [currentArticle, setCurrentArticle] = useState<string>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/makale/')) return path.replace('/makale/', '');
    return '';
  });
  const [legalTab, setLegalTab] = useState('teslimat');

  // Kullanıcı login sayfasındayken giriş yaparsa → app'e yönlendir
  // Kullanıcı çıkış yaparsa → landing'e dön
  useEffect(() => {
    if (user && currentPage === 'login') {
      setCurrentPage('app');
      window.history.pushState({}, '', '/');
    } else if (!user && !loading && currentPage === 'app') {
      setCurrentPage('landing');
      window.history.pushState({}, '', '/');
    }
  }, [user, loading, currentPage]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/makale/')) {
        setCurrentArticle(path.replace('/makale/', ''));
        setCurrentPage('article');
      } else if (path.startsWith('/makaleler')) {
        setCurrentPage('blog');
      } else if (path.startsWith('/legal/')) {
        setLegalTab(path.replace('/legal/', ''));
        setCurrentPage('legal');
      } else {
        setCurrentPage('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // "Hemen Başlayın" tıklandığında: giriş yapmışsa app'e, yapmamışsa login'e
  const handleGetStarted = () => {
    if (user) {
      setCurrentPage('app');
    } else {
      setCurrentPage('login');
    }
  };

  const handleOpenLegal = (tab: string) => {
    setLegalTab(tab);
    setCurrentPage('legal');
    window.history.pushState({}, '', `/legal/${tab}`);
  };

  const handleReadArticle = (slug: string) => {
    setCurrentArticle(slug);
    setCurrentPage('article');
    window.history.pushState({}, '', `/makale/${slug}`);
  };

  const handleOpenBlog = () => {
    setCurrentPage('blog');
    window.history.pushState({}, '', `/makaleler`);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-screen-inner">
          <div className="loading-logo">
            <Scale size={32} className="text-white" />
          </div>
          <div className="loading-spinner" />
          <p className="loading-text">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  let pageContent;
  switch (currentPage) {
    case 'landing':
      pageContent = <LandingPage onGetStarted={handleGetStarted} onOpenLegal={handleOpenLegal} onReadArticle={handleReadArticle} onOpenBlog={handleOpenBlog} />;
      break;
    case 'login':
      pageContent = <LoginPage onBack={() => setCurrentPage('landing')} />;
      break;
    case 'legal':
      pageContent = <LegalPage onBack={() => setCurrentPage('landing')} initialTab={legalTab} />;
      break;
    case 'article':
      pageContent = <ArticlePage onBack={() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          setCurrentPage('landing');
          window.history.pushState({}, '', '/');
        }
      }} slug={currentArticle} />;
      break;
    case 'blog':
      pageContent = <BlogPage onBack={() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          setCurrentPage('landing');
          window.history.pushState({}, '', '/');
        }
      }} onReadArticle={handleReadArticle} />;
      break;
    case 'app':
      pageContent = <ImarApp />;
      break;
    default:
      pageContent = <LandingPage onGetStarted={handleGetStarted} onOpenLegal={handleOpenLegal} onReadArticle={handleReadArticle} onOpenBlog={handleOpenBlog} />;
      break;
  }

  return (
    <>
      {pageContent}
      <CookieBanner onOpenLegal={handleOpenLegal} />
    </>
  );
};


const App: React.FC = () => (
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);

export default App;
