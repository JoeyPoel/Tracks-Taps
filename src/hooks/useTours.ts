import { useEffect, useState } from 'react';
import { Tour } from '../types/Tour';

export function useTours() {
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTours() {
            try {
                // In Expo, relative URLs for API routes might need full localhost path if not handled by proxy
                // But Expo Router usually handles /api/tours if running in same instance
                // We'll assume relative path works for now, or use localhost
                const response = await fetch('/api/tours');
                if (!response.ok) {
                    throw new Error('Failed to fetch tours');
                }
                const data = await response.json();
                setTours(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        }

        fetchTours();
    }, []);

    return { tours, loading, error };
}
