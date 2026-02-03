
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
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Sohbet Geçmişi</h2>
                                <p className="text-xs text-indigo-100">Önceki görüşmeleriniz</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50 dark:bg-slate-950">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
                            <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                            <span className="text-xs">Geçmiş yükleniyor...</span>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl mx-2">
                            <Calendar size={40} className="text-slate-300 mb-3" />
                            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300">Henüz Kayıt Yok</h3>
                            <p className="text-xs text-slate-400 mt-1">Yapılan görüşmeler burada gün gün listelenir.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((session) => (
                                <button
                                    key={session.id}
                                    onClick={() => onSelectSession(session.messages)}
                                    className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group text-left relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <Calendar size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatDate(session.date)}</span>
                                                <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                {session.preview}
                                            </p>
                                            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-50 dark:border-slate-800/50">
                                                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
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
