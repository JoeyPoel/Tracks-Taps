import React, { createContext, useContext, useEffect } from 'react';
import { useStore } from '../store/store';
import { User } from '../types/models';

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

    // Hardcoded for now as per previous implementation
    const email = 'Joey@example.com';

    useEffect(() => {
        fetchUserByEmail(email);
    }, []);

    const refreshUser = async () => {
        await fetchUserByEmail(email);
    };

    const updateUserXp = (amount: number) => {
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
