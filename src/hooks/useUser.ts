import { useEffect } from 'react';
import { useStore } from '../store/store';

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
