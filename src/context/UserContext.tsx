import { supabase } from '@/utils/supabase';
import React, { createContext, useCallback, useContext, useEffect } from 'react';
import { useStore } from '../store/store';
import { User } from '../types/models';
import { useAuth } from './AuthContext';

interface UserContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    refreshUser: () => Promise<void>;
    updateUserXp: (amount: number) => void;
    updateUser: (userId: number, data: { name?: string; avatarUrl?: string }) => Promise<void>;
    deleteUser: (userId: number) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const user = useStore((state) => state.user);
    const loading = useStore((state) => state.loadingUser);
    const error = useStore((state) => state.errorUser);
    const fetchUserByAuth = useStore((state) => (state as any).fetchUserByAuth);
    const addXp = useStore((state) => state.addXp);
    const clearUser = useStore((state) => state.clearUser);
    const updateUser = useStore((state) => state.updateUser);
    const deleteUser = useStore((state) => state.deleteUser);

    const { session } = useAuth();
    const email = session?.user?.email;
    const authId = session?.user?.id;

    useEffect(() => {
        if (authId) {
            fetchUserByAuth(authId, email);
        } else {
            clearUser();
        }
    }, [authId, email]);

    // Handle inconsistent state: Session exists but backend User fetch failed
    useEffect(() => {
        if (authId && error && !user && !loading) {
            console.warn("User fetch failed with active session. Signing out to force re-login.");

            const performSignOut = async () => {
                await supabase.auth.signOut();
            };
            performSignOut();
        }
    }, [authId, error, user, loading]);

    const refreshUser = useCallback(async () => {
        if (authId) {
            await fetchUserByAuth(authId, email);
        }
    }, [authId, email, fetchUserByAuth]);

    const updateUserXp = useCallback(async (amount: number) => {
        addXp(amount);
    }, [addXp]);

    return (
        <UserContext.Provider value={{ user, loading, error, refreshUser, updateUserXp, updateUser, deleteUser }}>
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
