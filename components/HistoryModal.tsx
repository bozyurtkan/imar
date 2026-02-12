
import React, { useEffect, useState } from 'react';
import { X, Calendar, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getChatHistory, ChatSession } from '../services/firebase';

interface HistoryModalProps {
    onClose: () => void;
    onSelectSession: (messages: any[]) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ onClose, onSelectSession }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (user) {
                const data = await getChatHistory(user.uid);
                setHistory(data);
            }
            setLoading(false);
        };

        fetchHistory();
    }, [user]);

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
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
                                <p className="text-xs text-warm-500">Önceki görüşmeleriniz</p>
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
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
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
                        <div className="space-y-3">
                            {history.map((session) => (
                                <button
                                    key={session.id}
                                    onClick={() => onSelectSession(session.messages)}
                                    className="w-full bg-dark-surface p-4 rounded-xl border border-dark-border hover:border-accent/30 hover:bg-dark-surface-hover transition-all group text-left relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity rounded-r"></div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                                            <Calendar size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-bold text-warm-100">{formatDate(session.date)}</span>
                                                <ArrowRight size={14} className="text-warm-600 group-hover:text-accent transition-colors" />
                                            </div>
                                            <p className="text-xs text-warm-400 line-clamp-2 leading-relaxed">
                                                {session.preview}
                                            </p>
                                            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-dark-border/50">
                                                <span className="text-[10px] font-medium text-warm-500 bg-dark-elevated px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <MessageSquare size={10} />
                                                    {session.messages.length} Mesaj
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
