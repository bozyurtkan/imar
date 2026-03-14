import React from 'react';
import { ArrowLeft, Scale } from 'lucide-react';
import { BlogSection } from './BlogSection';

interface BlogPageProps {
    onBack: () => void;
    onReadArticle: (slug: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onBack, onReadArticle }) => {
    return (
        <div className="landing-page min-h-screen relative overflow-hidden bg-dark-bg">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-[40%] right-[-10%] w-[40%] h-[60%] bg-warm-500/5 blur-[100px] rounded-full pointer-events-none" />

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
