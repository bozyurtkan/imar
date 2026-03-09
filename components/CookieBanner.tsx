import React, { useState, useEffect } from 'react';

interface CookieBannerProps {
    onOpenLegal?: (tab: string) => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenLegal }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            // Animasyonlu görünüm için kısa bir gecikme ekliyoruz
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookie_consent', 'accepted');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-elevated)',
            borderTop: '1px solid var(--border-color)',
            zIndex: 9999,
            padding: '1rem',
            boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.2)'
        }} className="animate-[slide-up_0.5s_ease-out]">
            <div className="landing-container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl">
                <div className="text-sm font-light text-[var(--text-secondary)] leading-relaxed flex-1">
                    <p>
                        Daha iyi bir deneyim sunmak, site trafiğimizi analiz etmek ve hizmetlerimizi kişiselleştirmek amacıyla çerezler kullanıyoruz.
                        Platformumuzu kullanmaya devam ederek
                        <button
                            onClick={() => onOpenLegal && onOpenLegal('cerez')}
                            className="text-[var(--accent-primary)] hover:underline ml-1 focus:outline-none"
                        >
                            Çerez Politikamızı
                        </button>
                        {' '}kabul etmiş olursunuz.
                    </p>
                </div>
                <div className="shrink-0 w-full sm:w-auto">
                    <button
                        onClick={acceptCookies}
                        style={{
                            backgroundColor: 'var(--accent-primary)',
                            color: 'white',
                        }}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-full font-medium text-sm transition-transform hover:scale-105"
                    >
                        Kabul Et ve Kapat
                    </button>
                </div>
            </div>
            <style>
                {`
                    @keyframes slide-up {
                        from { transform: translateY(100%); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                `}
            </style>
        </div>
    );
};
