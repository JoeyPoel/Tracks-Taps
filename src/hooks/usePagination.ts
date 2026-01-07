
import { useCallback, useState } from 'react';

export interface UsePaginationOptions<T> {
    fetchData: (page: number, limit: number) => Promise<T[]>;
    initialPage?: number;
    limit?: number;
    initialData?: T[];
}

export function usePagination<T>({
    fetchData,
    initialPage = 1,
    limit = 10,
    initialData = [],
}: UsePaginationOptions<T>) {
    const [data, setData] = useState<T[]>(initialData);
    const [page, setPage] = useState(initialPage);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        setError(null);
        try {
            const nextPage = page + 1;
            const newItems = await fetchData(nextPage, limit);

            if (newItems.length < limit) {
                setHasMore(false);
            }

            setData((prev) => [...prev, ...newItems]);
            setPage(nextPage);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [page, limit, loading, hasMore, fetchData]);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        setHasMore(true);
        try {
            const newItems = await fetchData(1, limit);
            setData(newItems);
            setPage(1);
            if (newItems.length < limit) {
                setHasMore(false);
            }
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [fetchData, limit]);

    return {
        data,
        loading,
        error,
        hasMore,
        loadMore,
        refresh,
        page,
    };
}
