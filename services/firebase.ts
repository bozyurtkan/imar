import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getFirestore, doc, setDoc, collection, query, orderBy, getDocs, getDoc, serverTimestamp, deleteDoc, collectionGroup, where, limit } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Kimlik doğrulama ve Veritabanı servislerini dışa aktar
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'europe-west1');


export default app;

// Sohbet Geçmişi Tipleri
export interface ChatSession {
    id: string; // YYYY-MM-DD
    date: string;
    updatedAt: any;
    messages: any[];
    preview: string;
}

// Sohbeti Kaydet (Günlük)
// Sohbeti Kaydet (Günlük ve Oturum Bazlı)
export const saveChatHistory = async (userId: string, messages: any[], userEmail?: string, sessionId?: string) => {
    if (!userId || messages.length === 0) return;

    const today = new Date();
    // const dateId = today.toISOString().split('T')[0]; // İptal: Artık sessionId kullanıyoruz

    // Eğer sessionId gelmezse (eski versiyon uyumluluğu) timestamp bazlı üret
    const docId = sessionId || Date.now().toString();

    // Basit bir önizleme metni oluştur (son kullanıcı mesajı veya ilk mesaj)
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const preview = lastUserMessage ? lastUserMessage.text.substring(0, 100) : "Sohbet";

    const sessionRef = doc(db, "users", userId, "history", docId);
    const userRef = doc(db, "users", userId);

    try {
        // 1. Ana kullanıcı dokümanını güncelle (Admin listesinde görünmesi için)
        await setDoc(userRef, {
            email: userEmail || null,
            lastActivity: serverTimestamp(),
            uid: userId
        }, { merge: true });

        // 2. Sohbet oturumunu kaydet
        await setDoc(sessionRef, {
            id: docId,
            date: today.toISOString(), // Tam tarih saat
            updatedAt: serverTimestamp(),
            messages: messages,
            preview: preview,
            userEmail: userEmail || null,
            messageCount: messages.length
        }, { merge: true });
    } catch (error) {
        console.error("Geçmiş kaydedilemedi:", error);
    }
};

// Geçmiş Listesini Getir
export const getChatHistory = async (userId: string): Promise<ChatSession[]> => {
    if (!userId) return [];

    const historyRef = collection(db, "users", userId, "history");
    const q = query(historyRef, orderBy("updatedAt", "desc")); // En yeniden eskiye (güncelleme zamanına göre)

    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as ChatSession));
    } catch (error) {
        console.error("Geçmiş yüklenemedi:", error);
        return [];
    }
};

// Belirli Bir Günü Getir
export const getChatSession = async (userId: string, sessionId: string) => {
    if (!userId || !sessionId) return null;

    try {
        const docRef = doc(db, "users", userId, "history", sessionId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data().messages;
        }
        return null;
    } catch (error) {
        console.error("Oturum yüklenemedi:", error);
        return null;
    }
};

// ========== KÜTÜPHANE BELGE İŞLEMLERİ ==========
// Her belge ayrı Firestore dokümanı olarak saklanır: users/{uid}/documents/{docId}
// Bu sayede tek doküman 1MB sınırına takılmaz.

// Tek bir belgeyi kaydet veya güncelle
export const saveDocToLibrary = async (userId: string, document: any) => {
    try {
        const docRef = doc(db, "users", userId, "documents", document.id);
        await setDoc(docRef, document);
    } catch (error) {
        console.error("Belge kaydedilemedi:", error);
        throw error;
    }
};

// Tek bir belgeyi sil
export const deleteDocFromLibrary = async (userId: string, documentId: string) => {
    try {
        await deleteDoc(doc(db, "users", userId, "documents", documentId));
    } catch (error) {
        console.error("Belge silinemedi:", error);
        throw error;
    }
};

// Tüm belgeleri yükle
export const loadLibraryDocs = async (userId: string): Promise<any[]> => {
    try {
        const docsRef = collection(db, "users", userId, "documents");
        const snapshot = await getDocs(docsRef);
        return snapshot.docs.map(d => d.data());
    } catch (error) {
        console.error("Kütüphane yüklenemedi:", error);
        return [];
    }
};

// ========== KULLANICI AYARLARI ==========
export const saveUserSettings = async (userId: string | undefined, settings: any) => {
    if (!userId) return;
    try {
        const settingsRef = doc(db, "users", userId, "data", "settings");
        await setDoc(settingsRef, settings, { merge: true });
    } catch (error) {
        console.error("Ayarlar kaydedilemedi:", error);
        throw error;
    }
}

export const loadUserSettings = async (userId: string | undefined) => {
    if (!userId) return {};
    try {
        const settingsRef = doc(db, "users", userId, "data", "settings");
        const snapshot = await getDoc(settingsRef);
        return snapshot.exists() ? snapshot.data() : {};
    } catch (error) {
        console.error("Ayarlar yüklenemedi:", error);
        return {};
    }
};
