import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

// Admin e-posta adresi
const ADMIN_EMAIL = "burakozyurtkan@gmail.com";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAdmin: false,
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Firebase: Kullanıcı durumu her değiştiğinde burası çalışır
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            // Admin kontrolü
            setIsAdmin(currentUser?.email === ADMIN_EMAIL);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Çıkış hatası:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
