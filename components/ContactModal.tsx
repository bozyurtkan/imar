import React, { useState } from 'react';
import { X, Mail, User, MessageSquare, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz-m8XPgHOEKsTharh_q7Ap1BNHlaKhz2B8xS8oWeMstJQEujU8FURot64XoZd3P4xX6A/exec';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SUBJECTS = [
    'Genel Bilgi',
    'Teknik Destek',
    'Abonelik ve Ödeme',
    'Kurumsal Lisans',
    'Hata Bildirimi',
    'Diğer',
];

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState(SUBJECTS[0]);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, message }),
            });
            setStatus('success');
            setName('');
            setEmail('');
            setSubject(SUBJECTS[0]);
            setMessage('');
        } catch {
            setStatus('error');
        }
    };

    const handleClose = () => {
        setStatus('idle');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center modal-overlay p-4" onClick={handleClose}>
            <div
                className="bg-dark-tertiary border border-dark-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-dark-border flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-warm-50">Bize Ulaşın</h3>
                        <p className="text-xs text-warm-500 mt-1">Mesajınızı iletin, en kısa sürede dönelim.</p>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-dark-surface rounded-xl transition-colors">
                        <X size={20} className="text-warm-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 overflow-y-auto">
                    {status === 'success' ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
                            <CheckCircle size={48} className="text-green-400" />
                            <div>
                                <p className="text-warm-50 font-semibold text-base">Mesajınız iletildi!</p>
                                <p className="text-warm-500 text-sm mt-1">En kısa sürede <span className="text-accent">bilgi@imarmevzuat.com.tr</span> adresinden size dönüş yapacağız.</p>
                            </div>
                            <button onClick={handleClose} className="mt-2 px-6 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors">
                                Kapat
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {/* Ad Soyad */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-warm-400 ml-1">Ad Soyad</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-500" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Adınız Soyadınız"
                                        className="w-full bg-dark-surface border border-dark-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-warm-100 placeholder:text-warm-600 focus:outline-none focus:border-accent transition-colors"
                                    />
                                </div>
                            </div>

                            {/* E-posta */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-warm-400 ml-1">E-Posta</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-500" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="ornek@email.com"
                                        className="w-full bg-dark-surface border border-dark-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-warm-100 placeholder:text-warm-600 focus:outline-none focus:border-accent transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Konu */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-warm-400 ml-1">Konu</label>
                                <select
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-sm text-warm-100 focus:outline-none focus:border-accent transition-colors"
                                >
                                    {SUBJECTS.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Mesaj */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-warm-400 ml-1">Mesaj</label>
                                <div className="relative">
                                    <MessageSquare size={16} className="absolute left-3 top-3.5 text-warm-500" />
                                    <textarea
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Mesajınızı buraya yazın..."
                                        rows={4}
                                        className="w-full bg-dark-surface border border-dark-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-warm-100 placeholder:text-warm-600 focus:outline-none focus:border-accent transition-colors resize-none"
                                    />
                                </div>
                            </div>

                            {status === 'error' && (
                                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 rounded-xl px-3 py-2">
                                    <AlertCircle size={14} />
                                    Bir hata oluştu, lütfen tekrar deneyin.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60"
                            >
                                {status === 'loading' ? (
                                    <><Loader2 size={16} className="animate-spin" /> Gönderiliyor...</>
                                ) : (
                                    <><Send size={16} /> Gönder</>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
