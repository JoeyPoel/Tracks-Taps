
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

/**
 * A hook that provides a safe goBack function.
 * If the history stack is empty (e.g. valid deep link or refresh), it navigates to the home screen instead.
 */
export function useSafeNavigation() {
    const router = useRouter();

    const goBack = useCallback(() => {
        if (router.canGoBack()) {
            router.back();
        } else {
            // Fallback to home / explore if no history
            // Using replace to reset stack effectively
            router.replace('/');
        }
    }, [router]);

    return { goBack };
}
