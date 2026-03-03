import { db } from './firebase';
import {
    doc, getDoc, setDoc, collection, query, orderBy, getDocs,
    runTransaction, addDoc, serverTimestamp, limit, where, updateDoc, writeBatch
} from 'firebase/firestore';
import { CreditPlan, CreditModule, CreditLog, UserCredit } from '../types';

// ========== VARSAYILAN VERİLER ==========

const DEFAULT_PLANS: Omit<CreditPlan, 'createdAt'>[] = [
    {
        id: 'free',
        name: 'free',
        displayName: 'Ücretsiz',
        monthlyCredit: 100,
        price: 0,
        features: ['Günlük 100 kredi', 'Chatbot soru sorma', 'Temel mevzuat erişimi']
    },
    {
        id: 'basic',
        name: 'basic',
        displayName: 'Temel',
        monthlyCredit: 500,
        price: 99,
        features: ['Aylık 500 kredi', 'Tüm modüller', 'Derin düşünme modu', 'Öncelikli destek']
    },
    {
        id: 'pro',
        name: 'pro',
        displayName: 'Pro',
        monthlyCredit: 2000,
        price: 249,
        features: ['Aylık 2000 kredi', 'Tüm modüller', 'Sınırsız derin düşünme', 'API erişimi']
    },
    {
        id: 'premium',
        name: 'premium',
        displayName: 'Premium',
        monthlyCredit: 10000,
        price: 499,
        features: ['Aylık 10000 kredi', 'Tüm modüller', 'Kurumsal destek', 'Özel entegrasyon']
    }
];

const DEFAULT_MODULES: CreditModule[] = [
    { id: 'chatbot', name: 'chatbot', displayName: 'Chatbot Soru Sorma', creditCost: 1, active: true, icon: '💬' },
    { id: 'deep_think', name: 'deep_think', displayName: 'Derin Düşünme', creditCost: 3, active: true, icon: '🧠' },
    { id: 'document_summary', name: 'document_summary', displayName: 'Belge Özetleme', creditCost: 2, active: true, icon: '📄' },
    { id: 'link_analysis', name: 'link_analysis', displayName: 'Mevzuat Karşılaştırma', creditCost: 2, active: true, icon: '🔗' },
    { id: 'gazette_analysis', name: 'gazette_analysis', displayName: 'Resmi Gazete Analizi', creditCost: 2, active: true, icon: '📰' },
    { id: 'web_search', name: 'web_search', displayName: 'Web Arama (Genel)', creditCost: 2, active: true, icon: '🌐' },
    { id: 'knowledge_graph', name: 'knowledge_graph', displayName: 'Bilgi Grafiği', creditCost: 1, active: true, icon: '🕸️' },
    { id: 'madde_analysis', name: 'madde_analysis', displayName: 'Madde Analizi (AI)', creditCost: 1, active: true, icon: '📋' }
];

// ========== VERİTABANI BAŞLATMA ==========

/** İlk kurulumda varsayılan plan ve modül verilerini Firestore'a yazar */
export const initializeDefaultData = async (): Promise<void> => {
    try {
        // Planları kontrol et ve yoksa oluştur
        const plansRef = collection(db, 'plans');
        const plansSnap = await getDocs(plansRef);
        if (plansSnap.empty) {
            console.log('[CreditService] Varsayılan planlar oluşturuluyor...');
            for (const plan of DEFAULT_PLANS) {
                await setDoc(doc(db, 'plans', plan.id), {
                    ...plan,
                    createdAt: serverTimestamp()
                });
            }
            console.log('[CreditService] Planlar oluşturuldu.');
        }

        // Modülleri kontrol et ve yoksa oluştur
        const modulesRef = collection(db, 'modules');
        const modulesSnap = await getDocs(modulesRef);
        if (modulesSnap.empty) {
            console.log('[CreditService] Varsayılan modüller oluşturuluyor...');
            for (const mod of DEFAULT_MODULES) {
                await setDoc(doc(db, 'modules', mod.id), mod);
            }
            console.log('[CreditService] Modüller oluşturuldu.');
        }
    } catch (error) {
        console.error('[CreditService] Varsayılan veri oluşturma hatası:', error);
    }
};

// ========== KULLANICI KREDİ İŞLEMLERİ ==========

/** Kullanıcının kredi bilgilerini Firestore'dan çeker */
export const getUserCredit = async (userId: string): Promise<UserCredit> => {
    const defaultCredit: UserCredit = {
        subscriptionPlan: 'free',
        totalCredit: 100,
        remainingCredit: 100,
        subscriptionStartDate: new Date().toISOString().split('T')[0],
        subscriptionEndDate: getOneMonthLater(),
        autoRenew: false
    };

    if (!userId) return defaultCredit;

    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const data = userSnap.data();
            // Kredi bilgisi varsa döndür, yoksa varsayılan ata ve kaydet
            if (data.remaining_credit !== undefined) {
                return {
                    subscriptionPlan: data.subscription_plan || 'free',
                    totalCredit: data.total_credit || 100,
                    remainingCredit: data.remaining_credit ?? 100,
                    subscriptionStartDate: data.subscription_start_date || new Date().toISOString().split('T')[0],
                    subscriptionEndDate: data.subscription_end_date || getOneMonthLater(),
                    autoRenew: data.auto_renew || false
                };
            } else {
                // İlk kez: varsayılan kredi bilgisini kaydet
                await setDoc(userRef, {
                    subscription_plan: 'free',
                    total_credit: 100,
                    remaining_credit: 100,
                    subscription_start_date: new Date().toISOString().split('T')[0],
                    subscription_end_date: getOneMonthLater(),
                    auto_renew: false
                }, { merge: true });
                return defaultCredit;
            }
        } else {
            return defaultCredit;
        }
    } catch (error) {
        console.error('[CreditService] Kredi bilgisi alınamadı:', error);
        return defaultCredit;
    }
};

/** Kredi yeterliliğini kontrol eder */
export const checkCredit = async (userId: string, moduleId: string): Promise<{ sufficient: boolean; remaining: number; cost: number }> => {
    try {
        const [credit, moduleCost] = await Promise.all([
            getUserCredit(userId),
            getModuleCost(moduleId)
        ]);

        return {
            sufficient: credit.remainingCredit >= moduleCost,
            remaining: credit.remainingCredit,
            cost: moduleCost
        };
    } catch (error) {
        console.error('[CreditService] Kredi kontrol hatası:', error);
        return { sufficient: false, remaining: 0, cost: 0 };
    }
};

/** Atomic kredi düşümü - Firestore transaction ile */
export const deductCredit = async (userId: string, moduleId: string): Promise<{ success: boolean; remainingCredit: number; error?: string }> => {
    if (!userId) return { success: false, remainingCredit: 0, error: 'Kullanıcı bulunamadı' };

    try {
        const userRef = doc(db, 'users', userId);
        const moduleCost = await getModuleCost(moduleId);
        const moduleInfo = await getModuleInfo(moduleId);

        const result = await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw new Error('Kullanıcı bulunamadı');
            }

            const data = userDoc.data();
            const currentCredit = data.remaining_credit ?? 100;

            if (currentCredit < moduleCost) {
                throw new Error('Kredi yetersiz');
            }

            const newRemaining = currentCredit - moduleCost;

            // Krediyi düş
            transaction.update(userRef, {
                remaining_credit: newRemaining
            });

            return newRemaining;
        });

        // Transaction dışında log kaydı oluştur (kritik değil)
        try {
            const logRef = collection(db, 'users', userId, 'credit_logs');
            await addDoc(logRef, {
                module_id: moduleId,
                module_name: moduleInfo?.displayName || moduleId,
                credit_used: moduleCost,
                remaining_after: result,
                created_at: serverTimestamp()
            });
        } catch (logError) {
            console.error('[CreditService] Log kaydı hatası (kritik değil):', logError);
        }

        return { success: true, remainingCredit: result };
    } catch (error: any) {
        console.error('[CreditService] Kredi düşme hatası:', error);
        return {
            success: false,
            remainingCredit: 0,
            error: error.message || 'Kredi düşme işlemi başarısız'
        };
    }
};

/** Admin: Kullanıcıya manuel kredi ekleme/düşme */
export const adjustCredit = async (userId: string, amount: number, reason: string = 'Manuel'): Promise<boolean> => {
    try {
        const userRef = doc(db, 'users', userId);

        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) throw new Error('Kullanıcı bulunamadı');

            const data = userDoc.data();
            const currentCredit = data.remaining_credit ?? 0;
            const currentTotal = data.total_credit ?? 0;
            const newRemaining = Math.max(0, currentCredit + amount);
            const newTotal = amount > 0 ? currentTotal + amount : currentTotal;

            transaction.update(userRef, {
                remaining_credit: newRemaining,
                total_credit: newTotal
            });
        });

        // Log kaydı
        const logRef = collection(db, 'users', userId, 'credit_logs');
        await addDoc(logRef, {
            module_id: 'admin_adjustment',
            module_name: `Admin: ${reason}`,
            credit_used: amount < 0 ? Math.abs(amount) : 0,
            credit_added: amount > 0 ? amount : 0,
            remaining_after: (await getUserCredit(userId)).remainingCredit,
            created_at: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('[CreditService] Kredi ayarlama hatası:', error);
        return false;
    }
};

// ========== MODÜL İŞLEMLERİ ==========

/** Modülün kredi maliyetini getirir */
export const getModuleCost = async (moduleId: string): Promise<number> => {
    try {
        const moduleRef = doc(db, 'modules', moduleId);
        const moduleSnap = await getDoc(moduleRef);
        if (moduleSnap.exists()) {
            return moduleSnap.data().creditCost || 1;
        }
        return 1; // varsayılan
    } catch (error) {
        console.error('[CreditService] Modül maliyeti alınamadı:', error);
        return 1;
    }
};

/** Modül bilgisini getirir */
export const getModuleInfo = async (moduleId: string): Promise<CreditModule | null> => {
    try {
        const moduleRef = doc(db, 'modules', moduleId);
        const moduleSnap = await getDoc(moduleRef);
        if (moduleSnap.exists()) {
            return { id: moduleSnap.id, ...moduleSnap.data() } as CreditModule;
        }
        return null;
    } catch (error) {
        console.error('[CreditService] Modül bilgisi alınamadı:', error);
        return null;
    }
};

/** Tüm modülleri listele */
export const getAllModules = async (): Promise<CreditModule[]> => {
    try {
        const modulesRef = collection(db, 'modules');
        const snapshot = await getDocs(modulesRef);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CreditModule));
    } catch (error) {
        console.error('[CreditService] Modüller yüklenemedi:', error);
        return [];
    }
};

/** Admin: Modül kredi maliyetini güncelle */
export const updateModuleCost = async (moduleId: string, newCost: number): Promise<boolean> => {
    try {
        const moduleRef = doc(db, 'modules', moduleId);
        await updateDoc(moduleRef, { creditCost: newCost });
        return true;
    } catch (error) {
        console.error('[CreditService] Modül maliyeti güncellenemedi:', error);
        return false;
    }
};

// ========== PLAN İŞLEMLERİ ==========

/** Tüm planları listele */
export const getAllPlans = async (): Promise<CreditPlan[]> => {
    try {
        const plansRef = collection(db, 'plans');
        const snapshot = await getDocs(plansRef);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CreditPlan));
    } catch (error) {
        console.error('[CreditService] Planlar yüklenemedi:', error);
        return [];
    }
};

/** Admin: Kullanıcıya plan ata */
export const assignPlan = async (userId: string, planId: string): Promise<boolean> => {
    try {
        const planRef = doc(db, 'plans', planId);
        const planSnap = await getDoc(planRef);
        if (!planSnap.exists()) return false;

        const plan = planSnap.data();
        const userRef = doc(db, 'users', userId);

        await setDoc(userRef, {
            subscription_plan: planId,
            total_credit: plan.monthlyCredit,
            remaining_credit: plan.monthlyCredit,
            subscription_start_date: new Date().toISOString().split('T')[0],
            subscription_end_date: getOneMonthLater(),
            auto_renew: false
        }, { merge: true });

        return true;
    } catch (error) {
        console.error('[CreditService] Plan atama hatası:', error);
        return false;
    }
};

/** Admin: Manuel kredi yenileme (tüm kullanıcılar için) */
export const renewAllCredits = async (): Promise<{ renewed: number; expired: number }> => {
    let renewed = 0;
    let expired = 0;

    try {
        const usersRef = collection(db, 'users');
        const usersSnap = await getDocs(usersRef);
        const today = new Date().toISOString().split('T')[0];

        for (const userDoc of usersSnap.docs) {
            const data = userDoc.data();
            const endDate = data.subscription_end_date;

            // Abonelik süresi dolmuş kullanıcılar
            if (endDate && endDate <= today) {
                const planId = data.subscription_plan || 'free';
                const planRef = doc(db, 'plans', planId);
                const planSnap = await getDoc(planRef);

                if (data.auto_renew && planSnap.exists()) {
                    // Otomatik yenile
                    const plan = planSnap.data();
                    await setDoc(doc(db, 'users', userDoc.id), {
                        remaining_credit: plan.monthlyCredit,
                        total_credit: plan.monthlyCredit,
                        subscription_start_date: today,
                        subscription_end_date: getOneMonthLater()
                    }, { merge: true });
                    renewed++;
                } else {
                    // Süresi doldu, free plana düşür
                    await setDoc(doc(db, 'users', userDoc.id), {
                        subscription_plan: 'free',
                        remaining_credit: 0,
                        total_credit: 100,
                        subscription_start_date: today,
                        subscription_end_date: getOneMonthLater()
                    }, { merge: true });
                    expired++;
                }
            }
        }
    } catch (error) {
        console.error('[CreditService] Toplu yenileme hatası:', error);
    }

    return { renewed, expired };
};

// ========== LOG İŞLEMLERİ ==========

/** Kullanıcının kredi kullanım geçmişi */
export const getCreditLogs = async (userId: string, logLimit: number = 50): Promise<CreditLog[]> => {
    try {
        const logsRef = collection(db, 'users', userId, 'credit_logs');
        const q = query(logsRef, orderBy('created_at', 'desc'), limit(logLimit));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                userId,
                moduleId: data.module_id || '',
                moduleName: data.module_name || '',
                creditUsed: data.credit_used || 0,
                remainingAfter: data.remaining_after || 0,
                createdAt: data.created_at?.toDate?.() || new Date()
            } as CreditLog;
        });
    } catch (error) {
        console.error('[CreditService] Loglar yüklenemedi:', error);
        return [];
    }
};

// ========== YARDIMCI FONKSİYONLAR ==========

function getOneMonthLater(): string {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
}
