import React, { createContext, useContext, useEffect } from 'react';
import { useStore } from '../store/store';
import { User } from '../types/models';
import { useAuth } from './AuthContext';

interface UserContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    refreshUser: () => Promise<void>;
    updateUserXp: (amount: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const user = useStore((state) => state.user);
    const loading = useStore((state) => state.loadingUser);
    const error = useStore((state) => state.errorUser);
    const fetchUserByEmail = useStore((state) => state.fetchUserByEmail);
    const addXp = useStore((state) => state.addXp);
    const clearUser = useStore((state) => state.clearUser);

    const { session } = useAuth();
    const email = session?.user?.email;

    useEffect(() => {
        if (email) {
            fetchUserByEmail(email);
        } else {
            clearUser();
        }
    }, [email]);

    const refreshUser = async () => {
        if (email) {
            await fetchUserByEmail(email);
        }
    };

    const updateUserXp = async (amount: number) => {
        addXp(amount);
    };

    return (
        <UserContext.Provider value={{ user, loading, error, refreshUser, updateUserXp }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUserContext() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
}
