import { useCallback, useEffect, useState } from 'react';
import { userService } from '../services/userService';

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
            id: number;
        };
        status: string;
    }[];
    createdTours: {
        id: number;
        title: string;
    }[];
}

export function useUser(email: string) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!email) return;
        setLoading(true);
        setError(null);
        try {
            const result = await userService.getUserByEmail(email);
            setUser(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [email]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { user, loading, error };
}
