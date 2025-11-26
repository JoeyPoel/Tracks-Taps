import { useEffect, useState } from 'react';

interface FetchState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export function useFetch<T>(url: string | null) {
    const [state, setState] = useState<FetchState<T>>({
        data: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        if (!url) {
            setState({ data: null, loading: false, error: null });
            return;
        }

        let isMounted = true;
        setState(prev => ({ ...prev, loading: true, error: null }));

        async function fetchData() {
            try {
                const response = await fetch(url!);
                if (!response.ok) {
                    throw new Error(`Failed to fetch: ${response.statusText}`);
                }
                const data = await response.json();
                if (isMounted) {
                    setState({ data, loading: false, error: null });
                }
            } catch (err) {
                if (isMounted) {
                    setState({
                        data: null,
                        loading: false,
                        error: err instanceof Error ? err.message : 'Unknown error',
                    });
                }
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [url]);

    return state;
}
