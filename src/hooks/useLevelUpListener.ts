import { useLanguage } from '@/src/context/LanguageContext';
import { useToast } from '@/src/context/ToastContext';
import { useUserContext } from '@/src/context/UserContext';
import { LevelSystem } from '@/src/utils/levelUtils';
import { useEffect, useRef, useState } from 'react';

export function useLevelUpListener() {
    const { user } = useUserContext();
    const { t } = useLanguage();
    const { showToast } = useToast();

    // Track both the current level and the current user ID
    const [currentLevel, setCurrentLevel] = useState<number>(1);
    const lastUserId = useRef<number | null>(null);
    const isFirstRun = useRef(true);

    useEffect(() => {
        if (!user?.id) {
            // If user is logged out, reset state to defaults for the next user
            isFirstRun.current = true;
            lastUserId.current = null;
            return;
        }

        const newLevel = LevelSystem.getLevel(user.xp || 0);

        // CASE 1: New User ID detected (Login / Switch Account)
        if (user.id !== lastUserId.current) {
            setCurrentLevel(newLevel);
            lastUserId.current = user.id;
            isFirstRun.current = false;
            return;
        }

        // CASE 2: Identical User, check for XP increases (Level Up)
        if (newLevel > currentLevel) {
            setCurrentLevel(newLevel);
            showToast({
                title: t('levelUp'),
                message: t('youReachedLevel').replace('{0}', newLevel.toString()),
                emoji: '🏆',
                backgroundColor: '#FFD700' // Gold
            });
        } else if (newLevel < currentLevel) {
            // Sync level if it somehow decreases (data sync)
            setCurrentLevel(newLevel);
        }
    }, [user?.id, user?.xp, currentLevel, t, showToast]);
}
