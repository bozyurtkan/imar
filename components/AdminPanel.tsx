import React, { useEffect, useState } from 'react';
import {
    X, Users, MessageSquare, Calendar, Clock, ArrowRight,
    Activity, TrendingUp, Search, ChevronLeft, Eye, User,
    BarChart3, Shield, RefreshCw
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
    const [activeTab, setActiveTab] = useState<'users' | 'today'>('today');

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
            const [usersData, statsData, todayData] = await Promise.all([
                getAllUsersWithHistory(),
                getAdminStats(),
                getTodayActivity()
            ]);
            setUsers(usersData);
            setStats(statsData);
            setTodayActivity(todayData);
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

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (date: Date | null) => {
        if (!date) return 'Bilinmiyor';
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatSessionDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            weekday: 'long'
        });
    };

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
                                <p className="text-xs text-warm-500">Kullanıcı Aktivite İzleme</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="p-3 bg-dark-surface hover:bg-dark-surface-hover border border-dark-border rounded-xl transition-colors disabled:opacity-50"
                            >
                                <RefreshCw size={18} className={`text-warm-300 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-3 bg-dark-surface hover:bg-dark-surface-hover border border-dark-border rounded-xl transition-colors"
                            >
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
                        {/* Sol Panel - İstatistikler ve Kullanıcı Listesi */}
                        <div className="w-80 border-r border-dark-border flex flex-col bg-dark-secondary">
                            {/* İstatistik Kartları */}
                            {stats && (
                                <div className="p-4 grid grid-cols-2 gap-3 border-b border-dark-border">
                                    <div className="bg-dark-surface p-3 rounded-xl border border-dark-border">
                                        <div className="flex items-center gap-2 text-accent mb-1">
                                            <Users size={14} />
                                            <span className="text-[10px] font-bold uppercase">Kullanıcı</span>
                                        </div>
                                        <p className="text-2xl font-bold text-warm-50">{stats.totalUsers}</p>
                                    </div>
                                    <div className="bg-dark-surface p-3 rounded-xl border border-dark-border">
                                        <div className="flex items-center gap-2 text-green-400 mb-1">
                                            <Activity size={14} />
                                            <span className="text-[10px] font-bold uppercase">Bugün</span>
                                        </div>
                                        <p className="text-2xl font-bold text-warm-50">{stats.todayActiveUsers}</p>
                                    </div>
                                    <div className="bg-dark-surface p-3 rounded-xl border border-dark-border">
                                        <div className="flex items-center gap-2 text-purple-400 mb-1">
                                            <Calendar size={14} />
                                            <span className="text-[10px] font-bold uppercase">Oturum</span>
                                        </div>
                                        <p className="text-2xl font-bold text-warm-50">{stats.totalSessions}</p>
                                    </div>
                                    <div className="bg-dark-surface p-3 rounded-xl border border-dark-border">
                                        <div className="flex items-center gap-2 text-amber-400 mb-1">
                                            <MessageSquare size={14} />
                                            <span className="text-[10px] font-bold uppercase">Mesaj</span>
                                        </div>
                                        <p className="text-2xl font-bold text-warm-50">{stats.totalMessages}</p>
                                    </div>
                                </div>
                            )}

                            {/* Tab Seçici */}
                            <div className="p-3 flex gap-2 border-b border-dark-border">
                                <button
                                    onClick={() => setActiveTab('today')}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'today'
                                        ? 'bg-accent text-white'
                                        : 'bg-dark-surface text-warm-400 hover:bg-dark-surface-hover border border-dark-border'
                                        }`}
                                >
                                    <Activity size={14} className="inline mr-1" />
                                    Bugün
                                </button>
                                <button
                                    onClick={() => setActiveTab('users')}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'users'
                                        ? 'bg-accent text-white'
                                        : 'bg-dark-surface text-warm-400 hover:bg-dark-surface-hover border border-dark-border'
                                        }`}
                                >
                                    <Users size={14} className="inline mr-1" />
                                    Kullanıcılar
                                </button>
                            </div>

                            {/* Arama */}
                            {activeTab === 'users' && (
                                <div className="p-3 border-b border-dark-border">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-500" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="E-posta veya ID ara..."
                                            className="w-full pl-9 pr-4 py-2 bg-dark-surface border border-dark-border rounded-xl text-sm text-warm-50 placeholder-warm-600 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50 transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Liste */}
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
                                                    ? 'bg-accent text-white'
                                                    : 'bg-dark-surface hover:bg-dark-surface-hover border border-dark-border'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${selectedSession?.id === activity.session.id
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-accent/10 text-accent'
                                                        }`}>
                                                        <User size={12} />
                                                    </div>
                                                    <span className={`text-xs font-medium truncate ${selectedSession?.id === activity.session.id ? 'text-white/80' : 'text-warm-400'
                                                        }`}>
                                                        {activity.userEmail || activity.userId.slice(0, 8) + '...'}
                                                    </span>
                                                </div>
                                                <p className={`text-xs line-clamp-2 ${selectedSession?.id === activity.session.id ? 'text-white/70' : 'text-warm-500'
                                                    }`}>
                                                    {activity.session.preview}
                                                </p>
                                                <div className={`flex items-center gap-2 mt-2 text-[10px] ${selectedSession?.id === activity.session.id ? 'text-white/60' : 'text-warm-600'
                                                    }`}>
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
                                                    ? 'bg-accent text-white'
                                                    : 'bg-dark-surface hover:bg-dark-surface-hover border border-dark-border'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${selectedUser?.id === u.id
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-accent/10 text-accent'
                                                        }`}>
                                                        {u.email ? u.email[0].toUpperCase() : '?'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium truncate ${selectedUser?.id === u.id ? 'text-white' : 'text-warm-100'
                                                            }`}>
                                                            {u.email || 'Anonim'}
                                                        </p>
                                                        <p className={`text-[10px] truncate ${selectedUser?.id === u.id ? 'text-white/60' : 'text-warm-600'
                                                            }`}>
                                                            ID: {u.id.slice(0, 12)}...
                                                        </p>
                                                    </div>
                                                    <ArrowRight size={14} className={selectedUser?.id === u.id ? 'text-white/60' : 'text-warm-600'} />
                                                </div>
                                                <div className={`flex items-center gap-3 text-[10px] mt-2 ${selectedUser?.id === u.id ? 'text-white/60' : 'text-warm-600'
                                                    }`}>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={10} /> {u.totalSessions} oturum
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MessageSquare size={10} /> {u.totalMessages} mesaj
                                                    </span>
                                                </div>
                                            </button>
                                        ))
                                    )
                                )}
                            </div>
                        </div>

                        {/* Sağ Panel - Detay Görünümü */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {selectedSession ? (
                                <>
                                    {/* Session Header */}
                                    <div className="p-4 border-b border-dark-border">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setSelectedSession(null)}
                                                className="p-2 hover:bg-dark-surface rounded-xl transition-colors"
                                            >
                                                <ChevronLeft size={20} className="text-warm-400" />
                                            </button>
                                            <div>
                                                <h3 className="font-bold text-warm-50">
                                                    {formatSessionDate(selectedSession.date)}
                                                </h3>
                                                <p className="text-xs text-warm-500">
                                                    {selectedSession.userEmail || 'Anonim Kullanıcı'} • {selectedSession.messages?.length || 0} mesaj
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4 bg-dark-primary custom-scrollbar">
                                        {selectedSession.messages?.map((msg: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user'
                                                    ? 'bg-accent text-white rounded-br-md'
                                                    : 'bg-dark-surface border border-dark-border rounded-bl-md'
                                                    }`}>
                                                    <div className={`text-[10px] font-bold uppercase mb-2 ${msg.role === 'user' ? 'text-white/60' : 'text-warm-500'
                                                        }`}>
                                                        {msg.role === 'user' ? '👤 Kullanıcı' : '🤖 Asistan'}
                                                    </div>
                                                    <p className={`text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'text-white' : 'text-warm-200'
                                                        }`}>
                                                        {msg.text}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : selectedUser ? (
                                <>
                                    {/* User Header */}
                                    <div className="p-4 border-b border-dark-border">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(null);
                                                    setSelectedUserHistory([]);
                                                }}
                                                className="p-2 hover:bg-dark-surface rounded-xl transition-colors"
                                            >
                                                <ChevronLeft size={20} className="text-warm-400" />
                                            </button>
                                            <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center text-accent font-bold">
                                                {selectedUser.email ? selectedUser.email[0].toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-warm-50">
                                                    {selectedUser.email || 'Anonim Kullanıcı'}
                                                </h3>
                                                <p className="text-xs text-warm-500">
                                                    Son aktivite: {formatDate(selectedUser.lastActivity)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* User Sessions */}
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
                                                            <span className="text-sm font-bold text-warm-100">
                                                                {formatSessionDate(session.date)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] bg-dark-elevated px-2 py-1 rounded-full text-warm-500">
                                                                {session.messageCount || session.messages?.length || 0} mesaj
                                                            </span>
                                                            <Eye size={14} className="text-warm-600 group-hover:text-accent transition-colors" />
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-warm-500 line-clamp-2">
                                                        {session.preview}
                                                    </p>
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
                                                : 'Sol panelden bir kullanıcı seçerek sohbet geçmişini görüntüleyin'
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
