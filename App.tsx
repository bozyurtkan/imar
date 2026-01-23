
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  FileText, Send, Trash2, Plus, BookOpen, Loader2, Scale,
  ShieldCheck, Sun, Moon, CheckSquare,
  Square, Globe, ExternalLink, Zap, Sparkles, Key, AlertTriangle,
  ChevronRight, X, Download, Search, Menu, Link2, GitBranch, Gavel, ArrowRight, Hash
} from 'lucide-react';
import { DocumentFile, Message } from './types';
import { parseFile, formatBytes } from './utils/fileParser';
import { geminiService } from './services/geminiService';
import { getMadde, getAllMaddeler, MevzuatMaddesi, getMevzuatGraph } from './data/mevzuatVeritabani';

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

const App: React.FC = () => {
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
  const [showKnowledgeGraph, setShowKnowledgeGraph] = useState(false);

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
    const initCheck = async () => {
      try {
        if (window.aistudio) {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } else {
          // Check local storage or env var
          const localKey = localStorage.getItem('gemini_api_key');
          const envKey = process.env.API_KEY; // Vite define ile gelir
          setHasKey(!!localKey || !!envKey);
        }
      } catch (e) {
        console.error("Auth check failed", e);
      }
    };
    initCheck();

    const savedDocs = localStorage.getItem('imar_docs');
    if (savedDocs) {
      try { setDocuments(JSON.parse(savedDocs)); } catch (e) { console.error(e); }
    }
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
    try {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        setTimeout(async () => {
          if (window.aistudio) {
            const selected = await window.aistudio.hasSelectedApiKey();
            setHasKey(selected);
          }
        }, 1000);
      } else {
        // Fallback: Manual Entry
        const currentKey = localStorage.getItem('gemini_api_key') || '';
        const newKey = prompt("Lütfen Google Gemini API Anahtarınızı girin:", currentKey);
        if (newKey !== null) { // Cancel'a basılmadıysa
          if (newKey.trim()) {
            localStorage.setItem('gemini_api_key', newKey.trim());
            setHasKey(true);
            alert("API Anahtarı kaydedildi.");
          } else {
            localStorage.removeItem('gemini_api_key');
            setHasKey(false);
          }
        }
      }
    } catch (error) {
      console.error("Open Key Selector Error:", error);
    }
  };

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('imar_theme', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    if (documents.length > 0) localStorage.setItem('imar_docs', JSON.stringify(documents));
    else localStorage.removeItem('imar_docs');
  }, [documents]);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

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
    setDocuments(prev => [...prev, ...newDocs]);
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

  // Madde tıklama işleyicisi
  const handleMaddeClick = useCallback((maddeId: string) => {
    const madde = getMadde(maddeId);
    if (madde) {
      setSelectedMadde(madde);
      setShowMaddeModal(true);
    } else {
      alert(`"${maddeId}" maddesi veritabanında bulunamadı.`);
    }
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
            className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-200 px-2 py-0.5 rounded-lg font-bold text-[11px] mx-0.5 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors cursor-pointer"
          >
            <Link2 size={10} />
            {part}
          </button>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      return part;
    });
  };

  // Madde Detay Modal Bileşeni
  const MaddeModal = () => {
    if (!showMaddeModal || !selectedMadde) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4" onClick={() => setShowMaddeModal(false)}>
        <div
          className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="flex items-start justify-between">
              <div className="text-white">
                <div className="flex items-center gap-2 text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">
                  <Hash size={12} />
                  {selectedMadde.kanunNo} Sayılı {selectedMadde.kanunAdi}
                </div>
                <h2 className="text-xl font-bold">Madde {selectedMadde.maddeNo}: {selectedMadde.baslik}</h2>
              </div>
              <button
                onClick={() => setShowMaddeModal(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {/* Madde İçeriği */}
            <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
              <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-[14px]">
                {selectedMadde.icerik.split(/\*\*(.*?)\*\*/g).map((part, i) =>
                  i % 2 === 1 ? <strong key={i} className="text-indigo-600 dark:text-indigo-400">{part}</strong> : part
                )}
              </div>
            </div>

            {/* Anahtar Kelimeler */}
            <div className="mb-6">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Anahtar Kelimeler</h4>
              <div className="flex flex-wrap gap-2">
                {selectedMadde.anahtatKelimeler.map((kelime, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-medium">
                    {kelime}
                  </span>
                ))}
              </div>
            </div>

            {/* İlişkili Maddeler */}
            <div className="mb-6">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <GitBranch size={12} /> İlişkili Maddeler
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectedMadde.iliskiliMaddeler.map((relatedId) => {
                  const relatedMadde = getMadde(relatedId);
                  return (
                    <button
                      key={relatedId}
                      onClick={() => navigateToRelatedMadde(relatedId)}
                      className="p-3 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Madde {relatedId.split('/')[1]}</span>
                        <ArrowRight size={12} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {relatedMadde && (
                        <p className="text-[10px] text-slate-500 mt-1 truncate">{relatedMadde.baslik}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Yargıtay Kararları */}
            {selectedMadde.yargitayKararlari && selectedMadde.yargitayKararlari.length > 0 && (
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
            )}
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
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4" onClick={() => setShowKnowledgeGraph(false)}>
        <div
          className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                <GitBranch size={20} />
              </div>
              <div>
                <h3 className="font-bold dark:text-white">Mevzuat İlişki Grafiği</h3>
                <p className="text-xs text-slate-500">3194 Sayılı İmar Kanunu - Madde Bağlantıları</p>
              </div>
            </div>
            <button
              onClick={() => setShowKnowledgeGraph(false)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          {/* Graph Area */}
          <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-950">
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
                    stroke={selectedMadde?.id === edge.source || selectedMadde?.id === edge.target ? '#6366F1' : '#CBD5E1'}
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
                      fill={isSelected ? '#6366F1' : isRelated ? '#A5B4FC' : '#E2E8F0'}
                      className="transition-all hover:scale-110"
                      style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                    />
                    <text
                      x={pos.x}
                      y={pos.y - 5}
                      textAnchor="middle"
                      className={`text-xs font-bold ${isSelected ? 'fill-white' : 'fill-slate-700'}`}
                    >
                      Md. {node.maddeNo}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 10}
                      textAnchor="middle"
                      className={`text-[8px] ${isSelected ? 'fill-white/80' : 'fill-slate-500'}`}
                    >
                      {node.baslik.slice(0, 12)}{node.baslik.length > 12 ? '...' : ''}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
              <span className="text-xs text-slate-500">Seçili Madde</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-indigo-300"></div>
              <span className="text-xs text-slate-500">İlişkili Madde</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-slate-200"></div>
              <span className="text-xs text-slate-500">Diğer Maddeler</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Sidebar bileşeni - hem desktop hem mobile için
  const SidebarContent = () => (
    <>
      <div className="p-4 lg:p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-indigo-600 dark:bg-indigo-950/40">
        <div className="flex items-center gap-3 text-white">
          <Scale size={24} />
          <div>
            <h1 className="font-bold tracking-tight text-sm">İmarMevzuat.ai</h1>
            <div className="flex items-center gap-1 text-[8px] uppercase tracking-widest opacity-70">
              Profesyonel Mevzuat Asistanı
            </div>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden p-2 text-white/80 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {!hasKey && (
          <div className="mb-4 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl animate-pulse">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2">
              <AlertTriangle size={16} />
              <span className="text-[10px] font-bold uppercase">Kimlik Gerekli</span>
            </div>
            <button onClick={handleOpenKeySelector} className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/20"><Key size={12} /> Anahtarı Bağla</button>
          </div>
        )}

        <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Analiz Limiti</span>
            <span className="text-[10px] font-bold text-indigo-600">{usageCount}/{DAILY_LIMIT}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${(usageCount / DAILY_LIMIT) * 100}%` }}></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">KÜTÜPHANE</h3>
            <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-bold">{documents.length}</span>
          </div>

          {/* Arama alanı */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Belge ara..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:text-white placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {filteredDocuments.length === 0 && documents.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 text-[10px] font-bold uppercase">Henüz Belge Yok</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 text-[10px] font-bold">
              "{searchQuery}" için sonuç bulunamadı
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map(doc => (
                <div key={doc.id} className={`p-3 rounded-xl border transition-all ${doc.isActive ? 'bg-indigo-50/40 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                  <div className="flex gap-3">
                    <div onClick={() => setDocuments(docs => docs.map(d => d.id === doc.id ? { ...d, isActive: !d.isActive } : d))} className="mt-0.5 text-indigo-600 cursor-pointer">
                      {doc.isActive ? <CheckSquare size={16} /> : <Square size={16} className="text-slate-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate dark:text-white leading-none mb-1">{doc.name}</p>
                      <p className="text-[9px] text-slate-400 truncate opacity-70 mb-2">{doc.description}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 dark:border-slate-800/50">
                        <button onClick={() => handleSummarize(doc)} className="text-[9px] font-bold text-indigo-600 hover:underline flex items-center gap-1"><Sparkles size={10} /> Özetle</button>
                        <button onClick={() => setDocuments(d => d.filter(x => x.id !== doc.id))} className="text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && setUploadPendingFiles(Array.from(e.target.files))} className="hidden" multiple accept=".pdf,.docx,.jpg,.jpeg,.png" />
        <button onClick={() => fileInputRef.current?.click()} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 text-xs font-bold transition-all"><Plus size={16} /> Mevzuat Yükle</button>
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button onClick={handleOpenKeySelector} className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-[10px] font-bold text-slate-500">
            <div className="flex items-center gap-2"><Key size={14} /> API AYARLARI</div>
            <div className={`w-1.5 h-1.5 rounded-full ${hasKey ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className={`flex h-screen h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-200 overflow-hidden supports-[height:100cqh]:h-[100cqh] supports-[height:100svh]:h-[100svh]`}>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-col h-full z-40">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile (Slide-in) */}
      <aside className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-[100dvh] z-[60] transform transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      <main className="flex-1 flex flex-col bg-white dark:bg-slate-950 min-w-0">
        <header className="h-14 lg:h-16 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger menu */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <ShieldCheck className="text-emerald-500 hidden sm:block" size={18} />
            <div>
              <h2 className="text-xs font-bold dark:text-white leading-none">Mevzuat Analiz Odası</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 hidden sm:block">Aktif Belge: {documents.filter(d => d.isActive).length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Mevzuat Kütüphanesi butonu */}
            <button
              onClick={() => setShowKnowledgeGraph(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20"
              title="Mevzuat İlişki Grafiği"
            >
              <GitBranch size={16} />
              <span className="hidden sm:inline">Mevzuat</span>
            </button>
            {/* PDF Export butonu */}
            {messages.length > 0 && (
              <button
                onClick={exportChatToPDF}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                title="Sohbeti PDF olarak indir"
              >
                <Download size={16} />
                <span className="hidden sm:inline">PDF İndir</span>
              </button>
            )}
            <button onClick={() => setIsGeneralMode(!isGeneralMode)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${isGeneralMode ? 'bg-indigo-500 text-white shadow-indigo-500/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-slate-200/20'}`}>
              <Globe size={16} />
              <span className="hidden sm:inline">Web {isGeneralMode ? 'Açık' : 'Kapalı'}</span>
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl shadow-lg transition-all hover:scale-105">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-4 lg:space-y-6 custom-scrollbar overscroll-contain">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto px-4">
              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center text-indigo-600 mb-6 shadow-xl"><BookOpen size={28} /></div>
              <h3 className="text-lg font-bold mb-2 dark:text-white">İmar Mevzuatı Asistanı</h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-8">Belgelerinizi yükleyin ve imar mevzuatı hakkında sorular sorun. Yüklediğiniz yönetmelik ve kanunlar üzerinden detaylı aramalar yapın.</p>
              <div className="space-y-2 w-full">
                {["3194 Sayılı Kanun 18. madde nedir?", "İstanbul İmar Yönetmeliği çekme mesafesi?", "Mevzuata göre otopark şartları?"].map((q, i) => (
                  <button key={i} onClick={() => setInputValue(q)} className="w-full p-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-white border border-slate-100 dark:border-slate-700 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300 text-left flex items-center justify-between transition-all">{q} <ChevronRight size={14} /></button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[95%] lg:max-w-[85%] rounded-2xl px-4 lg:px-5 py-3 lg:py-4 shadow-sm border ${msg.role === 'user' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200'}`}>
                  <div className="flex items-center gap-2 mb-2 opacity-60 text-[8px] font-bold uppercase tracking-widest">
                    {msg.role === 'user' ? <Zap size={10} /> : <ShieldCheck size={10} />}
                    <span>{msg.role === 'user' ? 'SORU' : 'MEVZUAT YANITI'}</span>
                  </div>
                  <div className="text-[12px] lg:text-[13px] leading-relaxed whitespace-pre-wrap font-medium">
                    {msg.role === 'assistant' ? (
                      <div className="space-y-4">
                        <div>{renderText(msg.text)}</div>
                        {msg.references && msg.references.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                            {msg.references.map((r, i) => (
                              <a key={i} href={r} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-[9px] font-bold text-indigo-600"><ExternalLink size={10} /> Kaynak {i + 1}</a>
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
          {isTyping && <div className="flex justify-start"><div className="bg-slate-50 dark:bg-slate-800 rounded-2xl px-5 py-4 border animate-pulse"><Loader2 size={16} className="animate-spin text-indigo-500" /></div></div>}
          <div ref={chatEndRef} />
        </div>

        <div className="p-3 lg:p-6 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative">
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="İmar mevzuatı hakkında soru sorun..." disabled={isTyping} className="w-full pl-4 lg:pl-6 pr-14 py-3 lg:py-4 rounded-2xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-sm" />
            <button type="submit" disabled={!inputValue.trim() || isTyping} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all hover:bg-indigo-700 disabled:opacity-30"><Send size={18} /></button>
          </form>
          <div className="mt-3 text-center text-[10px] text-slate-400 font-medium flex items-center justify-center gap-2">
            Yüklediğiniz mevzuat belgeleri üzerinden arama yapar
          </div>
        </div>
      </main>

      {uploadPendingFiles.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 lg:p-8 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600"><FileText size={24} /></div>
              <button onClick={() => setUploadPendingFiles([])} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X size={18} className="text-slate-400" /></button>
            </div>
            <h4 className="text-lg font-bold mb-1 dark:text-white">Dosya Bilgisi</h4>
            <p className="text-[10px] text-slate-400 mb-6">Bu belge hangi yönetmelikle ilgili?</p>
            <input autoFocus type="text" value={currentDescription} onChange={(e) => setCurrentDescription(e.target.value)} placeholder="Örn: Otopark Yönetmeliği 2024" className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/20 rounded-xl px-4 py-3 text-sm focus:outline-none dark:text-white" onKeyDown={(e) => e.key === 'Enter' && finalizeUpload()} />
            <div className="flex gap-3 mt-8">
              <button onClick={finalizeUpload} disabled={isParsing} className="flex-1 bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
                {isParsing ? <Loader2 size={16} className="animate-spin" /> : "Kütüphaneye Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Madde Detay Modal */}
      <MaddeModal />

      {/* Knowledge Graph Modal */}
      <KnowledgeGraphModal />
    </div>
  );
};

export default App;
