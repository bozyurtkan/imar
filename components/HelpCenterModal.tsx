import React from 'react';
import { X, BookOpen, Globe, ChevronRight } from 'lucide-react';
import { TourType } from './OnboardingTour';

interface HelpCenterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTour: (tourType: TourType) => void;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({ isOpen, onClose, onSelectTour }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center modal-overlay p-4" onClick={onClose}>
            <div
                className="bg-dark-tertiary border border-dark-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-dark-border flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-warm-50">Yardım Merkezi</h3>
                        <p className="text-xs text-warm-500 mt-1">Hangi konuda bilgi almak istersiniz?</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-dark-surface rounded-xl transition-colors">
                        <X size={20} className="text-warm-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                    {/* Library Tour Card */}
                    <button
                        onClick={() => onSelectTour('library')}
                        className="w-full group flex items-start gap-4 p-4 bg-dark-secondary hover:bg-dark-surface border border-dark-border hover:border-accent/40 rounded-2xl text-left transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
                    >
                        <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0 group-hover:scale-110 transition-transform">
                            <BookOpen size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-warm-50 mb-1 group-hover:text-accent transition-colors flex items-center justify-between">
                                Mevzuat Kütüphanesi Turu
                                <ChevronRight size={16} className="text-warm-600 group-hover:text-accent" />
                            </h4>
                            <p className="text-xs text-warm-400 leading-relaxed">
                                Kendi belgelerinizi nasıl yükleyeceğinizi ve sistemde nasıl kullanacağınızı öğrenin.
                            </p>
                        </div>
                    </button>

                    {/* Web Search Tour Card */}
                    <button
                        onClick={() => onSelectTour('webSearch')}
                        className="w-full group flex items-start gap-4 p-4 bg-dark-secondary hover:bg-dark-surface border border-dark-border hover:border-blue-500/40 rounded-2xl text-left transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
                    >
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Globe size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-warm-50 mb-1 group-hover:text-blue-400 transition-colors flex items-center justify-between">
                                Web Arama & Derin Düşünce
                                <ChevronRight size={16} className="text-warm-600 group-hover:text-blue-400" />
                            </h4>
                            <p className="text-xs text-warm-400 leading-relaxed">
                                İnternette canlı mevzuat taramasını ve karmaşık sorular için derin analizi (Deep Think) keşfedin.
                            </p>
                        </div>
                    </button>

                </div>

                {/* Footer */}
                <div className="p-4 bg-dark-surface border-t border-dark-border text-center">
                    <p className="text-[11px] text-warm-600">Herhangi bir sorun için <a href="mailto:destek@imarmevzuat.com" className="text-accent hover:underline">destek ekibiyle</a> iletişime geçebilirsiniz.</p>
                </div>
            </div>
        </div>
    );
};
