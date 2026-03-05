import React, { useState } from 'react';
import { FavoriteItem } from '../types';
import { X, Star, Trash2, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface FavoritesModalProps {
    show: boolean;
    onClose: () => void;
    favorites: FavoriteItem[];
    onRemoveFavorite: (id: string) => Promise<void>;
    renderText?: (text: string) => React.ReactNode;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({ show, onClose, favorites, onRemoveFavorite, renderText }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (!show) return null;

    const formatDate = (isoString?: string) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center modal-overlay p-4 fade-in" onClick={onClose}>
            <div
                className="bg-dark-tertiary border border-dark-border w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-dark-border bg-gradient-to-r from-yellow-500/15 to-yellow-600/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-500">
                                <Star size={20} className="fill-yellow-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-warm-50">Mevzuat Favorilerim</h2>
                                <p className="text-xs text-warm-500">Kaydettiğiniz önemli analizler</p>
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
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                    {favorites.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-center p-6 border-2 border-dashed border-dark-border rounded-2xl mx-2">
                            <Star size={40} className="text-warm-600 mb-3" />
                            <h3 className="text-sm font-bold text-warm-300">Henüz Favoriniz Yok</h3>
                            <p className="text-xs text-warm-500 mt-1">Önemli gördüğünüz yanıtları yıldız ikonuna tıklayarak kaydedebilirsiniz.</p>
                        </div>
                    ) : (
                        favorites.map((fav) => (
                            <div key={fav.id} className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden group">
                                <div
                                    className="p-4 cursor-pointer hover:bg-dark-surface-hover flex justify-between items-start gap-4"
                                    onClick={() => setExpandedId(expandedId === fav.id ? null : fav.id)}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded">
                                                {fav.category || "Kayıtlı Yanıt"}
                                            </span>
                                            <span className="text-[10px] text-warm-500 flex items-center gap-1">
                                                <Calendar size={10} />
                                                {formatDate(fav.createdAt)}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-semibold text-warm-100 line-clamp-2">{fav.questionText}</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemoveFavorite(fav.id);
                                            }}
                                            className="p-2 text-warm-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                            title="Favorilerden Çıkar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="text-warm-600 group-hover:text-warm-300">
                                            {expandedId === fav.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </div>
                                    </div>
                                </div>
                                {expandedId === fav.id && (
                                    <div className="p-4 pt-0 border-t border-dark-border/50 bg-dark-tertiary">
                                        <div className="mt-4 text-xs leading-relaxed text-warm-200 whitespace-pre-wrap focus-visible:outline-none">
                                            {renderText ? renderText(fav.answerText) : fav.answerText}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
