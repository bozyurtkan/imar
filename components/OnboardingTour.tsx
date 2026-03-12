import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, BookOpen, CheckSquare, Upload, MessageSquare, HelpCircle, Globe, Brain, Send, GitBranch, Link2, Sparkles } from 'lucide-react';

export type TourType = 'library' | 'webSearch' | 'comparison';

interface TourStep {
    targetId: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    position: 'top' | 'bottom' | 'left' | 'right';
    onBeforeShow?: () => void;
}

interface OnboardingTourProps {
    isOpen: boolean;
    tourType: TourType;
    onClose: () => void;
    onExpandSidebar?: () => void;
}

const LIBRARY_TOUR_STEPS: TourStep[] = [
    {
        targetId: 'tour-library-title',
        title: 'Mevzuat Kütüphanesi',
        description: 'Yüklediğiniz tüm belgeler burada listelenir. Başlangıçta sizin için 3 temel mevzuat ekledik.',
        icon: <BookOpen size={20} />,
        position: 'right',
    },
    {
        targetId: 'tour-doc-toggle',
        title: 'Belge Aktif / Pasif',
        description: 'Tik işaretine tıklayarak belgeyi aktif edin. Sadece aktif belgeler soru-cevap sırasında kullanılır.',
        icon: <CheckSquare size={20} />,
        position: 'right',
    },
    {
        targetId: 'tour-upload-btn',
        title: 'Dosya Yükleme',
        description: 'Buradan PDF, TXT veya WORD dosyalarınızı yükleyebilirsiniz. Kendi mevzuat belgelerinizi ekleyerek kişisel kütüphanenizi oluşturun.',
        icon: <Upload size={20} />,
        position: 'top',
    },
    {
        targetId: 'tour-prompt-cards',
        title: 'Soru Sorun',
        description: 'Hazır soru kartlarından birine tıklayın veya kendi sorunuzu yazın. Asistan aktif belgeleriniz üzerinden yanıt verecektir.',
        icon: <MessageSquare size={20} />,
        position: 'top',
    },
];

const WEB_SEARCH_TOUR_STEPS: TourStep[] = [
    {
        targetId: 'tour-web-toggle',
        title: 'Web Araması Modu',
        description: 'Bu butona tıklayarak Web Aramasını açabilirsiniz. İnternetteki en güncel mevzuat ve içtihatları tarayarak size güncel bilgiler sunar.',
        icon: <Globe size={20} />,
        position: 'bottom',
    },
    {
        targetId: 'tour-deep-think',
        title: 'Derin Düşünce (Deep Think)',
        description: 'Karmaşık sorularda daha derin mantıksal analiz ve muhakeme yapmak isterseniz bu modu açarak çok adımlı analiz yapabilirsiniz.',
        icon: <Brain size={20} />,
        position: 'top',
    },
    {
        targetId: 'tour-prompt-cards',
        title: 'Soru Gönderin',
        description: 'Web araması veya Derin Düşünce açıkken sorularınızı buradan gönderebilirsiniz.',
        icon: <Send size={20} />,
        position: 'top',
    },
];

const COMPARISON_TOUR_STEPS: TourStep[] = [
    {
        targetId: 'tour-compare-btn',
        title: 'Mevzuat Karşılaştırma',
        description: 'Bu butona tıklayarak karşılaştırma aracını açabilirsiniz. Resmi Gazete linklerini kullanarak değişiklikleri analiz eder.',
        icon: <GitBranch size={20} />,
        position: 'right',
    },
    {
        targetId: 'tour-compare-input',
        title: 'Link Girişi',
        description: 'Buraya analiz etmek istediğiniz Resmi Gazete linkini yapıştırın. Örnek bir link sizin için eklendi.',
        icon: <Link2 size={20} />,
        position: 'bottom',
    },
    {
        targetId: 'tour-compare-submit',
        title: 'Analizi Başlat',
        description: 'Butona bastığınızda yapay zeka hem mevcut mevzuatı hem de linkteki yeni düzenlemeyi karşılaştırarak farkları raporlar.',
        icon: <Sparkles size={16} />,
        position: 'top',
    },
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, tourType, onClose, onExpandSidebar }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
    const [isAnimating, setIsAnimating] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const activeSteps = tourType === 'library' ? LIBRARY_TOUR_STEPS : (tourType === 'webSearch' ? WEB_SEARCH_TOUR_STEPS : COMPARISON_TOUR_STEPS);

    const updateTargetPosition = useCallback(() => {
        const step = activeSteps[currentStep];
        if (!step) return;

        const el = document.querySelector(`[data-tour-id="${step.targetId}"]`);
        if (el) {
            const rect = el.getBoundingClientRect();
            setTargetRect(rect);
        }
    }, [currentStep, activeSteps]);

    useEffect(() => {
        if (!isOpen) return;

        if (tourType === 'library' && currentStep < 3 && onExpandSidebar) {
            onExpandSidebar();
        }

        const timer = setTimeout(() => {
            updateTargetPosition();
        }, 350);

        return () => clearTimeout(timer);
    }, [isOpen, currentStep, updateTargetPosition, onExpandSidebar, tourType]);

    // Tooltip pozisyonunu hesapla
    useEffect(() => {
        if (!targetRect || !isOpen) return;

        const step = activeSteps[currentStep];
        const padding = 16;
        const tooltipWidth = 320;
        const tooltipHeight = 200;

        let style: React.CSSProperties = {};

        switch (step.position) {
            case 'right':
                style = {
                    left: Math.min(targetRect.right + padding, window.innerWidth - tooltipWidth - padding),
                    top: Math.max(padding, targetRect.top + targetRect.height / 2 - tooltipHeight / 2),
                };
                break;
            case 'left':
                style = {
                    left: Math.max(padding, targetRect.left - tooltipWidth - padding),
                    top: Math.max(padding, targetRect.top + targetRect.height / 2 - tooltipHeight / 2),
                };
                break;
            case 'top':
                style = {
                    left: Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding)),
                    top: Math.max(padding, targetRect.top - tooltipHeight - padding),
                };
                break;
            case 'bottom':
                style = {
                    left: Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding)),
                    top: targetRect.bottom + padding,
                };
                break;
        }

        // Ekranın dışına taşma kontrolü
        if (typeof style.top === 'number' && style.top < padding) style.top = padding;
        if (typeof style.top === 'number' && style.top + tooltipHeight > window.innerHeight - padding) {
            style.top = window.innerHeight - tooltipHeight - padding;
        }

        setTooltipStyle(style);
    }, [targetRect, currentStep, isOpen]);

    // Resize dinleyicisi
    useEffect(() => {
        if (!isOpen) return;
        const handleResize = () => updateTargetPosition();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen, updateTargetPosition]);

    const handleNext = () => {
        if (currentStep < activeSteps.length - 1) {
            // Karşılaştırma turu için özel tetikleyiciler (Otomatik Demo)
            if (tourType === 'comparison') {
                if (currentStep === 0) {
                    // 1. ADIM: Karşılaştırma modalını aç
                    const compareBtn = document.querySelector('[data-tour-id="tour-compare-btn"]') as HTMLButtonElement;
                    if (compareBtn) compareBtn.click();
                } else if (currentStep === 1) {
                    // 2. ADIM: Linki inputa otomatik doldur
                    const compareInput = document.querySelector('[data-tour-id="tour-compare-input"]') as HTMLInputElement;
                    if (compareInput) {
                        const demoUrl = "https://www.resmigazete.gov.tr/eskiler/2026/01/20260114-1.htm";

                        // React'in state değişimini yakalaması için input olayı tetiklenmeli
                        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
                        nativeInputValueSetter?.call(compareInput, demoUrl);
                        compareInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
            }

            setIsAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
                setIsAnimating(false);
            }, 200);
        } else {
            handleFinish();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev - 1);
                setIsAnimating(false);
            }, 200);
        }
    };

    const handleFinish = () => {
        localStorage.setItem('imar_onboarding_completed', 'true');
        setCurrentStep(0);
        onClose();
    };

    const handleSkip = () => {
        handleFinish();
    };

    if (!isOpen || !targetRect) return null;

    const step = activeSteps[currentStep];
    const spotlightPadding = 8;

    return (
        <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: 'auto' }}>
            {/* SVG Overlay with spotlight cutout */}
            <svg
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: 'none' }}
            >
                <defs>
                    <mask id="spotlight-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        <rect
                            x={targetRect.left - spotlightPadding}
                            y={targetRect.top - spotlightPadding}
                            width={targetRect.width + spotlightPadding * 2}
                            height={targetRect.height + spotlightPadding * 2}
                            rx="12"
                            ry="12"
                            fill="black"
                        />
                    </mask>
                </defs>
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="rgba(0, 0, 0, 0.75)"
                    mask="url(#spotlight-mask)"
                    style={{ transition: 'all 0.3s ease' }}
                />
            </svg>

            {/* Spotlight border glow */}
            <div
                className="absolute rounded-xl transition-all duration-300 ease-out"
                style={{
                    left: targetRect.left - spotlightPadding - 2,
                    top: targetRect.top - spotlightPadding - 2,
                    width: targetRect.width + (spotlightPadding + 2) * 2,
                    height: targetRect.height + (spotlightPadding + 2) * 2,
                    border: '2px solid rgba(194, 120, 62, 0.6)',
                    boxShadow: '0 0 20px rgba(194, 120, 62, 0.3), inset 0 0 20px rgba(194, 120, 62, 0.1)',
                    pointerEvents: 'none',
                }}
            />

            {/* Click blocker (transparent, but blocks clicks outside spotlight) */}
            <div
                className="absolute inset-0"
                onClick={(e) => {
                    // Spotlight dışında tıklamayı engelle
                    e.stopPropagation();
                }}
                style={{ pointerEvents: 'auto' }}
            />

            {/* Tooltip */}
            <div
                ref={tooltipRef}
                className={`absolute w-80 transition-all duration-300 ease-out ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                style={{
                    ...tooltipStyle,
                    pointerEvents: 'auto',
                    zIndex: 10000,
                }}
            >
                <div className="bg-dark-secondary border border-dark-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
                    {/* Header */}
                    <div className="px-5 pt-5 pb-3">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent">
                                    {step.icon}
                                </div>
                                <h3 className="text-sm font-bold text-warm-50">{step.title}</h3>
                            </div>
                            <button
                                onClick={handleSkip}
                                className="p-1.5 text-warm-500 hover:text-warm-200 hover:bg-dark-surface rounded-lg transition-all"
                                title="Kapat"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <p className="text-xs leading-relaxed text-warm-300">
                            {step.description}
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 bg-dark-elevated/50 border-t border-dark-border flex items-center justify-between">
                        {/* Step indicator + skip */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                {activeSteps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentStep
                                            ? 'bg-accent w-4'
                                            : i < currentStep
                                                ? 'bg-accent/50'
                                                : 'bg-warm-600'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] text-warm-500 font-medium">
                                {currentStep + 1} / {activeSteps.length}
                            </span>
                        </div>

                        {/* Navigation buttons */}
                        <div className="flex items-center gap-2">
                            {currentStep > 0 && (
                                <button
                                    onClick={handlePrev}
                                    className="px-3 py-1.5 text-[11px] font-semibold text-warm-300 hover:text-warm-50 hover:bg-dark-surface rounded-lg transition-all flex items-center gap-1"
                                >
                                    <ChevronLeft size={14} /> Geri
                                </button>
                            )}
                            {currentStep === 0 && (
                                <button
                                    onClick={handleSkip}
                                    className="px-3 py-1.5 text-[11px] font-semibold text-warm-400 hover:text-warm-200 rounded-lg transition-all"
                                >
                                    Atla
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="px-4 py-1.5 text-[11px] font-bold bg-gradient-to-r from-accent to-accent-dark hover:from-accent-hover hover:to-accent text-white rounded-lg transition-all flex items-center gap-1 shadow-lg shadow-accent/20"
                            >
                                {currentStep === activeSteps.length - 1 ? (
                                    'Tamam'
                                ) : (
                                    <>İleri <ChevronRight size={14} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
