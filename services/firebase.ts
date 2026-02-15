import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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
export const saveChatHistory = async (userId: string, messages: any[], userEmail?: string) => {
    if (!userId || messages.length === 0) return;

    const today = new Date();
    const dateId = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // Basit bir önizleme metni oluştur (son kullanıcı mesajı veya ilk mesaj)
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const preview = lastUserMessage ? lastUserMessage.text.substring(0, 100) : "Sohbet";

    const sessionRef = doc(db, "users", userId, "history", dateId);
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
            date: dateId,
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
    const q = query(historyRef, orderBy("date", "desc")); // En yeniden eskiye

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
