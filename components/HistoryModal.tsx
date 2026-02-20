
import React, { useEffect, useState } from 'react';
import { X, Calendar, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getChatHistory, ChatSession } from '../services/firebase';

interface HistoryModalProps {
    show: boolean;
    onClose: () => void;
    onSelectSession: (messages: any[]) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ show, onClose, onSelectSession }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);

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

                                            <div className="flex-1 min-w-0">
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

                                            <div className="flex items-center text-warm-600 group-hover:text-accent transition-colors self-center">
                                                <ArrowRight size={14} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
