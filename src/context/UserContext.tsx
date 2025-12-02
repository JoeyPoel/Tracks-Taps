import React, { createContext, useContext, useEffect, useState } from 'react';

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    level: number;
    xp: number;
    tokens: number;
    participations: {
        tour: {
            title: string;
            imageUrl: string;
        };
        status: string;
    }[];
    createdTours: {
        id: number;
        title: string;
    }[];
}

interface UserContextType {
    user: UserProfile | null;
    loading: boolean;
    error: string | null;
    refreshUser: () => Promise<void>;
    updateUserXp: (amount: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Hardcoded for now as per previous implementation
    const email = 'Joey@example.com';

    const fetchUser = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/user?email=${encodeURIComponent(email)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }
            const data = await response.json();
            setUser(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const refreshUser = async () => {
        await fetchUser();
    };

    const updateUserXp = (amount: number) => {
        if (user) {
            setUser({ ...user, xp: user.xp + amount });
        }
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
