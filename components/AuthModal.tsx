import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { X, Mail, Lock, User as UserIcon, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

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
            onClose();
        } catch (err: any) {
            console.error(err);
            let msg = "Bir hata oluştu.";
            if (err.code === 'auth/invalid-email') msg = "Geçersiz e-posta adresi.";
            else if (err.code === 'auth/user-not-found') msg = "Kullanıcı bulunamadı.";
            else if (err.code === 'auth/wrong-password') msg = "Hatalı şifre.";
            else if (err.code === 'auth/email-already-in-use') msg = "Bu e-posta zaten kullanımda.";
            else if (err.code === 'auth/weak-password') msg = "Şifre en az 6 karakter olmalı.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center modal-overlay p-4 fade-in">
            <div
                className="relative w-full max-w-md bg-dark-tertiary rounded-2xl shadow-2xl overflow-hidden border border-dark-border scale-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Dekoratif Gradient Çizgi */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-accent-dark to-amber-600"></div>

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 text-warm-400 hover:text-warm-50 bg-dark-surface hover:bg-dark-surface-hover rounded-full transition-colors"
                >
                    <X size={18} />
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-amber-400 mb-2">
                            {isLogin ? 'Hoş Geldiniz' : 'Hesap Oluştur'}
                        </h2>
                        <p className="text-sm text-warm-400">
                            {isLogin
                                ? 'İmar mevzuatı asistanınıza erişmek için giriş yapın.'
                                : 'Verilerinizi bulutta saklamak için ücretsiz kayıt olun.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-warm-400 ml-1">Ad Soyad</label>
                                <div className="relative">
                                    <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-500" />
                                    <input
                                        type="text"
                                        required={!isLogin}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Adınız Soyadınız"
                                        className="w-full pl-10 pr-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50 text-warm-50 placeholder-warm-600 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-warm-400 ml-1">E-Posta</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-500" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ornek@email.com"
                                    className="w-full pl-10 pr-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50 text-warm-50 placeholder-warm-600 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-warm-400 ml-1">Şifre</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-500" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="******"
                                    className="w-full pl-10 pr-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50 text-warm-50 placeholder-warm-600 transition-all"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-900/20 border border-red-800/50 rounded-xl flex items-start gap-2">
                                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-red-300 font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-accent to-accent-dark hover:from-accent-hover hover:to-accent text-white rounded-xl font-bold text-sm shadow-lg shadow-accent/15 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
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

                    <div className="mt-6 text-center">
                        <p className="text-xs text-warm-500">
                            {isLogin ? "Hesabınız yok mu?" : "Zaten hesabınız var mı?"}
                            <button
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="ml-1 text-accent font-bold hover:text-accent-hover hover:underline transition-colors"
                            >
                                {isLogin ? "Şimdi Kayıt Olun" : "Giriş Yapın"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
