import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import {
    Scale, Mail, Lock, User as UserIcon, Loader2, AlertCircle,
    ArrowRight, ArrowLeft, Eye, EyeOff
} from 'lucide-react';

interface LoginPageProps {
    onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBack }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
            }
            // Auth state change will be caught by AuthContext → AppRouter will redirect to app
        } catch (err: any) {
            console.error(err);
            let msg = "Bir hata oluştu.";
            if (err.code === 'auth/invalid-email') msg = "Geçersiz e-posta adresi.";
            else if (err.code === 'auth/user-not-found') msg = "Kullanıcı bulunamadı.";
            else if (err.code === 'auth/wrong-password') msg = "Hatalı şifre.";
            else if (err.code === 'auth/invalid-credential') msg = "E-posta veya şifre hatalı.";
            else if (err.code === 'auth/email-already-in-use') msg = "Bu e-posta zaten kullanımda.";
            else if (err.code === 'auth/weak-password') msg = "Şifre en az 6 karakter olmalı.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Left Panel - Branding */}
            <div className="login-left">
                <div className="login-left-content">
                    <button onClick={onBack} className="login-back-btn">
                        <ArrowLeft size={18} />
                        <span>Ana Sayfa</span>
                    </button>
                    <div className="login-left-brand">
                        <div className="login-left-logo">
                            <Scale size={32} className="text-white" />
                        </div>
                        <h1 className="login-left-title">İmarMevzuat.ai</h1>
                        <p className="login-left-desc">
                            50'den fazla kanun, yönetmelik ve genelge tek bir portalda.
                            Madde atıflı kesin yanıtlar veren Türkiye'nin ilk ve tek imar mevzuatı yapay zekası.
                        </p>
                    </div>
                    <div className="login-left-features">
                        <div className="login-left-feature">
                            <span className="login-left-feature-icon">🧠</span>
                            <span>Halüsinasyon Riski Minimumda, Madde Atıflı Yanıtlar</span>
                        </div>
                        <div className="login-left-feature">
                            <span className="login-left-feature-icon">📚</span>
                            <span>50+ Kanun, Yönetmelik ve Genelge Tek Portalda</span>
                        </div>
                        <div className="login-left-feature">
                            <span className="login-left-feature-icon">🔒</span>
                            <span>7/24 Kesintisiz Erişim, Güvenli Veri Saklama</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="login-right">
                <div className="login-form-container">
                    <div className="login-form-header">
                        <h2 className="login-form-title">
                            {isLogin ? 'Hoş Geldiniz' : 'Hesap Oluşturun'}
                        </h2>
                        <p className="login-form-subtitle">
                            {isLogin
                                ? 'İmar mevzuatı asistanınıza erişmek için giriş yapın.'
                                : 'Ücretsiz hesap oluşturun ve hemen kullanmaya başlayın.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {!isLogin && (
                            <div className="login-field">
                                <label>Ad Soyad</label>
                                <div className="login-input-wrapper">
                                    <UserIcon size={18} className="login-input-icon" />
                                    <input
                                        type="text"
                                        required={!isLogin}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Adınız Soyadınız"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="login-field">
                            <label>E-Posta</label>
                            <div className="login-input-wrapper">
                                <Mail size={18} className="login-input-icon" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ornek@email.com"
                                />
                            </div>
                        </div>

                        <div className="login-field">
                            <label>Şifre</label>
                            <div className="login-input-wrapper">
                                <Lock size={18} className="login-input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="login-password-toggle"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="login-error">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="login-submit-btn">
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-switch">
                        <span>
                            {isLogin ? "Hesabınız yok mu?" : "Zaten hesabınız var mı?"}
                        </span>
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        >
                            {isLogin ? "Şimdi Kayıt Olun" : "Giriş Yapın"}
                        </button>
                    </div>

                    {/* Mobile back button */}
                    <button onClick={onBack} className="login-back-mobile">
                        <ArrowLeft size={16} />
                        Ana Sayfaya Dön
                    </button>
                </div>
            </div>
        </div>
    );
};
