import React, { useEffect, useState } from 'react';
import {
    X, Users, MessageSquare, Calendar, Clock, ArrowRight,
    Activity, TrendingUp, Search, ChevronLeft, Eye, User,
    BarChart3, Shield, RefreshCw, CreditCard, Package, Settings,
    Plus, Minus, Save, Zap, History
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
    getAllUsersWithHistory,
    getUserAllHistory,
    getAdminStats,
    getTodayActivity,
    UserInfo,
    UserSession,
    AdminStats
} from '../services/adminService';
import {
    getAllPlans, getAllModules, updateModuleCost, adjustCredit,
    assignPlan, getCreditLogs, renewAllCredits, initializeDefaultData
} from '../services/creditService';
import { CreditPlan, CreditModule, CreditLog } from '../types';

interface AdminPanelProps {
    onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
    const { user, isAdmin } = useAuth();
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
    const [selectedUserHistory, setSelectedUserHistory] = useState<UserSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<UserSession | null>(null);
    const [todayActivity, setTodayActivity] = useState<{ userId: string; userEmail: string | null; session: UserSession }[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'today' | 'users' | 'credits' | 'modules'>('today');

    // Kredi yönetimi state'leri
    const [plans, setPlans] = useState<CreditPlan[]>([]);
    const [modules, setModules] = useState<CreditModule[]>([]);
    const [creditLogs, setCreditLogs] = useState<CreditLog[]>([]);
    const [selectedCreditUser, setSelectedCreditUser] = useState<UserInfo | null>(null);
    const [creditAmount, setCreditAmount] = useState<number>(0);
    const [creditReason, setCreditReason] = useState('');
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [editingModule, setEditingModule] = useState<string | null>(null);
    const [editModuleCost, setEditModuleCost] = useState<number>(0);
    const [renewResult, setRenewResult] = useState<{ renewed: number; expired: number } | null>(null);

    // Admin değilse erişimi engelle
    if (!isAdmin) {
        return (
            <div className="fixed inset-0 z-[150] flex items-center justify-center modal-overlay">
                <div className="bg-dark-tertiary border border-dark-border p-8 rounded-2xl text-center max-w-sm">
                    <div className="w-16 h-16 bg-red-900/20 border border-red-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield size={32} className="text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-warm-50 mb-2">Erişim Engellendi</h2>
                    <p className="text-sm text-warm-500 mb-4">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
                    <button onClick={onClose} className="px-6 py-2 bg-dark-surface hover:bg-dark-surface-hover border border-dark-border rounded-xl text-sm font-medium text-warm-200 transition-colors">
                        Kapat
                    </button>
                </div>
            </div>
        );
    }

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            await initializeDefaultData();
            const [usersData, statsData, todayData, plansData, modulesData] = await Promise.all([
                getAllUsersWithHistory(),
                getAdminStats(),
                getTodayActivity(),
                getAllPlans(),
                getAllModules()
            ]);
            setUsers(usersData);
            setStats(statsData);
            setTodayActivity(todayData);
            setPlans(plansData);
            setModules(modulesData);
        } catch (error) {
            console.error("Admin verileri yüklenemedi:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleSelectUser = async (userInfo: UserInfo) => {
        setSelectedUser(userInfo);
        setSelectedSession(null);
        const history = await getUserAllHistory(userInfo.id);
        setSelectedUserHistory(history);
    };

    const handleAdjustCredit = async () => {
        if (!selectedCreditUser || creditAmount === 0) return;
        const success = await adjustCredit(selectedCreditUser.id, creditAmount, creditReason || 'Admin ayarlaması');
        if (success) {
            setShowCreditModal(false);
            setCreditAmount(0);
            setCreditReason('');
            await handleRefresh();
        } else {
            alert('Kredi ayarlama başarısız!');
        }
    };

    const handleAssignPlan = async (userId: string, planId: string) => {
        const success = await assignPlan(userId, planId);
        if (success) {
            await handleRefresh();
        } else {
            alert('Plan atama başarısız!');
        }
    };

    const handleSaveModuleCost = async (moduleId: string) => {
        const success = await updateModuleCost(moduleId, editModuleCost);
        if (success) {
            setEditingModule(null);
            const updatedModules = await getAllModules();
            setModules(updatedModules);
        } else {
            alert('Maliyet güncelleme başarısız!');
        }
    };

    const handleViewLogs = async (userId: string) => {
        const logs = await getCreditLogs(userId, 50);
        setCreditLogs(logs);
        setShowLogsModal(true);
    };

    const handleRenewAll = async () => {
        if (!confirm('Tüm süresi dolmuş abonelikleri yenilemek/sıfırlamak istediğinize emin misiniz?')) return;
        const result = await renewAllCredits();
        setRenewResult(result);
        await handleRefresh();
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (date: Date | null) => {
        if (!date) return 'Bilinmiyor';
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatSessionDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: 'numeric', month: 'long', year: 'numeric', weekday: 'long'
        });
    };

    const getPlanBadge = (plan?: string) => {
        const colors: Record<string, string> = {
            free: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
            basic: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            pro: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            premium: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        };
        const labels: Record<string, string> = { free: 'Ücretsiz', basic: 'Temel', pro: 'Pro', premium: 'Premium' };
        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colors[plan || 'free'] || colors.free}`}>
                {labels[plan || 'free'] || plan}
            </span>
        );
    };

    // ========== KREDİ YÖNETİMİ PANELİ ==========
    const renderCreditsPanel = () => (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Üst Toolbar */}
            <div className="p-4 border-b border-dark-border flex items-center justify-between">
                <h3 className="font-bold text-warm-50 flex items-center gap-2">
                    <CreditCard size={18} className="text-accent" /> Kredi Yönetimi
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRenewAll}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600/20 border border-green-600/30 text-green-400 rounded-xl text-xs font-bold hover:bg-green-600/30 transition-all"
                    >
                        <RefreshCw size={12} /> Toplu Yenile
                    </button>
                </div>
            </div>

            {renewResult && (
                <div className="mx-4 mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-xs text-green-300 flex items-center justify-between">
                    <span>✅ {renewResult.renewed} yenilendi, {renewResult.expired} süresi doldu (free plana düşürüldü)</span>
                    <button onClick={() => setRenewResult(null)} className="text-green-500 hover:text-green-300"><X size={14} /></button>
                </div>
            )}

            {/* Kullanıcı Kredi Tablosu */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="space-y-2">
                    {filteredUsers.map(u => (
                        <div key={u.id} className="p-4 bg-dark-surface rounded-xl border border-dark-border hover:border-accent/20 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-9 h-9 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center text-accent font-bold text-sm shrink-0">
                                        {u.email ? u.email[0].toUpperCase() : '?'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="text-sm font-medium text-warm-100 truncate">{u.email || 'Anonim'}</p>
                                            {getPlanBadge(u.subscriptionPlan)}
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-warm-500">
                                            <span>Kalan: <span className={`font-bold ${(u.remainingCredit ?? 0) <= 10 ? 'text-red-400' : 'text-accent'}`}>{u.remainingCredit ?? 0}</span> / {u.totalCredit ?? 100}</span>
                                            {u.subscriptionEndDate && <span>Bitiş: {u.subscriptionEndDate}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <select
                                        value={u.subscriptionPlan || 'free'}
                                        onChange={(e) => handleAssignPlan(u.id, e.target.value)}
                                        className="px-2 py-1.5 bg-dark-elevated border border-dark-border rounded-lg text-[10px] text-warm-200 cursor-pointer focus:outline-none"
                                    >
                                        {plans.map(p => (
                                            <option key={p.id} value={p.id}>{p.displayName} ({p.monthlyCredit} kr)</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => { setSelectedCreditUser(u); setShowCreditModal(true); }}
                                        className="p-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition-all"
                                        title="Kredi Ekle/Düş"
                                    >
                                        <CreditCard size={14} />
                                    </button>
                                    <button
                                        onClick={() => { setSelectedCreditUser(u); handleViewLogs(u.id); }}
                                        className="p-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-all"
                                        title="Kredi Geçmişi"
                                    >
                                        <History size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // ========== MODÜL MALİYETLERİ PANELİ ==========
    const renderModulesPanel = () => (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-dark-border">
                <h3 className="font-bold text-warm-50 flex items-center gap-2">
                    <Settings size={18} className="text-purple-400" /> Modül Kredi Maliyetleri
                </h3>
                <p className="text-[11px] text-warm-500 mt-1">Her modülün soru başına kredi maliyetini güncelleyebilirsiniz.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {modules.map(m => (
                        <div key={m.id} className="p-4 bg-dark-surface rounded-xl border border-dark-border hover:border-accent/20 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{m.icon}</span>
                                    <div>
                                        <p className="text-sm font-bold text-warm-100">{m.displayName}</p>
                                        <p className="text-[10px] text-warm-500">ID: {m.id}</p>
                                    </div>
                                </div>
                                {editingModule === m.id ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={editModuleCost}
                                            onChange={(e) => setEditModuleCost(parseInt(e.target.value) || 0)}
                                            className="w-16 px-2 py-1 bg-dark-elevated border border-accent/40 rounded-lg text-sm text-warm-50 text-center focus:outline-none"
                                            min="0"
                                        />
                                        <button
                                            onClick={() => handleSaveModuleCost(m.id)}
                                            className="p-1.5 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-all"
                                        >
                                            <Save size={14} />
                                        </button>
                                        <button
                                            onClick={() => setEditingModule(null)}
                                            className="p-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => { setEditingModule(m.id); setEditModuleCost(m.creditCost); }}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-dark-elevated border border-dark-border rounded-lg hover:border-accent/30 transition-all"
                                    >
                                        <Zap size={12} className="text-amber-400" />
                                        <span className="text-sm font-bold text-warm-100">{m.creditCost}</span>
                                        <span className="text-[10px] text-warm-500">kredi</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Plan Bilgileri */}
                <div className="mt-6">
                    <h4 className="text-sm font-bold text-warm-200 mb-3 flex items-center gap-2">
                        <Package size={14} className="text-accent" /> Mevcut Paketler
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {plans.map(p => (
                            <div key={p.id} className="p-4 bg-dark-surface rounded-xl border border-dark-border">
                                <div className="flex items-center gap-2 mb-2">
                                    {getPlanBadge(p.name)}
                                </div>
                                <p className="text-2xl font-black text-warm-50">{p.monthlyCredit}</p>
                                <p className="text-[10px] text-warm-500">aylık kredi</p>
                                <p className="text-sm font-bold text-accent mt-2">₺{p.price}/ay</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[150] flex modal-overlay" onClick={onClose}>
            <div
                className="w-full h-[calc(100vh-2rem)] max-w-7xl mx-auto my-4 bg-dark-tertiary border border-dark-border rounded-2xl shadow-2xl overflow-hidden flex flex-col scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 lg:p-6 border-b border-dark-border bg-gradient-to-r from-accent/15 to-purple-500/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center">
                                <Shield size={24} className="text-accent" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-warm-50">Admin Panel</h1>
                                <p className="text-xs text-warm-500">Kullanıcı & Kredi Yönetimi</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={handleRefresh} disabled={refreshing} className="p-3 bg-dark-surface hover:bg-dark-surface-hover border border-dark-border rounded-xl transition-colors disabled:opacity-50">
                                <RefreshCw size={18} className={`text-warm-300 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                            <button onClick={onClose} className="p-3 bg-dark-surface hover:bg-dark-surface-hover border border-dark-border rounded-xl transition-colors">
                                <X size={18} className="text-warm-300" />
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-warm-500">Veriler yükleniyor...</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex overflow-hidden">
                        {/* Sol Panel */}
                        <div className="w-80 border-r border-dark-border flex flex-col bg-dark-secondary">
                            {/* İstatistik Kartları */}
                            {stats && (
                                <div className="p-4 grid grid-cols-2 gap-3 border-b border-dark-border">
                                    <div className="bg-dark-surface p-3 rounded-xl border border-dark-border">
                                        <div className="flex items-center gap-2 text-accent mb-1">
                                            <Users size={14} /><span className="text-[10px] font-bold uppercase">Kullanıcı</span>
                                        </div>
                                        <p className="text-2xl font-bold text-warm-50">{stats.totalUsers}</p>
                                    </div>
                                    <div className="bg-dark-surface p-3 rounded-xl border border-dark-border">
                                        <div className="flex items-center gap-2 text-green-400 mb-1">
                                            <Activity size={14} /><span className="text-[10px] font-bold uppercase">Bugün</span>
                                        </div>
                                        <p className="text-2xl font-bold text-warm-50">{stats.todayActiveUsers}</p>
                                    </div>
                                    <div className="bg-dark-surface p-3 rounded-xl border border-dark-border">
                                        <div className="flex items-center gap-2 text-purple-400 mb-1">
                                            <Calendar size={14} /><span className="text-[10px] font-bold uppercase">Oturum</span>
                                        </div>
                                        <p className="text-2xl font-bold text-warm-50">{stats.totalSessions}</p>
                                    </div>
                                    <div className="bg-dark-surface p-3 rounded-xl border border-dark-border">
                                        <div className="flex items-center gap-2 text-amber-400 mb-1">
                                            <MessageSquare size={14} /><span className="text-[10px] font-bold uppercase">Mesaj</span>
                                        </div>
                                        <p className="text-2xl font-bold text-warm-50">{stats.totalMessages}</p>
                                    </div>
                                </div>
                            )}

                            {/* Tab Seçici - 4 tab */}
                            <div className="p-3 grid grid-cols-2 gap-2 border-b border-dark-border">
                                {([
                                    { id: 'today' as const, icon: <Activity size={12} />, label: 'Bugün' },
                                    { id: 'users' as const, icon: <Users size={12} />, label: 'Kullanıcılar' },
                                    { id: 'credits' as const, icon: <CreditCard size={12} />, label: 'Krediler' },
                                    { id: 'modules' as const, icon: <Settings size={12} />, label: 'Modüller' }
                                ] as const).map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-2 px-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${activeTab === tab.id
                                            ? 'bg-accent text-white'
                                            : 'bg-dark-surface text-warm-400 hover:bg-dark-surface-hover border border-dark-border'
                                            }`}
                                    >
                                        {tab.icon} {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Arama */}
                            {(activeTab === 'users' || activeTab === 'credits') && (
                                <div className="p-3 border-b border-dark-border">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-500" />
                                        <input
                                            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="E-posta veya ID ara..."
                                            className="w-full pl-9 pr-4 py-2 bg-dark-surface border border-dark-border rounded-xl text-sm text-warm-50 placeholder-warm-600 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50 transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Liste (today/users tabları için) */}
                            {(activeTab === 'today' || activeTab === 'users') && (
                                <div className="flex-1 overflow-y-auto p-3 pb-10 space-y-2 custom-scrollbar">
                                    {activeTab === 'today' ? (
                                        todayActivity.length === 0 ? (
                                            <div className="text-center py-8 text-warm-500">
                                                <Activity size={32} className="mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">Bugün henüz aktivite yok</p>
                                            </div>
                                        ) : (
                                            todayActivity.map((activity, idx) => (
                                                <button
                                                    key={`${activity.userId}-${idx}`}
                                                    onClick={() => setSelectedSession(activity.session)}
                                                    className={`w-full p-3 rounded-xl text-left transition-all ${selectedSession?.id === activity.session.id
                                                        ? 'bg-accent text-white' : 'bg-dark-surface hover:bg-dark-surface-hover border border-dark-border'}`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${selectedSession?.id === activity.session.id ? 'bg-white/20 text-white' : 'bg-accent/10 text-accent'}`}>
                                                            <User size={12} />
                                                        </div>
                                                        <span className={`text-xs font-medium truncate ${selectedSession?.id === activity.session.id ? 'text-white/80' : 'text-warm-400'}`}>
                                                            {activity.userEmail || activity.userId.slice(0, 8) + '...'}
                                                        </span>
                                                    </div>
                                                    <p className={`text-xs line-clamp-2 ${selectedSession?.id === activity.session.id ? 'text-white/70' : 'text-warm-500'}`}>
                                                        {activity.session.preview}
                                                    </p>
                                                    <div className={`flex items-center gap-2 mt-2 text-[10px] ${selectedSession?.id === activity.session.id ? 'text-white/60' : 'text-warm-600'}`}>
                                                        <MessageSquare size={10} />
                                                        {activity.session.messageCount || activity.session.messages?.length || 0} mesaj
                                                    </div>
                                                </button>
                                            ))
                                        )
                                    ) : (
                                        filteredUsers.length === 0 ? (
                                            <div className="text-center py-8 text-warm-500">
                                                <Users size={32} className="mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">Kullanıcı bulunamadı</p>
                                            </div>
                                        ) : (
                                            filteredUsers.map((u) => (
                                                <button
                                                    key={u.id}
                                                    onClick={() => handleSelectUser(u)}
                                                    className={`w-full p-3 rounded-xl text-left transition-all ${selectedUser?.id === u.id
                                                        ? 'bg-accent text-white' : 'bg-dark-surface hover:bg-dark-surface-hover border border-dark-border'}`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${selectedUser?.id === u.id ? 'bg-white/20 text-white' : 'bg-accent/10 text-accent'}`}>
                                                            {u.email ? u.email[0].toUpperCase() : '?'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className={`text-sm font-medium truncate ${selectedUser?.id === u.id ? 'text-white' : 'text-warm-100'}`}>{u.email || 'Anonim'}</p>
                                                                {getPlanBadge(u.subscriptionPlan)}
                                                            </div>
                                                            <p className={`text-[10px] truncate ${selectedUser?.id === u.id ? 'text-white/60' : 'text-warm-600'}`}>
                                                                Kredi: {u.remainingCredit ?? 0}/{u.totalCredit ?? 100}
                                                            </p>
                                                        </div>
                                                        <ArrowRight size={14} className={selectedUser?.id === u.id ? 'text-white/60' : 'text-warm-600'} />
                                                    </div>
                                                </button>
                                            ))
                                        )
                                    )}
                                </div>
                            )}

                            {/* credits / modules tabları için boş placeholder (sağ panelde gösterilir) */}
                            {(activeTab === 'credits' || activeTab === 'modules') && (
                                <div className="flex-1 flex items-center justify-center p-4">
                                    <div className="text-center text-warm-500">
                                        {activeTab === 'credits' ? <CreditCard size={32} className="mx-auto mb-2 opacity-50" /> : <Settings size={32} className="mx-auto mb-2 opacity-50" />}
                                        <p className="text-xs">{activeTab === 'credits' ? 'Kredi yönetimi sağ panelde' : 'Modül ayarları sağ panelde'}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sağ Panel */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {activeTab === 'credits' ? renderCreditsPanel() :
                                activeTab === 'modules' ? renderModulesPanel() :
                                    selectedSession ? (
                                        <>
                                            <div className="p-4 border-b border-dark-border">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => setSelectedSession(null)} className="p-2 hover:bg-dark-surface rounded-xl transition-colors">
                                                        <ChevronLeft size={20} className="text-warm-400" />
                                                    </button>
                                                    <div>
                                                        <h3 className="font-bold text-warm-50">{formatSessionDate(selectedSession.date)}</h3>
                                                        <p className="text-xs text-warm-500">{selectedSession.userEmail || 'Anonim'} • {selectedSession.messages?.length || 0} mesaj</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4 bg-dark-primary custom-scrollbar">
                                                {selectedSession.messages?.map((msg: any, idx: number) => (
                                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-accent text-white rounded-br-md' : 'bg-dark-surface border border-dark-border rounded-bl-md'}`}>
                                                            <div className={`text-[10px] font-bold uppercase mb-2 ${msg.role === 'user' ? 'text-white/60' : 'text-warm-500'}`}>
                                                                {msg.role === 'user' ? '👤 Kullanıcı' : '🤖 Asistan'}
                                                            </div>
                                                            <p className={`text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'text-white' : 'text-warm-200'}`}>{msg.text}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : selectedUser ? (
                                        <>
                                            <div className="p-4 border-b border-dark-border">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => { setSelectedUser(null); setSelectedUserHistory([]); }} className="p-2 hover:bg-dark-surface rounded-xl transition-colors">
                                                        <ChevronLeft size={20} className="text-warm-400" />
                                                    </button>
                                                    <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center text-accent font-bold">
                                                        {selectedUser.email ? selectedUser.email[0].toUpperCase() : '?'}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-bold text-warm-50">{selectedUser.email || 'Anonim'}</h3>
                                                            {getPlanBadge(selectedUser.subscriptionPlan)}
                                                        </div>
                                                        <p className="text-xs text-warm-500">
                                                            Son: {formatDate(selectedUser.lastActivity)} • Kredi: {selectedUser.remainingCredit ?? 0}/{selectedUser.totalCredit ?? 100}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-4 pb-10 bg-dark-primary custom-scrollbar">
                                                <div className="space-y-3">
                                                    {selectedUserHistory.map((session) => (
                                                        <button
                                                            key={session.id}
                                                            onClick={() => setSelectedSession(session)}
                                                            className="w-full p-4 bg-dark-surface rounded-xl border border-dark-border hover:border-accent/30 hover:bg-dark-surface-hover transition-all text-left group"
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar size={14} className="text-accent" />
                                                                    <span className="text-sm font-bold text-warm-100">{formatSessionDate(session.date)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] bg-dark-elevated px-2 py-1 rounded-full text-warm-500">
                                                                        {session.messageCount || session.messages?.length || 0} mesaj
                                                                    </span>
                                                                    <Eye size={14} className="text-warm-600 group-hover:text-accent transition-colors" />
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-warm-500 line-clamp-2">{session.preview}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center bg-dark-primary">
                                            <div className="text-center p-8">
                                                <div className="w-20 h-20 bg-dark-surface border border-dark-border rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Eye size={32} className="text-warm-600" />
                                                </div>
                                                <h3 className="text-lg font-bold text-warm-300 mb-2">
                                                    {activeTab === 'today' ? 'Aktivite Seçin' : 'Kullanıcı Seçin'}
                                                </h3>
                                                <p className="text-sm text-warm-500">
                                                    {activeTab === 'today'
                                                        ? 'Sol panelden bugünkü bir aktiviteye tıklayarak detayları görüntüleyin'
                                                        : 'Sol panelden bir kullanıcı seçerek sohbet geçmişini görüntüleyin'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                        </div>
                    </div>
                )}
            </div>

            {/* Kredi Ekleme/Düşme Modalı */}
            {showCreditModal && selectedCreditUser && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center modal-overlay" onClick={() => setShowCreditModal(false)}>
                    <div className="bg-dark-tertiary border border-dark-border w-full max-w-sm rounded-2xl p-6 shadow-2xl scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-warm-50 flex items-center gap-2">
                                <CreditCard size={18} className="text-accent" /> Kredi Ayarla
                            </h3>
                            <button onClick={() => setShowCreditModal(false)} className="p-2 hover:bg-dark-surface rounded-lg">
                                <X size={16} className="text-warm-400" />
                            </button>
                        </div>
                        <p className="text-xs text-warm-500 mb-4">{selectedCreditUser.email || 'Anonim'} • Mevcut: {selectedCreditUser.remainingCredit ?? 0}</p>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold text-warm-500 uppercase block mb-1">Miktar (+ekle / -düş)</label>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setCreditAmount(prev => prev - 10)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"><Minus size={14} /></button>
                                    <input
                                        type="number" value={creditAmount} onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                                        className="flex-1 px-3 py-2 bg-dark-surface border border-dark-border rounded-xl text-sm text-center text-warm-50 focus:outline-none focus:border-accent/50"
                                    />
                                    <button onClick={() => setCreditAmount(prev => prev + 10)} className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-all"><Plus size={14} /></button>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-warm-500 uppercase block mb-1">Açıklama (opsiyonel)</label>
                                <input
                                    type="text" value={creditReason} onChange={(e) => setCreditReason(e.target.value)}
                                    placeholder="Örn: Kampanya bonusu"
                                    className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-xl text-sm text-warm-50 placeholder-warm-600 focus:outline-none focus:border-accent/50"
                                />
                            </div>
                            <button
                                onClick={handleAdjustCredit}
                                disabled={creditAmount === 0}
                                className="w-full py-3 bg-accent hover:bg-accent-hover disabled:bg-dark-elevated disabled:text-warm-600 text-white font-bold rounded-xl transition-all mt-2"
                            >
                                {creditAmount > 0 ? `+${creditAmount} Kredi Ekle` : creditAmount < 0 ? `${creditAmount} Kredi Düş` : 'Miktar Girin'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Kredi Log Modalı */}
            {showLogsModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center modal-overlay" onClick={() => setShowLogsModal(false)}>
                    <div className="bg-dark-tertiary border border-dark-border w-full max-w-lg max-h-[70vh] rounded-2xl shadow-2xl scale-in flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-dark-border flex items-center justify-between shrink-0">
                            <h3 className="font-bold text-warm-50 flex items-center gap-2">
                                <History size={18} className="text-purple-400" />
                                Kredi Geçmişi
                                {selectedCreditUser && <span className="text-xs text-warm-500 font-normal">— {selectedCreditUser.email}</span>}
                            </h3>
                            <button onClick={() => setShowLogsModal(false)} className="p-2 hover:bg-dark-surface rounded-lg">
                                <X size={16} className="text-warm-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {creditLogs.length === 0 ? (
                                <div className="text-center py-8 text-warm-500">
                                    <History size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Henüz kredi geçmişi bulunmuyor</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {creditLogs.map(log => (
                                        <div key={log.id} className="p-3 bg-dark-surface rounded-xl border border-dark-border flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-warm-100">{log.moduleName}</p>
                                                <p className="text-[10px] text-warm-500">
                                                    {log.createdAt instanceof Date
                                                        ? log.createdAt.toLocaleString('tr-TR')
                                                        : new Date(log.createdAt).toLocaleString('tr-TR')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-red-400">-{log.creditUsed}</p>
                                                <p className="text-[10px] text-warm-500">Kalan: {log.remainingAfter}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
