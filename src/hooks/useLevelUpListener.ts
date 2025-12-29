import { useLanguage } from '@/src/context/LanguageContext';
import { useToast } from '@/src/context/ToastContext';
import { useUserContext } from '@/src/context/UserContext';
import { LevelSystem } from '@/src/utils/levelUtils';
import { useEffect, useRef, useState } from 'react';

export function useLevelUpListener() {
    const { user } = useUserContext();
    const { t } = useLanguage();
    const { showToast } = useToast();

    // We need to track the previous level to detect changes
    const [currentLevel, setCurrentLevel] = useState<number>(1);

    // Use a ref to store the level to avoid re-triggering on mount if we just want to track *changes*
    const isFirstRun = useRef(true);

    useEffect(() => {
        if (!user) return;

        const newLevel = LevelSystem.getLevel(user.xp);

        if (isFirstRun.current) {
            setCurrentLevel(newLevel);
            isFirstRun.current = false;
            return;
        }

        if (newLevel > currentLevel) {
            setCurrentLevel(newLevel);
            showToast({
                title: t('levelUp'),
                message: t('youReachedLevel').replace('{0}', newLevel.toString()),
                emoji: '🏆',
                backgroundColor: '#FFD700' // Gold
            });
        }
    }, [user?.xp]);
}
