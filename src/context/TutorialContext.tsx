import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLanguage } from './LanguageContext';

export interface TutorialStep {
    id: string;
    route: string;
    title: string;
    description: string;
    position?: 'top' | 'bottom' | 'center' | 'top-down';
}

interface TutorialContextProps {
    isActive: boolean;
    currentStepIndex: number;
    steps: TutorialStep[];
    startTutorial: () => void;
    nextStep: () => void;
    skipTutorial: () => void;
    hasSeenTutorial: boolean;
    resetTutorial: () => Promise<void>;
    isLoading: boolean;
}

const TutorialContext = createContext<TutorialContextProps | undefined>(undefined);

const TUTORIAL_STRINGS: Record<string, Record<string, string>> = {
    en: {
        langTitle: "Choose Your Language! 🌍",
        langDesc: "Welcome to Tracks & Taps! Let's pick your language first to make your urban adventure flawless.",
        welcomeTitle: "The World is Your Game Board! 🗺️",
        welcomeDesc: "Tracks & Taps turns any city into an exciting urban playground. Explore, complete challenges, and discover hidden spots!",
        selectTitle: "Select Your First Adventure! 🍻",
        selectDesc: "Tap on the first tour below to see stops, challenges, and start playing!",
        detailsTitle: "You've Found An Adventure! 🏆",
        detailsDesc: "Here you can see the route distance, duration, and stops. Try scrolling! Also, tap the translate button next to description to view the tour in any language! 🌐",
        finishTitle: "Ready to Start? Let's Sign Up! 🔥",
        finishDesc: "Sign up now to track your level, earn XP, unlock achievements, and play this tour with friends! It takes less than 30 seconds!",
    },
    es: {
        langTitle: "¡Elige tu idioma! 🌍",
        langDesc: "¡Bienvenido a Tracks & Taps! Elige tu idioma para que tu aventura urbana sea perfecta.",
        welcomeTitle: "¡El mundo es tu tablero! 🗺️",
        welcomeDesc: "Tracks & Taps convierte cualquier ciudad en un divertido patio de recreo. ¡Explora, supera desafíos y descubre lugares ocultos!",
        selectTitle: "¡Elige tu primera aventura! 🍻",
        selectDesc: "¡Toca el primer tour de abajo para ver las paradas, desafíos y empezar a jugar!",
        detailsTitle: "¡Has encontrado una aventura! 🏆",
        detailsDesc: "Aquí puedes ver la distancia de la ruta, la duración y las paradas. ¡Intenta desplazarte! Además, ¡toca el botón de traducir al lado de la descripción para ver la ruta en cualquier idioma! 🌐",
        finishTitle: "¿Listo para empezar? ¡Regístrate! 🔥",
        finishDesc: "¡Regístrate ahora para subir de nivel, ganar XP, desbloquear logros y jugar con amigos! ¡Toma menos de 30 segundos!",
    },
    nl: {
        langTitle: "Kies je taal! 🌍",
        langDesc: "Welkom bij Tracks & Taps! Laten we eerst je taal kiezen om je stedelijke avontuur vlekkeloos te maken.",
        welcomeTitle: "De wereld is jouw speelbord! 🗺️",
        welcomeDesc: "Tracks & Taps verandert elke stad in een spannende speeltuin. Verken, voltooi uitdagingen en ontdek verborgen plekken!",
        selectTitle: "Kies je eerste avontuur! 🍻",
        selectDesc: "Tik hieronder op de eerste tour om stops en uitdagingen te bekijken en te beginnen met spelen!",
        detailsTitle: "Je hebt een avontuur gevonden! 🏆",
        detailsDesc: "Hier kun je de routeafstand, duur en stops zien. Probeer te scrollen! Tik ook op de vertaalknop naast de beschrijving om de tour in elke taal te bekijken! 🌐",
        finishTitle: "Klaar om te starten? Registreer nu! 🔥",
        finishDesc: "Registreer nu om je niveau bij te houden, XP te verdienen, prestaties te ontgrendelen en deze tour met vrienden te spelen! Het duurt minder dan 30 seconden!",
    },
    fr: {
        langTitle: "Choisissez votre langue ! 🌍",
        langDesc: "Bienvenue sur Tracks & Taps ! Choisissons votre langue pour que votre aventure urbaine soit parfaite.",
        welcomeTitle: "Le monde est votre plateau de jeu ! 🗺️",
        welcomeDesc: "Tracks & Taps transforme chaque ville en un terrain de jeu urbain passionnant. Explorez, relevez des défis et découvrez des lieux cachés !",
        selectTitle: "Sélectionnez votre première aventure ! 🍻",
        selectDesc: "Appuyez sur le premier tour ci-dessous pour voir les étapes, les défis et commencer à jouer !",
        detailsTitle: "Vous avez trouvé une aventure ! 🏆",
        detailsDesc: "Ici, vous pouvez voir la distance du parcours, la durée et les étapes. Essayez de faire défiler ! De plus, appuyez sur le bouton de traduction à côté de la description pour voir le parcours dans n'importe quelle langue ! 🌐",
        finishTitle: "Prêt à commencer ? Inscrivez-vous ! 🔥",
        finishDesc: "Inscrivez-vous maintenant pour suivre votre niveau, gagner de l'XP, débloquer des succès et jouer avec des amis ! Moins de 30 secondes !",
    },
    de: {
        langTitle: "Wähle deine Sprache! 🌍",
        langDesc: "Willkommen bei Tracks & Taps! Wähle zuerst deine Sprache aus, um dein urbanes Abenteuer perfekt zu machen.",
        welcomeTitle: "Die Welt ist dein Spielfeld! 🗺️",
        welcomeDesc: "Tracks & Taps verwandelt jede Stadt in einen aufregenden urbanen Spielplatz. Erkunde, meistere Herausforderungen und entdecke versteckte Orte!",
        selectTitle: "Wähle dein erstes Abenteuer! 🍻",
        selectDesc: "Tippe unten auf die erste Tour, um Stopps und Herausforderungen zu sehen und loszulegen!",
        detailsTitle: "Du hast ein Abenteuer gefunden! 🏆",
        detailsDesc: "Hier siehst du die Routendistanz, Dauer und Stopps. Versuche zu scrollen! Tippe auch auf die Schaltfläche zum Übersetzen neben der Beschreibung, um die Tour in einer beliebigen Sprache anzuzeigen! 🌐",
        finishTitle: "Bereit zum Start? Jetzt registrieren! 🔥",
        finishDesc: "Registriere dich jetzt, um dein Level zu verfolgen, XP zu verdienen, Erfolge freizuschalten und diese Tour mit Freunden zu spielen! Dauert weniger als 30 Sekunden!",
    },
    pl: {
        langTitle: "Wybierz swój język! 🌍",
        langDesc: "Witaj w Tracks & Taps! Wybierz swój język, aby Twoja miejska przygoda była bezbłędna.",
        welcomeTitle: "Świat jest Twoją planszą! 🗺️",
        welcomeDesc: "Tracks & Taps zamienia każde miasto w ekscytujący plac zabaw. Odkrywaj, wykonuj wyzwania i znajduj ukryte miejsca!",
        selectTitle: "Wybierz swoją pierwszą przygodę! 🍻",
        selectDesc: "Dotknij pierwszej trasy poniżej, aby zobaczyć przystanki, wyzwania i rozpocząć grę!",
        detailsTitle: "Znalazłeś przygodę! 🏆",
        detailsDesc: "Tutaj możesz zobaczyć dystans trasy, czas trwania i przystanki. Spróbuj przewinąć! Dotknij również przycisku tłumaczenia obok opisu, aby wyświetlić trasę w dowolnym języku! 🌐",
        finishTitle: "Gotowy na start? Zarejestruj się! 🔥",
        finishDesc: "Zarejestruj się teraz, aby śledzić swój poziom, zdobywać XP, odblokowywać osiągnięcia i grać ze znajomymi! To zajmuje mniej niż 30 sekund!",
    }
};

export const TutorialProvider = ({ children }: { children: React.ReactNode }) => {
    const { t, language } = useLanguage();
    const router = useRouter();
    const segments = useSegments();
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

    const steps: TutorialStep[] = useMemo(() => {
        const getTxt = (key: string) => {
            const lang = language || 'en';
            const set = TUTORIAL_STRINGS[lang] || TUTORIAL_STRINGS['en'];
            return set[key] || TUTORIAL_STRINGS['en'][key];
        };

        return [
            {
                id: 'language_select',
                title: getTxt('langTitle'),
                description: getTxt('langDesc'),
                route: '/(tabs)/explore',
                position: 'center',
            },
            {
                id: 'welcome',
                title: getTxt('welcomeTitle'),
                description: getTxt('welcomeDesc'),
                route: '/(tabs)/explore',
                position: 'center',
            },
            {
                id: 'tour_select',
                title: getTxt('selectTitle'),
                description: getTxt('selectDesc'),
                route: '/(tabs)/explore',
                position: 'top-down',
            },
            {
                id: 'tour_details',
                title: getTxt('detailsTitle'),
                description: getTxt('detailsDesc'),
                route: '/tour/[id]',
                position: 'center',
            },
            {
                id: 'finish',
                title: getTxt('finishTitle'),
                description: getTxt('finishDesc'),
                route: '/tour/[id]',
                position: 'center',
            }
        ];
    }, [language]);

    // Listener to auto-advance tutorial when user selects a tour
    useEffect(() => {
        if (!isActive) return;

        const currentStep = steps[currentStepIndex];
        if (currentStep && currentStep.id === 'tour_select') {
            const isTourDetail = segments[0] === 'tour' && segments.length >= 2;
            if (isTourDetail) {
                const nextIndex = currentStepIndex + 1;
                setCurrentStepIndex(nextIndex);
            }
        }
    }, [segments, isActive, currentStepIndex, steps]);

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

    const resetTutorial = async (): Promise<void> => {
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
