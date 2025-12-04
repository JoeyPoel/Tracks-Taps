import { useEffect } from 'react';
import { useStore } from '../store/store';

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

export const useUser = (userId: number) => {
    const user = useStore((state) => state.user);
    const loading = useStore((state) => state.loadingUser);
    const error = useStore((state) => state.errorUser);
    const fetchUser = useStore((state) => state.fetchUser);

    useEffect(() => {
        if (userId) {
            fetchUser(userId);
        }
    }, [userId, fetchUser]);

    return { user, loading, error, refetch: () => fetchUser(userId) };
};
