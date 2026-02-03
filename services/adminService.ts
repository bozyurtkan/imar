import { db } from './firebase';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';

// Admin Panel Tipleri
export interface UserInfo {
    id: string;
    email: string | null;
    lastActivity: Date | null;
    totalSessions: number;
    totalMessages: number;
}

export interface UserSession {
    id: string;
    date: string;
    userEmail: string | null;
    messageCount: number;
    preview: string;
    messages: any[];
    updatedAt: any;
}

export interface AdminStats {
    totalUsers: number;
    totalSessions: number;
    totalMessages: number;
    todayActiveSessions: number;
    todayActiveUsers: number;
}

// Tüm kullanıcıları ve geçmişlerini getir
export const getAllUsersWithHistory = async (): Promise<UserInfo[]> => {
    const users: UserInfo[] = [];

    try {
        // users koleksiyonunu al
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const userData = userDoc.data();

            // Her kullanıcının history alt koleksiyonunu al
            const historyRef = collection(db, "users", userId, "history");
            const historyQuery = query(historyRef, orderBy("date", "desc"));
            const historySnapshot = await getDocs(historyQuery);

            let totalMessages = 0;
            let lastActivity: Date | null = null;
            let userEmail: string | null = null;

            historySnapshot.docs.forEach((historyDoc, index) => {
                const data = historyDoc.data();
                totalMessages += data.messageCount || data.messages?.length || 0;

                if (index === 0) {
                    lastActivity = data.updatedAt?.toDate() || new Date(data.date);
                    userEmail = data.userEmail || null;
                }
            });

            users.push({
                id: userId,
                email: userEmail,
                lastActivity,
                totalSessions: historySnapshot.size,
                totalMessages
            });
        }

        // Son aktiviteye göre sırala
        users.sort((a, b) => {
            if (!a.lastActivity) return 1;
            if (!b.lastActivity) return -1;
            return b.lastActivity.getTime() - a.lastActivity.getTime();
        });

        return users;
    } catch (error) {
        console.error("Kullanıcılar yüklenemedi:", error);
        return [];
    }
};

// Belirli kullanıcının tüm geçmişini getir
export const getUserAllHistory = async (userId: string): Promise<UserSession[]> => {
    if (!userId) return [];

    try {
        const historyRef = collection(db, "users", userId, "history");
        const q = query(historyRef, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as UserSession));
    } catch (error) {
        console.error("Kullanıcı geçmişi yüklenemedi:", error);
        return [];
    }
};

// Admin istatistiklerini hesapla
export const getAdminStats = async (): Promise<AdminStats> => {
    const today = new Date().toISOString().split('T')[0];

    let totalUsers = 0;
    let totalSessions = 0;
    let totalMessages = 0;
    let todayActiveSessions = 0;
    let todayActiveUsersSet = new Set<string>();

    try {
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        totalUsers = usersSnapshot.size;

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const historyRef = collection(db, "users", userId, "history");
            const historySnapshot = await getDocs(historyRef);

            historySnapshot.docs.forEach(historyDoc => {
                const data = historyDoc.data();
                totalSessions++;
                totalMessages += data.messageCount || data.messages?.length || 0;

                if (data.date === today) {
                    todayActiveSessions++;
                    todayActiveUsersSet.add(userId);
                }
            });
        }

        return {
            totalUsers,
            totalSessions,
            totalMessages,
            todayActiveSessions,
            todayActiveUsers: todayActiveUsersSet.size
        };
    } catch (error) {
        console.error("İstatistikler yüklenemedi:", error);
        return {
            totalUsers: 0,
            totalSessions: 0,
            totalMessages: 0,
            todayActiveSessions: 0,
            todayActiveUsers: 0
        };
    }
};

// Bugünün tüm aktivitelerini getir (tüm kullanıcılardan)
export const getTodayActivity = async (): Promise<{ userId: string; userEmail: string | null; session: UserSession }[]> => {
    const today = new Date().toISOString().split('T')[0];
    const activities: { userId: string; userEmail: string | null; session: UserSession }[] = [];

    try {
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const historyRef = collection(db, "users", userId, "history");
            const historySnapshot = await getDocs(historyRef);

            historySnapshot.docs.forEach(historyDoc => {
                const data = historyDoc.data();
                if (data.date === today) {
                    activities.push({
                        userId,
                        userEmail: data.userEmail || null,
                        session: {
                            id: historyDoc.id,
                            ...data
                        } as UserSession
                    });
                }
            });
        }

        // updatedAt'e göre sırala (en yeni en üstte)
        activities.sort((a, b) => {
            const timeA = a.session.updatedAt?.toDate?.()?.getTime() || 0;
            const timeB = b.session.updatedAt?.toDate?.()?.getTime() || 0;
            return timeB - timeA;
        });

        return activities;
    } catch (error) {
        console.error("Bugünün aktiviteleri yüklenemedi:", error);
        return [];
    }
};
