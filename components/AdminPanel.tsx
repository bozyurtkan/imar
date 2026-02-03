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
            <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl text-center max-w-sm">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield size={32} className="text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Erişim Engellendi</h2>
                    <p className="text-sm text-slate-500 mb-4">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
                    <button onClick={onClose} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
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
        <div className="fixed inset-0 z-[150] flex bg-slate-950/80 backdrop-blur-md" onClick={onClose}>
            <div
                className="w-full h-full max-w-7xl mx-auto my-4 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 lg:p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <Shield size={24} className="text-white" />
                            </div>
                            <div className="text-white">
                                <h1 className="text-xl font-bold">Admin Panel</h1>
                                <p className="text-xs text-white/70">Kullanıcı Aktivite İzleme</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
                            >
                                <RefreshCw size={18} className={`text-white ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <X size={18} className="text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-500">Veriler yükleniyor...</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex overflow-hidden">
                        {/* Sol Panel - İstatistikler ve Kullanıcı Listesi */}
                        <div className="w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-950">
                            {/* İstatistik Kartları */}
                            {stats && (
                                <div className="p-4 grid grid-cols-2 gap-3 border-b border-slate-100 dark:border-slate-800">
                                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2 text-indigo-500 mb-1">
                                            <Users size={14} />
                                            <span className="text-[10px] font-bold uppercase">Kullanıcı</span>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalUsers}</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2 text-green-500 mb-1">
                                            <Activity size={14} />
                                            <span className="text-[10px] font-bold uppercase">Bugün</span>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.todayActiveUsers}</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2 text-purple-500 mb-1">
                                            <Calendar size={14} />
                                            <span className="text-[10px] font-bold uppercase">Oturum</span>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalSessions}</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2 text-amber-500 mb-1">
                                            <MessageSquare size={14} />
                                            <span className="text-[10px] font-bold uppercase">Mesaj</span>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalMessages}</p>
                                    </div>
                                </div>
                            )}

                            {/* Tab Seçici */}
                            <div className="p-3 flex gap-2 border-b border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={() => setActiveTab('today')}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'today'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <Activity size={14} className="inline mr-1" />
                                    Bugün
                                </button>
                                <button
                                    onClick={() => setActiveTab('users')}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'users'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <Users size={14} className="inline mr-1" />
                                    Kullanıcılar
                                </button>
                            </div>

                            {/* Arama */}
                            {activeTab === 'users' && (
                                <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="E-posta veya ID ara..."
                                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Liste */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                                {activeTab === 'today' ? (
                                    todayActivity.length === 0 ? (
                                        <div className="text-center py-8 text-slate-400">
                                            <Activity size={32} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">Bugün henüz aktivite yok</p>
                                        </div>
                                    ) : (
                                        todayActivity.map((activity, idx) => (
                                            <button
                                                key={`${activity.userId}-${idx}`}
                                                onClick={() => setSelectedSession(activity.session)}
                                                className={`w-full p-3 rounded-xl text-left transition-all ${selectedSession?.id === activity.session.id
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${selectedSession?.id === activity.session.id
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                                        }`}>
                                                        <User size={12} />
                                                    </div>
                                                    <span className={`text-xs font-medium truncate ${selectedSession?.id === activity.session.id ? 'text-white/80' : 'text-slate-500'
                                                        }`}>
                                                        {activity.userEmail || activity.userId.slice(0, 8) + '...'}
                                                    </span>
                                                </div>
                                                <p className={`text-xs line-clamp-2 ${selectedSession?.id === activity.session.id ? 'text-white/70' : 'text-slate-600 dark:text-slate-400'
                                                    }`}>
                                                    {activity.session.preview}
                                                </p>
                                                <div className={`flex items-center gap-2 mt-2 text-[10px] ${selectedSession?.id === activity.session.id ? 'text-white/60' : 'text-slate-400'
                                                    }`}>
                                                    <MessageSquare size={10} />
                                                    {activity.session.messageCount || activity.session.messages?.length || 0} mesaj
                                                </div>
                                            </button>
                                        ))
                                    )
                                ) : (
                                    filteredUsers.length === 0 ? (
                                        <div className="text-center py-8 text-slate-400">
                                            <Users size={32} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">Kullanıcı bulunamadı</p>
                                        </div>
                                    ) : (
                                        filteredUsers.map((u) => (
                                            <button
                                                key={u.id}
                                                onClick={() => handleSelectUser(u)}
                                                className={`w-full p-3 rounded-xl text-left transition-all ${selectedUser?.id === u.id
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${selectedUser?.id === u.id
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                                        }`}>
                                                        {u.email ? u.email[0].toUpperCase() : '?'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium truncate ${selectedUser?.id === u.id ? 'text-white' : 'text-slate-800 dark:text-white'
                                                            }`}>
                                                            {u.email || 'Anonim'}
                                                        </p>
                                                        <p className={`text-[10px] truncate ${selectedUser?.id === u.id ? 'text-white/60' : 'text-slate-400'
                                                            }`}>
                                                            ID: {u.id.slice(0, 12)}...
                                                        </p>
                                                    </div>
                                                    <ArrowRight size={14} className={selectedUser?.id === u.id ? 'text-white/60' : 'text-slate-300'} />
                                                </div>
                                                <div className={`flex items-center gap-3 text-[10px] mt-2 ${selectedUser?.id === u.id ? 'text-white/60' : 'text-slate-400'
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
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setSelectedSession(null)}
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                            >
                                                <ChevronLeft size={20} className="text-slate-500" />
                                            </button>
                                            <div>
                                                <h3 className="font-bold text-slate-800 dark:text-white">
                                                    {formatSessionDate(selectedSession.date)}
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    {selectedSession.userEmail || 'Anonim Kullanıcı'} • {selectedSession.messages?.length || 0} mesaj
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950 custom-scrollbar">
                                        {selectedSession.messages?.map((msg: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user'
                                                        ? 'bg-indigo-600 text-white rounded-br-md'
                                                        : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-bl-md'
                                                    }`}>
                                                    <div className={`text-[10px] font-bold uppercase mb-2 ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                                                        }`}>
                                                        {msg.role === 'user' ? '👤 Kullanıcı' : '🤖 Asistan'}
                                                    </div>
                                                    <p className={`text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'text-white' : 'text-slate-700 dark:text-slate-300'
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
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(null);
                                                    setSelectedUserHistory([]);
                                                }}
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                            >
                                                <ChevronLeft size={20} className="text-slate-500" />
                                            </button>
                                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                                {selectedUser.email ? selectedUser.email[0].toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 dark:text-white">
                                                    {selectedUser.email || 'Anonim Kullanıcı'}
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Son aktivite: {formatDate(selectedUser.lastActivity)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* User Sessions */}
                                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950 custom-scrollbar">
                                        <div className="space-y-3">
                                            {selectedUserHistory.map((session) => (
                                                <button
                                                    key={session.id}
                                                    onClick={() => setSelectedSession(session)}
                                                    className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all text-left group"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={14} className="text-indigo-500" />
                                                            <span className="text-sm font-bold text-slate-800 dark:text-white">
                                                                {formatSessionDate(session.date)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-500">
                                                                {session.messageCount || session.messages?.length || 0} mesaj
                                                            </span>
                                                            <Eye size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-slate-500 line-clamp-2">
                                                        {session.preview}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                                    <div className="text-center p-8">
                                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Eye size={32} className="text-slate-300 dark:text-slate-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">
                                            {activeTab === 'today' ? 'Aktivite Seçin' : 'Kullanıcı Seçin'}
                                        </h3>
                                        <p className="text-sm text-slate-400">
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
