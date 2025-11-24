import { useEffect, useState } from 'react';

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    level: number;
    score: number;
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

export function useUser(email: string) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!email) return;

        async function fetchUser() {
            try {
                const response = await fetch(`/api/user?email=${encodeURIComponent(email)}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }
                const data = await response.json();
                setUser(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, [email]);

    return { user, loading, error };
}
