import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLanguage } from './LanguageContext';

export interface TutorialStep {
    id: string;
    route: string;
    title: string;
    description: string;
    position?: 'top' | 'bottom' | 'center';
}

interface TutorialContextProps {
    isActive: boolean;
    currentStepIndex: number;
    steps: TutorialStep[];
    startTutorial: () => void;
    nextStep: () => void;
    skipTutorial: () => void;
    hasSeenTutorial: boolean;
    resetTutorial: () => void;
    isLoading: boolean;
}

const TutorialContext = createContext<TutorialContextProps | undefined>(undefined);

export const TutorialProvider = ({ children }: { children: React.ReactNode }) => {
    const { t } = useLanguage();
    const router = useRouter();
    const [isActive, setIsActive] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkTutorialStatus();
    }, []);

    const checkTutorialStatus = async () => {
        try {
            const value = await AsyncStorage.getItem('hasSeenAppWizard');
            if (value === 'true') {
                setHasSeenTutorial(true);
            }
        } catch (e) {
            console.error("Failed to load tutorial status", e);
        } finally {
            setIsLoading(false);
        }
    };

    const steps: TutorialStep[] = useMemo(() => [
        {
            id: 'welcome',
            title: t('tutorialWelcomeTitle'),
            description: t('tutorialWelcomeDesc'),
            route: '/(tabs)/explore',
            position: 'center',
        },
        {
            id: 'explore',
            title: t('tutorialExploreTitle'),
            description: t('tutorialExploreDesc'),
            route: '/(tabs)/explore',
            position: 'center',
        },
        {
            id: 'location',
            title: t('tutorialLocationTitle'),
            description: t('tutorialLocationDesc'),
            route: '/(tabs)/map', // Changed to Map tab
            position: 'center',
        },
        {
            id: 'tour_start',
            title: t('tutorialTourTitle'),
            description: t('tutorialTourDesc'),
            route: '/(tabs)/explore', // Back to explore to see list
            position: 'center',
        },
        {
            id: 'join',
            title: t('tutorialJoinTitle'),
            description: t('tutorialJoinDesc'),
            route: '/(tabs)/join',
            position: 'center',
        },
        {
            id: 'create',
            title: t('tutorialCreateTitle'),
            description: t('tutorialCreateDesc'),
            route: '/(tabs)/create',
            position: 'center',
        },
        {
            id: 'profile',
            title: t('tutorialProfileTitle'),
            description: t('tutorialProfileDesc'),
            route: '/(tabs)/profile',
            position: 'center',
        },
        {
            id: 'finish',
            title: t('tutorialFinishTitle'),
            description: t('tutorialFinishDesc'),
            route: '/(tabs)/explore',
            position: 'center',
        }
    ], [t]);

    const startTutorial = () => {
        setIsActive(true);
        setCurrentStepIndex(0);
        // Force navigate to first step
        router.push(steps[0].route as any);
    };

    const nextStep = () => {
        if (currentStepIndex < steps.length - 1) {
            const nextIndex = currentStepIndex + 1;
            const nextRoute = steps[nextIndex].route;

            // Check if we need to navigate
            if (nextRoute !== steps[currentStepIndex].route) {
                router.push(nextRoute as any);
            }
            setCurrentStepIndex(nextIndex);
        } else {
            completeTutorial();
        }
    };

    const completeTutorial = async () => {
        setIsActive(false);
        setHasSeenTutorial(true);
        try {
            await AsyncStorage.setItem('hasSeenAppWizard', 'true');
        } catch (e) {
            console.error("Failed to save tutorial status", e);
        }
    };

    const resetTutorial = async () => {
        setIsActive(false);
        setHasSeenTutorial(false);
        try {
            await AsyncStorage.removeItem('hasSeenAppWizard');
        } catch (e) {
            console.error("Failed to reset tutorial status", e);
        }
    };

    const skipTutorial = async () => {
        completeTutorial();
    };

    return (
        <TutorialContext.Provider value={{
            isActive,
            currentStepIndex,
            steps,
            startTutorial,
            nextStep,
            skipTutorial,
            hasSeenTutorial,
            resetTutorial,
            isLoading
        }}>
            {children}
        </TutorialContext.Provider>
    );
};

export const useTutorial = () => {
    const context = useContext(TutorialContext);
    if (!context) throw new Error('useTutorial must be used within a TutorialProvider');
    return context;
};
