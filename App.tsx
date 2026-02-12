
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  FileText, Send, Trash2, Plus, BookOpen, Loader2, Scale,
  ShieldCheck, Sun, Moon, CheckSquare,
  Square, Globe, ExternalLink, Zap, Sparkles, Key, AlertTriangle, Home, RotateCcw,
  ChevronRight, X, Download, Search, Menu, Link2, GitBranch, Gavel, ArrowRight, Hash
} from 'lucide-react';
import { DocumentFile, Message } from './types';
import { parseFile, formatBytes } from './utils/fileParser';
import { geminiService } from './services/geminiService';
import { getMadde, getAllMaddeler, MevzuatMaddesi, getMevzuatGraph } from './data/mevzuatVeritabani';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { HistoryModal } from './components/HistoryModal';
import { AdminPanel } from './components/AdminPanel';
import { db, saveChatHistory } from './services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User, LogOut, LogIn, Clock, History, Shield } from 'lucide-react';

const DAILY_LIMIT = 50;

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
        // Kullanıcı giriş yapmışsa Firestore'dan çek
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().documents) {
            setDocuments(docSnap.data().documents);
          } else {
            // Firestore boşsa ve localde veri varsa, opsiyonel olarak merge edilebilir
            // Şimdilik boş bırakıyoruz veya local'den başlatmıyoruz temiz bir sayfa için
            // Ancak kullanıcı deneyimi için, boşsa localdekileri oraya aktarmak mantıklı olabilir.
            // Bu örnekte sadece Firestore'u baz alıyoruz.
            setDocuments([]);
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
    };

    loadData();
    const savedTheme = localStorage.getItem('imar_theme');
    setIsDarkMode(savedTheme !== 'false');

    const today = new Date().toDateString();
    const savedUsage = localStorage.getItem('imar_usage_data');
    if (savedUsage) {
      const { date, count } = JSON.parse(savedUsage);
      if (date === today) setUsageCount(count);
      else setUsageCount(0);
    }
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
  const saveDocuments = async (newDocs: DocumentFile[]) => {
    setDocuments(newDocs);

    if (user) {
      // Cloud'a kaydet
      try {
        await setDoc(doc(db, "users", user.uid), { documents: newDocs }, { merge: true });
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

    // Usage
    const today = new Date().toDateString();
    const savedUsage = localStorage.getItem('imar_usage_data');
    if (savedUsage) {
      const { date, count } = JSON.parse(savedUsage);
      if (date === today) setUsageCount(count);
      else setUsageCount(0);
    }
  }, []);

  // User auth state değişince verileri güncelle
  useEffect(() => {
    const syncData = async () => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().documents) {
            setDocuments(docSnap.data().documents);
          } else {
            // Yeni kullanıcı veya boş veri
            // Eğer localde veri varsa ve cloud boşsa, buluta aktar (Onboarding)
            const localDocs = localStorage.getItem('imar_docs');
            if (localDocs) {
              const parsed = JSON.parse(localDocs);
              if (parsed.length > 0) {
                await setDoc(doc(db, "users", user.uid), { documents: parsed }, { merge: true });
                setDocuments(parsed);
              }
            } else {
              setDocuments([]);
            }
          }
        } catch (e) { console.error(e); }
      } else {
        // Logout olduğunda local'e dön
        const savedDocs = localStorage.getItem('imar_docs');
        if (savedDocs) setDocuments(JSON.parse(savedDocs));
        else setDocuments([]);
      }
    };
    syncData();
  }, [user]);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  // Otomatik Geçmiş Kaydetme
  useEffect(() => {
    if (user && messages.length > 0) {
      const timer = setTimeout(() => {
        saveChatHistory(user.uid, messages, user.email || undefined);
      }, 2000); // 2 saniye gecikmeli kaydet (debounce)
      return () => clearTimeout(timer);
    }
  }, [messages, user]);

  // PDF Export fonksiyonu - Türkçe karakter destekli
  const exportChatToPDF = () => {
    if (messages.length === 0) {
      alert("Dışa aktarılacak sohbet bulunmuyor.");
      return;
    }

    // Yeni pencere aç ve içeriği oluştur
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Pop-up engelleyici aktif olabilir. Lütfen izin verin.");
      return;
    }

    const currentDate = new Date().toLocaleDateString('tr-TR', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const messagesHTML = messages.map(msg => `
      <div style="margin-bottom: 20px; padding: 15px; border-radius: 12px; ${msg.role === 'user'
        ? 'background: #EEF2FF; border-left: 4px solid #6366F1;'
        : 'background: #F0FDF4; border-left: 4px solid #22C55E;'}">
        <div style="font-size: 11px; font-weight: bold; color: ${msg.role === 'user' ? '#6366F1' : '#22C55E'}; margin-bottom: 8px; text-transform: uppercase;">
          ${msg.role === 'user' ? '👤 KULLANICI' : '🤖 MEVZUAT ASİSTANI'}
        </div>
        <div style="font-size: 14px; color: #1F2937; line-height: 1.6; white-space: pre-wrap;">
          ${msg.text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
        </div>
      </div>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <title>İmarMevzuat.ai - Sohbet Geçmişi</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 40px; 
            background: #fff;
            color: #1F2937;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #E5E7EB;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #6366F1;
            margin-bottom: 5px;
          }
          .date {
            font-size: 12px;
            color: #6B7280;
          }
          .messages {
            max-width: 800px;
            margin: 0 auto;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            font-size: 11px;
            color: #9CA3AF;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">⚖️ İmarMevzuat.ai</div>
          <div class="date">Sohbet Geçmişi - ${currentDate}</div>
        </div>
        <div class="messages">
          ${messagesHTML}
        </div>
        <div class="footer">
          İmarMevzuat.ai - Profesyonel Mevzuat Asistanı
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
      localStorage.setItem('imar_usage_data', JSON.stringify({ date: new Date().toDateString(), count: newCount }));
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
        <div className="sidebar-section">
          {/* Divider */}
          <div className="mx-3 border-t border-dark-border" />

          {/* Search */}
          <div className="px-3 pt-3">
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

          {/* Documents Library */}
          <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 400px)' }}>
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[10px] font-bold text-warm-500 uppercase tracking-widest">Kütüphane</span>
              <span className="text-[9px] bg-dark-surface text-warm-400 px-2 py-0.5 rounded-full font-bold">{documents.length}</span>
            </div>

            {/* Usage Bar */}
            <div className="mb-3 p-3 bg-dark-surface rounded-xl border border-dark-border">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-semibold text-warm-400">Günlük Kullanım</span>
                <span className="text-[10px] font-bold text-accent">{usageCount}/{DAILY_LIMIT}</span>
              </div>
              <div className="h-1 w-full bg-dark-elevated rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accent to-accent-dark rounded-full transition-all duration-700" style={{ width: `${(usageCount / DAILY_LIMIT) * 100}%` }}></div>
              </div>
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
                  <div key={doc.id} className={`p-3 rounded-xl border transition-all cursor-default ${doc.isActive ? 'bg-accent/5 border-accent/20' : 'bg-dark-surface border-dark-border hover:border-warm-700'}`}>
                    <div className="flex gap-2.5">
                      <div onClick={() => saveDocuments(documents.map(d => d.id === doc.id ? { ...d, isActive: !d.isActive } : d))} className="mt-0.5 cursor-pointer">
                        {doc.isActive ? <CheckSquare size={15} className="text-accent" /> : <Square size={15} className="text-warm-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold truncate text-warm-100 mb-0.5">{doc.name}</p>
                        <p className="text-[9px] text-warm-500 truncate">{doc.description}</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-dark-border/50">
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

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sidebar Footer */}
        <div className="p-2 border-t border-dark-border">
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
    <div className="flex h-screen h-[100dvh] w-full bg-dark-primary overflow-hidden">
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
      <aside className={`fixed inset-y-0 left-0 w-[280px] max-w-[85vw] border-r border-dark-border bg-dark-secondary flex flex-col h-[100dvh] z-[60] transform transition-transform duration-300 lg:hidden overflow-y-auto pb-24 pb-safe ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
        <div className="p-3 lg:p-5 z-10 safe-bottom">
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative">
            <div className="relative bg-dark-surface border border-dark-border rounded-2xl overflow-hidden transition-all focus-within:border-accent/40 focus-within:shadow-[0_0_0_3px_rgba(232,115,74,0.1)]">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="İmar mevzuatı hakkında soru sorun..."
                disabled={isTyping}
                className="w-full bg-transparent pl-5 pr-14 py-4 text-sm text-warm-50 placeholder-warm-600 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-dark text-white flex items-center justify-center shadow-lg shadow-accent/20 active:scale-95 transition-all hover:shadow-accent/30 disabled:opacity-20 disabled:shadow-none"
              >
                <Send size={16} />
              </button>
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
          onClose={() => setShowHistoryModal(false)}
          onSelectSession={(historyMessages) => {
            setMessages(historyMessages);
            setShowHistoryModal(false);
          }}
        />
      )}

      {/* Admin Panel */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </div >
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <ImarApp />
  </AuthProvider>
);

export default App;
