import React, { useEffect } from 'react';
import { ArrowLeft, Scale } from 'lucide-react';
import { BlogSection } from './BlogSection';

interface BlogPageProps {
    onBack: () => void;
    onReadArticle: (slug: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onBack, onReadArticle }) => {
    useEffect(() => {
        const breadcrumb = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Ana Sayfa",
                    "item": "https://imarmevzuat.com.tr/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Makaleler",
                    "item": "https://imarmevzuat.com.tr/makaleler"
                }
            ]
        };
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.innerHTML = JSON.stringify(breadcrumb);
        document.head.appendChild(script);
        return () => { document.head.removeChild(script); };
    }, []);

    return (
        <div className="landing-page min-h-screen relative overflow-hidden">

            <nav className="landing-nav" style={{ borderBottom: '1px solid var(--dark-border)' }}>
                <div className="landing-container landing-nav-inner">
                    <div
                        className="landing-nav-brand cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                            window.history.pushState({}, '', '/');
                            window.dispatchEvent(new PopStateEvent('popstate'));
                        }}
                    >
                        <div className="landing-nav-logo">
                            <Scale size={20} className="text-white" />
                        </div>
                        <span className="landing-nav-title">İmar Mevzuat</span>
                    </div>
                    <div className="landing-nav-actions">
                        <button
                            onClick={onBack}
                            className="landing-btn-ghost flex items-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            <span>Geri</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="relative z-10 pb-24">
                <BlogSection onReadArticle={onReadArticle} isStandalone={true} />
            </div>

            <footer className="landing-footer mt-auto relative z-10">
                <div className="landing-container landing-footer-inner !py-8 text-center border-t border-dark-border">
                    <p className="text-warm-500 text-sm">© 2026 İmar Mevzuat — Tüm hakları saklıdır.</p>
                </div>
            </footer>
        </div>
    );
};
