
import React, { useEffect, useState } from 'react';
import { X, Calendar, MessageSquare, Clock, ArrowRight, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getChatHistory, deleteChatSession, ChatSession } from '../services/firebase';

interface HistoryModalProps {
    show: boolean;
    onClose: () => void;
    onSelectSession: (messages: any[]) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ show, onClose, onSelectSession }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);

    useEffect(() => {
        if (!show) return; // Modal kapalıysa veri çekme
        setLoading(true);
        const fetchHistory = async () => {
            if (user) {
                try {
                    const data = await getChatHistory(user.uid);
                    setHistory(data);
                } catch (error) {
                    console.error('Geçmiş yüklenirken hata:', error);
                }
            }
            setLoading(false);
        };

        fetchHistory();
    }, [user, show]);

    if (!show) return null;

    // Tarihe göre gruplama fonksiyonu
    const groupHistoryByDate = (sessions: ChatSession[]) => {
        const groups: { [key: string]: ChatSession[] } = {};

        sessions.forEach(session => {
            let dateKey = session.date;
            try {
                const dateObj = new Date(session.date);
                // ISO formatındaysa sadece tarihi al (YYYY-MM-DD kontrolü)
                if (!isNaN(dateObj.getTime())) {
                    dateKey = dateObj.toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                    });
                }
            } catch (e) {
                console.error("Date parsing error", e);
            }

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(session);
        });

        return groups;
    };

    const getSessionTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "";
            return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return "";
        }
    };

    const groupedHistory = groupHistoryByDate(history);

    const handleDeleteClick = (e: React.MouseEvent, session: ChatSession) => {
        e.stopPropagation();
        setSessionToDelete(session);
    };

    const confirmDelete = async () => {
        if (!user || !sessionToDelete) return;

        setDeletingId(sessionToDelete.id);

        const success = await deleteChatSession(user.uid, sessionToDelete.id);

        if (success) {
            setHistory(prev => prev.filter(s => s.id !== sessionToDelete.id));
        } else {
            // Optional: Show error message
            console.error("Silme işlemi başarısız.");
        }

        setDeletingId(null);
        setSessionToDelete(null);
    };

    const cancelDelete = () => {
        setSessionToDelete(null);
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center modal-overlay p-4 fade-in" onClick={onClose}>
            <div
                className="bg-dark-tertiary border border-dark-border w-full max-w-lg max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-dark-border bg-gradient-to-r from-accent/15 to-accent-dark/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center text-accent">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-warm-50">Sohbet Geçmişi</h2>
                                <p className="text-xs text-warm-500">Günlük olarak gruplandırılmıştır</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-warm-400 hover:text-warm-50 hover:bg-dark-surface rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3 text-warm-500">
                            <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full"></div>
                            <span className="text-xs">Geçmiş yükleniyor...</span>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-center p-6 border-2 border-dashed border-dark-border rounded-2xl mx-2">
                            <Calendar size={40} className="text-warm-600 mb-3" />
                            <h3 className="text-sm font-bold text-warm-300">Henüz Kayıt Yok</h3>
                            <p className="text-xs text-warm-500 mt-1">Yapılan görüşmeler burada gün gün listelenir.</p>
                        </div>
                    ) : (
                        Object.entries(groupedHistory).map(([dateLabel, sessions]) => (
                            <div key={dateLabel} className="animate-in">
                                <h3 className="text-xs font-bold text-warm-500 uppercase tracking-wider mb-2 px-1 flex items-center gap-2">
                                    <Calendar size={12} />
                                    {dateLabel}
                                </h3>
                                <div className="space-y-2">
                                    {sessions.map((session) => (
                                        <button
                                            key={session.id}
                                            onClick={() => onSelectSession(session.messages)}
                                            className="w-full bg-dark-surface p-3 rounded-xl border border-dark-border hover:border-accent/30 hover:bg-dark-surface-hover transition-all group text-left relative overflow-hidden flex gap-3"
                                        >
                                            <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity rounded-r"></div>

                                            <div className="flex flex-col items-center pt-1 min-w-[40px]">
                                                <span className="text-[10px] font-bold text-warm-400 bg-dark-evalated px-1.5 py-0.5 rounded border border-dark-border/50">
                                                    {getSessionTime(session.date) || "Günlük"}
                                                </span>
                                            </div>

                                            <div className="flex-1 min-w-0 pr-4">
                                                <p className="text-sm text-warm-200 line-clamp-2 leading-relaxed mb-1.5 font-medium group-hover:text-warm-50 transition-colors">
                                                    {session.preview}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-warm-500 flex items-center gap-1">
                                                        <MessageSquare size={10} />
                                                        {session.messages.length} Mesaj
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-center">
                                                <button
                                                    onClick={(e) => handleDeleteClick(e, session)}
                                                    className="p-2 text-warm-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all z-10"
                                                    title="Sohbeti Sil"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="text-warm-600 group-hover:text-accent transition-colors">
                                                    <ArrowRight size={14} />
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Silme Onay Modalı */}
            {sessionToDelete && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center bg-dark-bg/80 backdrop-blur-sm p-4 animate-in fade-in" onClick={cancelDelete}>
                    <div
                        className="bg-dark-tertiary border border-red-500/20 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-5 border-b border-dark-border bg-gradient-to-r from-red-500/10 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-500">
                                    <AlertTriangle size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-warm-50">Sohbeti Sil</h2>
                                </div>
                            </div>
                        </div>

                        <div className="p-5">
                            <p className="text-sm text-warm-300 mb-4">
                                Bu sohbet geçmişini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                            </p>
                            <div className="bg-dark-surface border border-dark-border rounded-xl p-3 mb-5">
                                <p className="text-xs text-warm-400 line-clamp-2 italic">"{sessionToDelete.preview}"</p>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={cancelDelete}
                                    disabled={deletingId === sessionToDelete.id}
                                    className="px-4 py-2 text-sm font-medium text-warm-300 hover:text-warm-50 hover:bg-dark-surface rounded-xl transition-all disabled:opacity-50"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deletingId === sessionToDelete.id}
                                    className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {deletingId === sessionToDelete.id ? (
                                        <>
                                            <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                                            Siliniyor...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={16} />
                                            Sil
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
