import React, { useState, useEffect } from 'react';
import { 
    StyleSheet, 
    View, 
    Dimensions, 
    TouchableOpacity, 
    ScrollView, 
    Platform,
    KeyboardAvoidingView,
    Switch,
    ActivityIndicator,
    Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
    FadeIn, 
    FadeOut, 
    FadeInDown, 
    SlideInRight,
    SlideOutLeft,
    useSharedValue, 
    useAnimatedStyle, 
    withTiming, 
    withRepeat,
    withSequence,
    Easing
} from 'react-native-reanimated';
import { ChevronLeft, Volume2, Accessibility, Sparkles, Check, Play, User as UserIcon, HelpCircle, Gamepad, Award } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/src/context/ThemeContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTranslation } from '@/src/context/TranslationContext';
import { useUserContext } from '@/src/context/UserContext';
import { TextComponent } from '@/src/components/common/TextComponent';
import { ScaledTextInput } from '@/src/components/common/ScaledTextInput';
import { AnimatedPressable } from '@/src/components/common/AnimatedPressable';
import { useTextToSpeech } from '@/src/hooks/useTextToSpeech';
import Confetti from '@/src/components/active-tour/animations/Confetti';
import FloatingPoints from '@/src/components/active-tour/animations/FloatingPoints';

import { NarrationSettings } from '@/src/components/preferences/NarrationSettings';
import { TextSizeSettings } from '@/src/components/preferences/TextSizeSettings';
import { COLOR_THEMES } from '@/src/constants/themes';
import { useStore } from '@/src/store/store';
import { userService } from '@/src/services/userService';

const { width: screenWidth } = Dimensions.get('window');

interface PlayStyleOption {
    id: string;
    title: string;
    description: string;
    emoji: string;
}

// Local translation dictionary for instant language updates
const ONBOARDING_TRANSLATIONS: Record<string, Record<string, string>> = {
    en: {
        welcomeTitle: "Tracks & Taps turns it all into a challenge.",
        welcomeSub: "No more boring sightseeing — we pull routes, local trivia, and photo tasks together into one ultimate game.",
        challenge: "CHALLENGE",
        chooseLanguageTitle: "Choose Your Language 🌍",
        chooseLanguageDesc: "Let's configure your language so your adventure is flawless. We will automatically translate gameplay translations.",
        accessibilityTitle: "Accessibility ⚙️",
        accessibilityDesc: "Do you want to enable accessibility features like screen reader speech narration or high contrast themes?",
        yesSetup: "Yes, set up tools",
        noContinue: "No, continue standard",
        accessibilitySetupTitle: "Accessibility Setup ⚙️",
        speechNarration: "Speech & Narration",
        textSizeFont: "Text Size & Font",
        dyslexicFont: "Dyslexic Font",
        dyslexicDesc: "Use OpenDyslexic typeface for text.",
        accessibilityThemes: "Accessibility Themes",
        claimNameTitle: "Claim Your Name 🏆",
        claimNameDesc: "Choose your explorer name. This is how you will appear on leaderboards and when playing with friends.",
        enterTextChallenge: "ENTER TEXT CHALLENGE",
        writeUniqueName: "Write a unique code name to complete this stop.",
        placeholderName: "Enter your adventurer name...",
        selectStyleTitle: "Select Play Style 🎯",
        selectStyleDesc: "We will tailor recommendation styles to fit your personal city adventure style.",
        completeBonus: "ONBOARDING COMPLETION BONUS",
        signUp: "Sign Up",
        login: "Log In",
        orUseAsGuest: "or use as guest",
        continue: "Continue",
        letsPlay: "Let's Play! 🚀",
        yesSetupDesc: "Enables narration, text resizing, and layouts.",
        noContinueDesc: "Skip custom accessibility helpers.",
        accessibilityNarrationDesc: "Speech narration reads screen text, challenges, and navigation instructions aloud.",
        off: "Off",
        noNarration: "No narration",
        tourOnly: "Tour Only",
        duringTours: "During active tours",
        fullApp: "Full App",
        narrateAllScreens: "Narrate all screens",
        voiceNarrationSpeed: "Voice Narration Speed",
        slower: "Slower",
        normal: "Normal",
        faster: "Faster",
        fast: "Fast",
        showSpeakerIcons: "Show Speaker Icons",
        showSpeakerIconsDesc: "Display audio buttons next to text blocks.",
        textSizeDesc: "Adjust the size of the text for easier reading.",
        smallest: "Smallest",
        small: "Small",
        large: "Large",
        largest: "Largest",
        normalTheme: "Normal Theme",
        blueYellowAccessibility: "Blue & Yellow",
        redTealAccessibility: "Red & Teal",
        highContrastAccessibility: "High Contrast Monochrome",
        soloTitle: "Solo Explorer",
        soloDesc: "Explore at your own pace, read historical trivia, and find secrets.",
        pubGolfTitle: "Pub Golfer",
        pubGolfDesc: "Fun drinking-game mechanics, sips tracking, and group scoring.",
        socialTitle: "Social Competitor",
        socialDesc: "Compete in challenge grids, earn achievements, and dominate leaderboard."
    },
    nl: {
        welcomeTitle: "Tracks & Taps maakt er een uitdaging van.",
        welcomeSub: "Geen saaie bezienswaardigheden meer — we brengen routes, lokale trivia en fototaken samen in één ultieme game.",
        challenge: "UITDAGING",
        chooseLanguageTitle: "Kies Je Taal 🌍",
        chooseLanguageDesc: "Laten we je taal instellen zodat je avontuur vlekkeloos verloopt. We vertalen gameplay-onderdelen automatisch.",
        accessibilityTitle: "Toegankelijkheid ⚙️",
        accessibilityDesc: "Wil je toegankelijkheidsfuncties inschakelen, zoals spraakvoorlezen of thema's met hoog contrast?",
        yesSetup: "Ja, hulpmiddelen instellen",
        noContinue: "Nee, ga standaard verder",
        accessibilitySetupTitle: "Toegankelijkheid Instellen ⚙️",
        speechNarration: "Spraak & Voorlezen",
        textSizeFont: "Tekstgrootte & Lettertype",
        dyslexicFont: "Dyslexie Lettertype",
        dyslexicDesc: "Gebruik het OpenDyslexic lettertype voor tekst.",
        accessibilityThemes: "Toegankelijkheidsthema's",
        claimNameTitle: "Claim Je Naam 🏆",
        claimNameDesc: "Kies je avonturiersnaam. Dit is hoe je op klassementen verschijnt en als je met vrienden speelt.",
        enterTextChallenge: "VOER TEKSTUITDAGING IN",
        writeUniqueName: "Schrijf een unieke codenaam om deze stop te voltooien.",
        placeholderName: "Voer je avonturiersnaam in...",
        selectStyleTitle: "Selecteer Speelstijl 🎯",
        selectStyleDesc: "We passen aanbevelingen aan op jouw persoonlijke stadsavonturenstijl.",
        completeBonus: "ONBOARDING VOLTOOIINGSBONUS",
        signUp: "Registreren",
        login: "Inloggen",
        orUseAsGuest: "of ga verder als gast",
        continue: "Doorgaan",
        letsPlay: "Laten we spelen! 🚀",
        yesSetupDesc: "Schakelt voorlezen, tekstgrootte aanpassen en indelingen in.",
        noContinueDesc: "Toegankelijkheidshulpmiddelen overslaan.",
        accessibilityNarrationDesc: "Spraakvoorlezen leest schermtekst, uitdagingen en navigatie-instructies hardop voor.",
        off: "Uit",
        noNarration: "Geen voorlezen",
        tourOnly: "Alleen tour",
        duringTours: "Tijdens actieve tours",
        fullApp: "Volledige app",
        narrateAllScreens: "Alle schermen voorlezen",
        voiceNarrationSpeed: "Spraakvoorleessnelheid",
        slower: "Langzamer",
        normal: "Normaal",
        faster: "Sneller",
        fast: "Snel",
        showSpeakerIcons: "Luidspreker-iconen weergeven",
        showSpeakerIconsDesc: "Toon audioknoppen naast tekstblokken.",
        textSizeDesc: "Pas de tekstgrootte aan om gemakkelijker te kunnen lezen.",
        smallest: "Kleinste",
        small: "Klein",
        large: "Groot",
        largest: "Grootste",
        normalTheme: "Standaard thema",
        blueYellowAccessibility: "Blauw & Geel",
        redTealAccessibility: "Rood & Teal",
        highContrastAccessibility: "Monochroom met hoog contrast",
        soloTitle: "Solo-verkender",
        soloDesc: "Verken in je eigen tempo, lees historische weetjes en vind geheimen.",
        pubGolfTitle: "Pubgolfer",
        pubGolfDesc: "Leuke drankspel-mechanica, slagen bijhouden en groepsscores.",
        socialTitle: "Sociale speler",
        socialDesc: "Speel op uitdagingsroosters, verdien prestaties en domineer het klassement."
    },
    es: {
        welcomeTitle: "Tracks & Taps lo convierte todo en un desafío.",
        welcomeSub: "No más visitas turísticas aburridas: reunimos rutas, preguntas locales y tareas fotográficas en un juego definitivo.",
        challenge: "DESAFÍO",
        chooseLanguageTitle: "Elige Tu Idioma 🌍",
        chooseLanguageDesc: "Configura tu idioma para que tu aventura sea perfecta. Traduciremos automáticamente las opciones de juego.",
        accessibilityTitle: "Accesibilidad ⚙️",
        accessibilityDesc: "¿Quieres habilitar funciones de accesibilidad como narración de voz o temas de alto contraste?",
        yesSetup: "Sí, configurar herramientas",
        noContinue: "No, continuar estándar",
        accessibilitySetupTitle: "Configurar Accesibilidad ⚙️",
        speechNarration: "Voz y Narración",
        textSizeFont: "Tamaño y Fuente de Texto",
        dyslexicFont: "Fuente Disléxica",
        dyslexicDesc: "Usa la tipografía OpenDyslexic para el texto.",
        accessibilityThemes: "Temas de Accesibilidad",
        claimNameTitle: "Reclama Tu Nombre 🏆",
        claimNameDesc: "Elige tu nombre de explorador. Así aparecerás en las tablas de clasificación y al jugar con amigos.",
        enterTextChallenge: "INGRESAR DESAFÍO DE TEXTO",
        writeUniqueName: "Escribe un nombre de código único para completar esta parada.",
        placeholderName: "Introduce tu nombre de aventurero...",
        selectStyleTitle: "Selecciona Estilo de Juego 🎯",
        selectStyleDesc: "Adaptaremos las recomendaciones a tu estilo personal de aventura urbana.",
        completeBonus: "BONIFICACIÓN DE ONBOARDING",
        signUp: "Registrarse",
        login: "Iniciar Sesión",
        orUseAsGuest: "o usar como invitado",
        continue: "Continuar",
        letsPlay: "¡A jugar! 🚀",
        yesSetupDesc: "Habilita la narración, el cambio de tamaño del texto y los diseños.",
        noContinueDesc: "Omitir los asistentes de accesibilidad personalizados.",
        accessibilityNarrationDesc: "La narración de voz lee en voz alta el texto de la pantalla, los desafíos y las instrucciones de navegación.",
        off: "Apagado",
        noNarration: "Sin narración",
        tourOnly: "Solo Tour",
        duringTours: "Durante tours activos",
        fullApp: "App Completa",
        narrateAllScreens: "Narrar todas las pantallas",
        voiceNarrationSpeed: "Velocidad de narración de voz",
        slower: "Más lento",
        normal: "Normal",
        faster: "Más rápido",
        fast: "Rápido",
        showSpeakerIcons: "Mostrar iconos de altavoz",
        showSpeakerIconsDesc: "Muestra botones de audio junto a los bloques de texto.",
        textSizeDesc: "Ajusta el tamaño del texto para facilitar la lectura.",
        smallest: "El más pequeño",
        small: "Pequeño",
        large: "Grande",
        largest: "El más grande",
        normalTheme: "Tema normal",
        blueYellowAccessibility: "Azul y Amarillo",
        redTealAccessibility: "Rojo y Teal",
        highContrastAccessibility: "Monocromo de alto contraste",
        soloTitle: "Explorador Solitario",
        soloDesc: "Explora a tu propio ritmo, lee datos históricos curiosos y encuentra secretos.",
        pubGolfTitle: "Jugador de Pub Golf",
        pubGolfDesc: "Mecánica divertida de juego para beber, seguimiento de tragos y puntuación grupal.",
        socialTitle: "Competidor Social",
        socialDesc: "Compite en cuadrículas de desafíos, gana logros y domina la tabla de clasificación."
    },
    fr: {
        welcomeTitle: "Tracks & Taps transforme tout en défi.",
        welcomeSub: "Fini les visites touristiques ennuyeuses : nous rassemblons les itinéraires, les anecdotes locales et les défis photo en un jeu ultime.",
        challenge: "DÉFI",
        chooseLanguageTitle: "Choisissez Votre Langue 🌍",
        chooseLanguageDesc: "Configurons votre langue pour que votre aventure soit parfaite. Nous traduirons automatiquement le contenu du jeu.",
        accessibilityTitle: "Accessibilité ⚙️",
        accessibilityDesc: "Voulez-vous activer les fonctions d'accessibilité telles que la narration vocale ou les thèmes à contraste élevé ?",
        yesSetup: "Oui, configurer les outils",
        noContinue: "Non, continuer normalement",
        accessibilitySetupTitle: "Configuration de l'Accessibilité ⚙️",
        speechNarration: "Parole et Narration",
        textSizeFont: "Taille et Police du Texte",
        dyslexicFont: "Police Dyslexique",
        dyslexicDesc: "Utiliser la police OpenDyslexic pour le texte.",
        accessibilityThemes: "Thèmes d'Accessibilité",
        claimNameTitle: "Revendiquez Votre Nom 🏆",
        claimNameDesc: "Choisissez votre nom d'explorateur. C'est ainsi que vous apparaîtrez dans les classements et avec vos amis.",
        enterTextChallenge: "SANSIR LE DÉFI TEXTE",
        writeUniqueName: "Écrivez un nom de code unique pour valider cette étape.",
        placeholderName: "Entrez votre nom d'aventurier...",
        selectStyleTitle: "Style de Jeu 🎯",
        selectStyleDesc: "We will tailor recommendation styles to fit your personal city adventure style.",
        completeBonus: "BONUS DE FIN D'INTÉGRATION",
        signUp: "S'inscrire",
        login: "Se Connecter",
        orUseAsGuest: "ou utiliser comme invité",
        continue: "Continuer",
        letsPlay: "Jouons ! 🚀",
        yesSetupDesc: "Active la narration, le redimensionnement du texte et les mises en page.",
        noContinueDesc: "Passer les aides à l'accessibilité personnalisées.",
        accessibilityNarrationDesc: "La narration vocale lit à haute voix le texte de l'écran, les défis et les instructions de navigation.",
        off: "Désactivé",
        noNarration: "Pas de narration",
        tourOnly: "Tour uniquement",
        duringTours: "Pendant les tours actifs",
        fullApp: "Application complète",
        narrateAllScreens: "Narrer tous les écrans",
        voiceNarrationSpeed: "Vitesse de la narration vocale",
        slower: "Plus lent",
        normal: "Normal",
        faster: "Plus rapide",
        fast: "Rapide",
        showSpeakerIcons: "Afficher les icônes de haut-parleur",
        showSpeakerIconsDesc: "Afficher les boutons audio à côté des blocs de texte.",
        textSizeDesc: "Ajustez la taille du texte pour faciliter la lecture.",
        smallest: "Le plus petit",
        small: "Petit",
        large: "Grand",
        largest: "Le plus grand",
        normalTheme: "Thème normal",
        blueYellowAccessibility: "Bleu & Jaune",
        redTealAccessibility: "Rouge & Teal",
        highContrastAccessibility: "Monochrome à contraste élevé",
        soloTitle: "Explorateur Solo",
        soloDesc: "Explorez à votre rythme, lisez des anecdotes historiques et trouvez des secrets.",
        pubGolfTitle: "Joueur de Pub Golf",
        pubGolfDesc: "Mécanique de jeu de boisson amusante, suivi des gorgées et score de groupe.",
        socialTitle: "Compétiteur Social",
        socialDesc: "Participez à des grilles de défis, gagnez des succès et dominez le classement."
    },
    de: {
        welcomeTitle: "Tracks & Taps macht aus allem eine Challenge.",
        welcomeSub: "Kein langweiliges Sightseeing mehr – wir vereinen Routen, lokale Trivia und Fotoaufgaben in einem ultimativen Spiel.",
        challenge: "HERAUSFORDERUNG",
        chooseLanguageTitle: "Wähle Deine Sprache 🌍",
        chooseLanguageDesc: "Konfigurieren wir deine Sprache für ein reibungsloses Abenteuer. Spielinhalte werden automatisch übersetzt.",
        accessibilityTitle: "Barrierefreiheit ⚙️",
        accessibilityDesc: "Möchtest du Barrierefreiheitsfunktionen wie Sprachausgabe oder kontrastreiche Themes aktivieren?",
        yesSetup: "Ja, Tools einrichten",
        noContinue: "Nein, Standard fortsetzen",
        accessibilitySetupTitle: "Barrierefreiheit einrichten ⚙️",
        speechNarration: "Sprachausgabe & Vorlesen",
        textSizeFont: "Textgröße & Schriftart",
        dyslexicFont: "Dyslexie-Schriftart",
        dyslexicDesc: "Nutze OpenDyslexic-Schriftart für Texte.",
        accessibilityThemes: "Barrierefreie Themes",
        claimNameTitle: "Namen beanspruchen 🏆",
        claimNameDesc: "Wähle deinen Entdeckernamen. So wirst du auf Bestenlisten und beim Spielen mit Freunden angezeigt.",
        enterTextChallenge: "TEXT-CHALLENGE EINGEBEN",
        writeUniqueName: "Schreibe einen einzigartigen Codenamen, um diesen Stopp abzuschließen.",
        placeholderName: "Gib deinen Abenteurernamen ein...",
        selectStyleTitle: "Spielstil wählen 🎯",
        selectStyleDesc: "Wir passen die Empfehlungen an deinen persönlichen Stadtentdecker-Stil an.",
        completeBonus: "ONBOARDING-ABSCHLUSS-BONUS",
        signUp: "Registrieren",
        login: "Einloggen",
        orUseAsGuest: "oder als Gast fortfahren",
        continue: "Weiter",
        letsPlay: "Los geht's! 🚀",
        yesSetupDesc: "Aktiviert Sprachausgabe, Textskalierung und barrierefreie Layouts.",
        noContinueDesc: "Eigene Barrierefreiheits-Hilfen überspringen.",
        accessibilityNarrationDesc: "Die Sprachausgabe liest Bildschirmtexte, Herausforderungen und Navigationsanweisungen laut vor.",
        off: "Aus",
        noNarration: "Keine Sprachausgabe",
        tourOnly: "Nur Tour",
        duringTours: "Während aktiver Touren",
        fullApp: "Ganze App",
        narrateAllScreens: "Alle Bildschirme vorlesen",
        voiceNarrationSpeed: "Sprachausgabe-Geschwindigkeit",
        slower: "Langsamer",
        normal: "Normal",
        faster: "Schneller",
        fast: "Schnell",
        showSpeakerIcons: "Lautsprecher-Symbole anzeigen",
        showSpeakerIconsDesc: "Audio-Schaltflächen neben Textblöcken anzeigen.",
        textSizeDesc: "Passe die Textgröße für einfacheres Lesen an.",
        smallest: "Sehr klein",
        small: "Klein",
        large: "Groß",
        largest: "Sehr groß",
        normalTheme: "Standard-Theme",
        blueYellowAccessibility: "Blau & Gelb",
        redTealAccessibility: "Rot & Teal",
        highContrastAccessibility: "Kontrastreiches Monochrom",
        soloTitle: "Solo-Entdecker",
        soloDesc: "Erkunde in deinem eigenen Tempo, lies historische Trivia und finde Geheimnisse.",
        pubGolfTitle: "Pub-Golfer",
        pubGolfDesc: "Lustige Trinkspiel-Mechaniken, Schluck-Tracking und Gruppenwertung.",
        socialTitle: "Sozialer Wettkämpfer",
        socialDesc: "Tritt in Challenge-Rastern an, verdiene Erfolge und dominiere die Bestenliste."
    },
    pl: {
        welcomeTitle: "Tracks & Taps zamienia wszystko w wyzwanie.",
        welcomeSub: "Nigdy więcej nudnego zwiedzania — łączymy trasy, lokalne ciekawostki i zadania fotograficzne w jedną ostateczną grę.",
        challenge: "WYZWANIE",
        chooseLanguageTitle: "Wybierz Swój Język 🌍",
        chooseLanguageDesc: "Skonfigurujmy Twój język, aby przygoda przebiegała bez zakłóceń. Automatycznie przetłumaczymy elementy rozgrywki.",
        accessibilityTitle: "Dostępność ⚙️",
        accessibilityDesc: "Czy chcesz włączyć funkcje dostępności, takie jak lektor lub motywy o wysokim kontraście?",
        yesSetup: "Tak, skonfiguruj narzędzia",
        noContinue: "Nie, kontynuuj standardowo",
        accessibilitySetupTitle: "Konfiguracja Dostępności ⚙️",
        speechNarration: "Mowa i Lektor",
        textSizeFont: "Rozmiar i Czcionka Tekstu",
        dyslexicFont: "Czcionka dla Dyslektyków",
        dyslexicDesc: "Używaj czcionki OpenDyslexic do tekstów.",
        accessibilityThemes: "Motywy Dostępności",
        claimNameTitle: "Nazwij Swojego Odkrywcę 🏆",
        claimNameDesc: "Wybierz swoją nazwę odkrywcy. Będziesz tak widoczny w tabelach wyników i podczas gry ze znajomymi.",
        enterTextChallenge: "WPISZ WYZWANIE TEKSTOWE",
        writeUniqueName: "Wpisz unikalną nazwę kodową, aby zaliczyć ten przystanek.",
        placeholderName: "Wpisz swoją nazwę poszukiwacza przygód...",
        selectStyleTitle: "Wybierz Styl Gry 🎯",
        selectStyleDesc: "Dostosujemy rekomendacje do Twojego osobistego stylu miejskich przygód.",
        completeBonus: "PREMIA ZA UKOŃCZENIE ONBOARDINGU",
        signUp: "Zarejestruj się",
        login: "Zaloguj się",
        orUseAsGuest: "lub kontynuuj jako gość",
        continue: "Kontynuuj",
        letsPlay: "Zaczynamy! 🚀",
        yesSetupDesc: "Włącza lektora, zmianę rozmiaru tekstu i układów.",
        noContinueDesc: "Pomiń niestandardowe ułatwienia dostępu.",
        accessibilityNarrationDesc: "Lektor czyta na głos tekst na ekranie, wyzwania i instrukcje nawigacyjne.",
        off: "Wyłączone",
        noNarration: "Brak lektora",
        tourOnly: "Tylko trasa",
        duringTours: "Podczas aktywnych tras",
        fullApp: "Cała aplikacja",
        narrateAllScreens: "Czytaj wszystkie ekrany",
        voiceNarrationSpeed: "Prędkość głosu lektora",
        slower: "Wolniej",
        normal: "Normalnie",
        faster: "Szybciej",
        fast: "Szybko",
        showSpeakerIcons: "Pokaż ikony głośnika",
        showSpeakerIconsDesc: "Wyświetlaj przyciski audio obok bloków tekstu.",
        textSizeDesc: "Dostosuj rozmiar tekstu, aby ułatwić czytanie.",
        smallest: "Najmniejszy",
        small: "Mały",
        large: "Duży",
        largest: "Największy",
        normalTheme: "Zwykły motyw",
        blueYellowAccessibility: "Niebieski i żółty",
        redTealAccessibility: "Czerwony i turkusowy",
        highContrastAccessibility: "Monochromatyczny wysoki kontrast",
        soloTitle: "Samotny Odkrywca",
        soloDesc: "Eksploruj we własnym tempie, czytaj historyczne ciekawostki i znajduj sekrety.",
        pubGolfTitle: "Pub-golfer",
        pubGolfDesc: "Zabawna mechanika gry barowej, śledzenie łyków i punktacja grupowa.",
        socialTitle: "Rywal Towarzyski",
        socialDesc: "Rywalizuj w siatkach wyzwań, zdobywaj osiągnięcia i dominuj w tabeli liderów."
    }
};

export default function OnboardingScreen() {
    const { theme, mode, performTransition } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const { setIsAutoTranslateEnabled, translateText } = useTranslation();
    const { user, refreshUser, updateUserXp } = useUserContext();
    const router = useRouter();
    const { speak, stop } = useTextToSpeech();

    const narrationMode = useStore(state => state.narrationMode);
    const setNarrationMode = useStore(state => state.setNarrationMode);
    const speechRate = useStore(state => state.speechRate);
    const setSpeechRate = useStore(state => state.setSpeechRate);
    const showSpeakButtons = useStore(state => state.showSpeakButtons);
    const setShowSpeakButtons = useStore(state => state.setShowSpeakButtons);
    const fontScale = useStore(state => state.fontScale);
    const setFontScale = useStore(state => state.setFontScale);
    const dyslexicMode = useStore(state => state.dyslexicMode);
    const setDyslexicMode = useStore(state => state.setDyslexicMode);

    const [step, setStep] = useState(0);
    const [username, setUsername] = useState('');
    const [accessibilityEnabled, setAccessibilityEnabled] = useState<boolean | null>(null);
    const [showAccessibilityControls, setShowAccessibilityControls] = useState(false);
    const [selectedPlayStyle, setSelectedPlayStyle] = useState<string | null>(null);
    const [nameError, setNameError] = useState('');
    const [isVerifyingName, setIsVerifyingName] = useState(false);

    const [floatingPoints, setFloatingPoints] = useState<{ id: string; amount: number; label: string }[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);

    const progressWidth = useSharedValue(0);
    const welcomePulse = useSharedValue(1);

    // Dynamic translation helper
    const ot = (key: string) => {
        const langCode = language || 'en';
        return ONBOARDING_TRANSLATIONS[langCode]?.[key] || ONBOARDING_TRANSLATIONS.en[key];
    };

    const customT = (key: string) => {
        return ot(key) || (t && t(key as any)) || key;
    };

    useEffect(() => {
        if (user?.name) {
            setUsername(user.name);
        }
    }, [user]);

    useEffect(() => {
        if (step === 0) {
            welcomePulse.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1.0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        } else {
            welcomePulse.value = 1.0;
        }
    }, [step]);

    useEffect(() => {
        if (step > 0) {
            const percentage = (step / 5) * 100;
            progressWidth.value = withTiming(percentage, { duration: 400, easing: Easing.out(Easing.cubic) });
        } else {
            progressWidth.value = 0;
        }
    }, [step]);

    useEffect(() => {
        stop();
        let text = '';
        if (step === 1) {
            text = "Welcome to Tracks and Taps! Let's choose your language first.";
        } else if (step === 2) {
            if (showAccessibilityControls) {
                text = "Configure your accessibility tools below.";
            } else {
                text = "Would you like to configure accessibility options like audio narration or themes?";
            }
        } else if (step === 3) {
            text = "What should we call you? Enter your explorer name.";
        } else if (step === 4) {
            text = "Select your favorite adventure style.";
        } else if (step === 5) {
            text = "You are ready! Let's start the adventure.";
        }
        if (text) speak(text);
        return () => {
            stop();
        };
    }, [step, showAccessibilityControls]);

    const handleAddFloatingPoint = (amount: number, label: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        setFloatingPoints(prev => [...(prev || []), { id, amount, label }]);
    };

    const handleUsernameChange = (val: string) => {
        setUsername(val);
        setNameError('');
    };

    const handleNext = async () => {
        if (step === 2 && accessibilityEnabled === true && !showAccessibilityControls) {
            setShowAccessibilityControls(true);
            return;
        }

        if (step === 3) {
            const trimmed = username.trim();
            if (!trimmed) {
                setNameError('Please enter an explorer name.');
                return;
            }
            if (trimmed.length < 3) {
                setNameError('Name must be at least 3 characters.');
                return;
            }
            if (trimmed.length > 25) {
                setNameError('Name cannot exceed 25 characters.');
                return;
            }

            if (user && user.name === trimmed) {
                // User is already logged in and using their own name: no verification required
            } else {
                setIsVerifyingName(true);
                setNameError('');
                try {
                    const existingUser = await userService.getUserByName(trimmed);
                    if (existingUser) {
                        setNameError('Name is already taken. Please choose another.');
                        setIsVerifyingName(false);
                        return;
                    }
                } catch (err) {
                    console.warn('Failed to verify username availability:', err);
                }
                setIsVerifyingName(false);
            }
        }

        if (step < 5) {
            setStep(prev => prev + 1);
        } else {
            handleFinish(false);
        }
    };

    const handleBack = () => {
        if (step === 3 && accessibilityEnabled === true && showAccessibilityControls) {
            setShowAccessibilityControls(true);
            setStep(2);
            return;
        }
        if (step === 3 && accessibilityEnabled === true) {
            setShowAccessibilityControls(true);
            setStep(2);
            return;
        }
        if (step === 2 && showAccessibilityControls) {
            setShowAccessibilityControls(false);
            return;
        }
        if (step > 0) {
            setStep(prev => prev - 1);
        }
    };

    const handleThemeSelect = async (themeId: string | null, event?: any) => {
        if (!user?.id) {
            await AsyncStorage.setItem('@onboarding_theme', themeId || '');
            useStore.setState({ user: user ? { ...user, customTheme: themeId || undefined } : null });
            return;
        }

        const startingPoint = event ? {
            cx: event.nativeEvent.pageX,
            cy: event.nativeEvent.pageY
        } : undefined;

        let targetBg = theme.bgPrimary;
        if (themeId) {
            const themeConfig = COLOR_THEMES.find(t => t.id === themeId);
            if (themeConfig) {
                const overrides = mode === 'dark' ? themeConfig.dark : themeConfig.light;
                const base = mode === 'dark' ? darkTheme : lightTheme;
                targetBg = overrides.bgPrimary || base.bgPrimary;
            }
        } else {
            targetBg = mode === 'dark' ? darkTheme.bgPrimary : lightTheme.bgPrimary;
        }

        performTransition(async () => {
            try {
                const updateUser = useStore.getState().updateUser;
                await updateUser(user.id!, { customTheme: themeId });
            } catch (e) {
                console.warn('Failed to update custom theme preference:', e);
            }
        }, startingPoint, targetBg);
    };

    const handleFinish = async (isSkipped = false) => {
        if (!isSkipped) {
            setShowConfetti(true);
        }

        try {
            await AsyncStorage.setItem('hasSeenAppWizard', 'true');
            if (username.trim()) {
                await AsyncStorage.setItem('@onboarding_username', username.trim());
            }
            if (selectedPlayStyle) {
                await AsyncStorage.setItem('@onboarding_play_style', selectedPlayStyle);
            }
            
            if (user && user.id) {
                const updates: any = {};
                if (username.trim()) updates.name = username.trim();
                if (selectedPlayStyle) updates.playStyle = selectedPlayStyle;
                
                const onboardingTheme = await AsyncStorage.getItem('@onboarding_theme');
                if (onboardingTheme) {
                    updates.customTheme = onboardingTheme;
                    await AsyncStorage.removeItem('@onboarding_theme');
                }
                
                await useStore.getState().updateUser(user.id, updates);
            }

            if (refreshUser) {
                await refreshUser();
            }
        } catch (e) {
            console.error("Failed to complete onboarding", e);
        }

        setTimeout(() => {
            router.replace('/(tabs)/explore');
        }, isSkipped ? 200 : 2200);
    };

    const handleAuthRedirect = async (route: '/auth/login' | '/auth/register') => {
        try {
            await AsyncStorage.setItem('hasSeenAppWizard', 'true');
            if (username.trim()) {
                await AsyncStorage.setItem('@onboarding_username', username.trim());
            }
            if (selectedPlayStyle) {
                await AsyncStorage.setItem('@onboarding_play_style', selectedPlayStyle);
            }
            const onboardingTheme = await AsyncStorage.getItem('@onboarding_theme');
            if (onboardingTheme && user?.id) {
                await useStore.getState().updateUser(user.id, { customTheme: onboardingTheme });
                await AsyncStorage.removeItem('@onboarding_theme');
            }
        } catch (e) {
            console.error("Failed to save auth redirect choices", e);
        }
        router.push(route);
    };

    const handleSkip = () => {
        handleFinish(true);
    };

    const progressStyle = useAnimatedStyle(() => {
        return {
            width: `${progressWidth.value}%`
        };
    });

    const animatedWelcomeStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: welcomePulse.value }]
        };
    });

    const playStyles: PlayStyleOption[] = [
        { id: 'solo', title: ot('soloTitle'), description: ot('soloDesc'), emoji: '🧭' },
        { id: 'pub_golf', title: ot('pubGolfTitle'), description: ot('pubGolfDesc'), emoji: '⛳' },
        { id: 'social', title: ot('socialTitle'), description: ot('socialDesc'), emoji: '⚔️' }
    ];

    const isContinueDisabled =
        (step === 2 && accessibilityEnabled === null) ||
        (step === 3 && (!username.trim() || !!nameError || isVerifyingName)) ||
        (step === 4 && !selectedPlayStyle);

    // List of accessibility themes including default/normal theme
    const accessibilityThemes = [
        { id: null, name: 'Normal Theme', light: { primary: theme.primary }, dark: { primary: theme.primary } },
        ...COLOR_THEMES.filter((tc: any) => tc.id.endsWith('_accessibility'))
    ];

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
            style={[styles.container, { backgroundColor: theme.bgPrimary }]}
        >
            {step === 0 && (
                <LinearGradient 
                    colors={mode === 'dark' ? ['#1E1E38', '#0F0F1A'] : ['#E0F2FE', '#BAE6FD']}
                    style={StyleSheet.absoluteFillObject}
                >
                    <View style={styles.splashContent}>
                        <View style={styles.splashTop}>
                            <Animated.Text style={[styles.splashLogo, { color: theme.primary }]}>
                                Tracks & Taps
                            </Animated.Text>
                            <TextComponent variant="body" color={theme.textSecondary} center style={styles.splashSub}>
                                The World is Your Game Board 🗺️
                            </TextComponent>
                        </View>

                        <Animated.View style={[styles.illustrationContainer, animatedWelcomeStyle]}>
                            <LinearGradient 
                                colors={[theme.accent || theme.primary, theme.primary]}
                                style={styles.cardIllustrationBg}
                            >
                                <Sparkles size={56} color="#FFF" />
                            </LinearGradient>
                            <View style={[styles.polaroidCard, { backgroundColor: theme.bgSecondary }]}>
                                <TextComponent variant="caption" bold color={theme.primary} style={{ letterSpacing: 1 }}>
                                    STOP 1 / 9
                                </TextComponent>
                                <TextComponent variant="h3" style={{ fontSize: 16, marginTop: 4 }}>
                                    Dam Square
                                </TextComponent>
                            </View>
                        </Animated.View>

                        <View style={styles.splashBottom}>
                            <TextComponent variant="body" color={theme.textSecondary} center style={{ marginBottom: 32, paddingHorizontal: 24 }}>
                                Turn any city into an exciting urban playground. Explore, complete challenges, and discover hidden gems!
                            </TextComponent>

                            <AnimatedPressable
                                onPress={() => setStep(1)}
                                style={styles.getStartedButton}
                                interactionScale="subtle"
                            >
                                <LinearGradient
                                    colors={[theme.primary, theme.accent || theme.primary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.gradientButton}
                                >
                                    <TextComponent variant="h3" color="#FFF" bold>
                                        Get Started
                                    </TextComponent>
                                </LinearGradient>
                            </AnimatedPressable>
                        </View>
                    </View>
                </LinearGradient>
            )}

            {step > 0 && (
                <View style={{ flex: 1 }}>
                    <View style={[styles.header, { backgroundColor: theme.bgSecondary }]}>
                        <View style={styles.headerTop}>
                            <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
                                <ChevronLeft size={24} color={theme.textPrimary} />
                            </TouchableOpacity>
                            <TextComponent variant="label" color={theme.textSecondary}>
                                Stop {step} of 5
                            </TextComponent>
                            <TouchableOpacity onPress={handleSkip}>
                                <TextComponent variant="body" color={theme.primary} bold>
                                    Skip
                                </TextComponent>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.progressBarTrack, { backgroundColor: theme.bgTertiary }]}>
                            <Animated.View style={[styles.progressBarFillContainer, progressStyle, { overflow: 'hidden' }]}>
                                <LinearGradient
                                    colors={[theme.primary, theme.secondary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[StyleSheet.absoluteFillObject, { borderRadius: 4 }]}
                                />
                            </Animated.View>
                        </View>
                    </View>

                    <ScrollView contentContainerStyle={styles.stepScrollContent} showsVerticalScrollIndicator={false}>
                        {step === 1 && (
                            <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContainer}>
                                <LinearGradient
                                    colors={[theme.primary, theme.secondary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.borderContainer}
                                >
                                    <View style={[styles.innerCard, { backgroundColor: theme.bgSecondary }]}>
                                        <View style={styles.badgeContainer}>
                                            <Sparkles size={16} color={theme.primary} />
                                            <TextComponent variant="caption" bold color={theme.primary} style={{ marginLeft: 6 }}>
                                                {ot('challenge')} 1
                                            </TextComponent>
                                        </View>
                                        <TextComponent variant="h1" style={styles.stepTitle}>
                                            {ot('chooseLanguageTitle')}
                                        </TextComponent>
                                        <TextComponent variant="body" color={theme.textSecondary} style={styles.stepDesc}>
                                            {ot('chooseLanguageDesc')}
                                        </TextComponent>

                                        <View style={styles.optionsList}>
                                            {[
                                                { code: 'en', label: 'English', flag: '🇬🇧' },
                                                { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
                                                { code: 'es', label: 'Español', flag: '🇪🇸' },
                                                { code: 'fr', label: 'Français', flag: '🇫🇷' },
                                                { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
                                                { code: 'pl', label: 'Polski', flag: '🇵🇱' },
                                            ].map((lang) => {
                                                const isSelected = language === lang.code;
                                                return (
                                                    <TouchableOpacity
                                                        key={lang.code}
                                                        onPress={async () => {
                                                            setLanguage(lang.code as any);
                                                            setIsAutoTranslateEnabled(true);
                                                        }}
                                                        style={[
                                                            styles.optionCard,
                                                            { 
                                                                backgroundColor: theme.bgTertiary,
                                                                borderColor: isSelected ? theme.primary : theme.borderPrimary
                                                            }
                                                        ]}
                                                    >
                                                        <TextComponent variant="body" bold style={{ fontSize: 18 }}>
                                                            {lang.flag}  {lang.label}
                                                        </TextComponent>
                                                        {isSelected && (
                                                            <View style={[styles.checkboxSelected, { backgroundColor: theme.primary }]}>
                                                                <Check size={14} color="#FFF" />
                                                            </View>
                                                        )}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                </LinearGradient>
                            </Animated.View>
                        )}

                        {step === 2 && !showAccessibilityControls && (
                            <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContainer}>
                                <LinearGradient
                                    colors={[theme.primary, theme.secondary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.borderContainer}
                                >
                                    <View style={[styles.innerCard, { backgroundColor: theme.bgSecondary }]}>
                                        <View style={styles.badgeContainer}>
                                            <Accessibility size={16} color={theme.primary} />
                                            <TextComponent variant="caption" bold color={theme.primary} style={{ marginLeft: 6 }}>
                                                {ot('challenge')} 2
                                            </TextComponent>
                                        </View>
                                        <TextComponent variant="h1" style={styles.stepTitle}>
                                            {ot('accessibilityTitle')}
                                        </TextComponent>
                                        <TextComponent variant="body" color={theme.textSecondary} style={styles.stepDesc}>
                                            {ot('accessibilityDesc')}
                                        </TextComponent>

                                        <View style={styles.optionsList}>
                                            <TouchableOpacity
                                                onPress={() => setAccessibilityEnabled(true)}
                                                style={[
                                                    styles.optionCard,
                                                    { 
                                                        backgroundColor: theme.bgTertiary,
                                                        borderColor: accessibilityEnabled === true ? theme.primary : theme.borderPrimary
                                                    }
                                                ]}
                                            >
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                    <Volume2 size={24} color={accessibilityEnabled === true ? theme.primary : theme.textPrimary} />
                                                    <View style={{ flex: 1 }}>
                                                        <TextComponent variant="h3" style={{ fontSize: 16 }}>{ot('yesSetup')}</TextComponent>
                                                        <TextComponent variant="caption" color={theme.textSecondary}>{ot('yesSetupDesc')}</TextComponent>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => setAccessibilityEnabled(false)}
                                                style={[
                                                    styles.optionCard,
                                                    { 
                                                        backgroundColor: theme.bgTertiary,
                                                        borderColor: accessibilityEnabled === false ? theme.primary : theme.borderPrimary
                                                    }
                                                ]}
                                            >
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                    <Play size={24} color={theme.textSecondary} />
                                                    <View style={{ flex: 1 }}>
                                                        <TextComponent variant="h3" style={{ fontSize: 16 }}>{ot('noContinue')}</TextComponent>
                                                        <TextComponent variant="caption" color={theme.textSecondary}>{ot('noContinueDesc')}</TextComponent>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </Animated.View>
                        )}

                        {step === 2 && showAccessibilityControls && (
                            <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContainer}>
                                <LinearGradient
                                    colors={[theme.primary, theme.secondary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.borderContainer}
                                >
                                    <View style={[styles.innerCard, { backgroundColor: theme.bgSecondary }]}>
                                        <View style={styles.badgeContainer}>
                                            <Accessibility size={16} color={theme.primary} />
                                            <TextComponent variant="caption" bold color={theme.primary} style={{ marginLeft: 6 }}>
                                                {ot('challenge')} 2 ({ot('continue')})
                                            </TextComponent>
                                        </View>
                                        <TextComponent variant="h1" style={styles.stepTitle}>
                                            {ot('accessibilitySetupTitle')}
                                        </TextComponent>
                                        
                                        <TextComponent variant="label" color={theme.primary} bold style={{ marginTop: 16, marginBottom: 8 }}>
                                            {ot('speechNarration')}
                                        </TextComponent>
                                        <NarrationSettings
                                            narrationMode={narrationMode}
                                            setNarrationMode={setNarrationMode}
                                            speechRate={speechRate}
                                            setSpeechRate={setSpeechRate}
                                            showSpeakButtons={showSpeakButtons}
                                            setShowSpeakButtons={setShowSpeakButtons}
                                            theme={theme}
                                            t={customT}
                                            speak={speak}
                                        />

                                        <TextComponent variant="label" color={theme.primary} bold style={{ marginTop: 20, marginBottom: 8 }}>
                                            {ot('textSizeFont')}
                                        </TextComponent>
                                        <TextSizeSettings
                                            fontScale={fontScale}
                                            setFontScale={setFontScale}
                                            theme={theme}
                                            t={customT}
                                        />

                                        <View style={[styles.innerPreferenceCard, { backgroundColor: theme.bgTertiary, marginTop: 12 }]}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <View style={{ flex: 1, paddingRight: 8 }}>
                                                    <TextComponent bold color={theme.textPrimary}>{ot('dyslexicFont')}</TextComponent>
                                                    <TextComponent variant="caption" color={theme.textSecondary}>{ot('dyslexicDesc')}</TextComponent>
                                                </View>
                                                <Switch
                                                    value={dyslexicMode}
                                                    onValueChange={setDyslexicMode}
                                                    trackColor={{ false: theme.bgDisabled, true: theme.primary + '80' }}
                                                    thumbColor={dyslexicMode ? theme.primary : '#f4f3f4'}
                                                />
                                            </View>
                                        </View>

                                        <TextComponent variant="label" color={theme.primary} bold style={{ marginTop: 20, marginBottom: 8 }}>
                                            {ot('accessibilityThemes')}
                                        </TextComponent>
                                        <View style={[styles.innerPreferenceCard, { backgroundColor: theme.bgTertiary, paddingHorizontal: 0 }]}>
                                            <ScrollView 
                                                horizontal 
                                                showsHorizontalScrollIndicator={false}
                                                contentContainerStyle={styles.themeScrollContainer}
                                            >
                                                {accessibilityThemes.map((themeConfig) => {
                                                    const isActive = user?.customTheme === themeConfig.id || (themeConfig.id === null && !user?.customTheme);
                                                    const config = themeConfig.id 
                                                        ? (mode === 'dark' ? themeConfig.dark : themeConfig.light)
                                                        : { primary: theme.primary, secondary: theme.secondary || theme.primary };
                                                    const colors: [string, string] = [
                                                        config.primary || theme.primary,
                                                        config.secondary || config.primary || theme.secondary
                                                    ];

                                                    return (
                                                        <AnimatedPressable
                                                            key={themeConfig.id ?? 'default'}
                                                            onPress={(e) => handleThemeSelect(themeConfig.id, e)}
                                                            style={[
                                                                styles.themeOption,
                                                                {
                                                                    width: 140,
                                                                    backgroundColor: isActive ? theme.primary + '10' : 'transparent',
                                                                    borderColor: isActive ? theme.primary : theme.borderSecondary,
                                                                    borderWidth: isActive ? 1.5 : 1
                                                                }
                                                            ]}
                                                        >
                                                            <LinearGradient
                                                                colors={colors}
                                                                style={styles.themeColorCircle}
                                                            />
                                                            <TextComponent
                                                                style={styles.themeLabel}
                                                                color={isActive ? theme.primary : theme.textPrimary}
                                                                bold={isActive}
                                                                variant="caption"
                                                                numberOfLines={2}
                                                            >
                                                                {themeConfig.id === null 
                                                                    ? ot('normalTheme')
                                                                    : themeConfig.id === 'blue_yellow_accessibility'
                                                                        ? ot('blueYellowAccessibility')
                                                                        : themeConfig.id === 'red_teal_accessibility'
                                                                            ? ot('redTealAccessibility')
                                                                            : ot('highContrastAccessibility')}
                                                            </TextComponent>
                                                            {isActive && (
                                                                <View style={[styles.activeBadge, { backgroundColor: theme.primary }]}>
                                                                    <Ionicons name="checkmark" size={10} color={theme.textOnPrimary} />
                                                                </View>
                                                            )}
                                                        </AnimatedPressable>
                                                    );
                                                })}
                                            </ScrollView>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </Animated.View>
                        )}

                        {step === 3 && (
                            <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContainer}>
                                <LinearGradient
                                    colors={[theme.primary, theme.secondary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.borderContainer}
                                >
                                    <View style={[styles.innerCard, { backgroundColor: theme.bgSecondary }]}>
                                        <View style={styles.badgeContainer}>
                                            <Sparkles size={16} color={theme.primary} />
                                            <TextComponent variant="caption" bold color={theme.primary} style={{ marginLeft: 6 }}>
                                                {ot('challenge')} 3
                                            </TextComponent>
                                        </View>
                                        <TextComponent variant="h1" style={styles.stepTitle}>
                                            {ot('claimNameTitle')}
                                        </TextComponent>
                                        <TextComponent variant="body" color={theme.textSecondary} style={styles.stepDesc}>
                                            {ot('claimNameDesc')}
                                        </TextComponent>

                                        <View style={[styles.activeChallengeCardMock, { backgroundColor: theme.bgTertiary, borderColor: theme.borderPrimary }]}>
                                            <TextComponent variant="caption" bold color={theme.accent || theme.primary} style={{ marginBottom: 12 }}>
                                                🎯 {ot('enterTextChallenge')}
                                            </TextComponent>
                                            <TextComponent variant="body" style={{ marginBottom: 16 }}>
                                                {ot('writeUniqueName')}
                                            </TextComponent>

                                            <ScaledTextInput
                                                style={[styles.input, { color: theme.textPrimary, borderColor: nameError ? theme.danger : theme.borderPrimary, backgroundColor: theme.bgSecondary }]}
                                                placeholder={ot('placeholderName')}
                                                placeholderTextColor={theme.textSecondary}
                                                value={username}
                                                onChangeText={handleUsernameChange}
                                                autoCapitalize="none"
                                            />
                                            {nameError ? (
                                                <TextComponent variant="caption" color={theme.danger} style={{ marginTop: 6 }}>
                                                    {nameError}
                                                </TextComponent>
                                            ) : null}
                                        </View>
                                    </View>
                                </LinearGradient>
                            </Animated.View>
                        )}

                        {step === 4 && (
                            <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContainer}>
                                <LinearGradient
                                    colors={[theme.primary, theme.secondary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.borderContainer}
                                >
                                    <View style={[styles.innerCard, { backgroundColor: theme.bgSecondary }]}>
                                        <View style={styles.badgeContainer}>
                                            <Sparkles size={16} color={theme.primary} />
                                            <TextComponent variant="caption" bold color={theme.primary} style={{ marginLeft: 6 }}>
                                                {ot('challenge')} 4
                                            </TextComponent>
                                        </View>
                                        <TextComponent variant="h1" style={styles.stepTitle}>
                                            {ot('selectStyleTitle')}
                                        </TextComponent>
                                        <TextComponent variant="body" color={theme.textSecondary} style={styles.stepDesc}>
                                            {ot('selectStyleDesc')}
                                        </TextComponent>

                                        <View style={styles.optionsList}>
                                            {playStyles.map((style) => {
                                                const isSelected = selectedPlayStyle === style.id;
                                                return (
                                                    <TouchableOpacity
                                                        key={style.id}
                                                        onPress={() => setSelectedPlayStyle(style.id)}
                                                        style={[
                                                            styles.optionCardMultiLine,
                                                            { 
                                                                backgroundColor: theme.bgTertiary,
                                                                borderColor: isSelected ? theme.primary : theme.borderPrimary
                                                            }
                                                        ]}
                                                    >
                                                        <View style={styles.multiLineContent}>
                                                            <TextComponent style={styles.emojiIcon}>{style.emoji}</TextComponent>
                                                            <View style={{ flex: 1 }}>
                                                                <TextComponent variant="h3" style={{ fontSize: 16 }}>{style.title}</TextComponent>
                                                                <TextComponent variant="caption" color={theme.textSecondary}>{style.description}</TextComponent>
                                                            </View>
                                                            <View style={[styles.radioCircle, { borderColor: theme.borderPrimary }]}>
                                                                {isSelected && <View style={[styles.radioFill, { backgroundColor: theme.primary }]} />}
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                </LinearGradient>
                            </Animated.View>
                        )}

                        {step === 5 && (
                            <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.finalStepContainer}>
                                <TextComponent variant="h1" bold style={styles.finalTitle}>
                                    {ot('welcomeTitle')}
                                </TextComponent>
                                <TextComponent variant="body" color={theme.textSecondary} style={styles.finalSub}>
                                    {ot('welcomeSub')}
                                </TextComponent>

                                <View style={styles.mockupContainer}>
                                    {/* Left Phone (Slanted - Pub Golf Screenshot) */}
                                    <View style={[styles.mockPhoneFrame, styles.leftPhone, { borderColor: theme.borderSecondary || theme.borderPrimary, backgroundColor: theme.bgSecondary }]}>
                                        <Image 
                                            source={require('@/assets/images/onboarding_pubgolf.png')} 
                                            style={{ width: '100%', height: '100%', borderRadius: 28 }} 
                                            resizeMode="cover" 
                                        />
                                    </View>

                                    {/* Right Phone (Slanted - Tour Overview Map Screenshot) */}
                                    <View style={[styles.mockPhoneFrame, styles.rightPhone, { borderColor: theme.borderSecondary || theme.borderPrimary, backgroundColor: theme.bgSecondary }]}>
                                        <Image 
                                            source={require('@/assets/images/onboarding_tour.png')} 
                                            style={{ width: '100%', height: '100%', borderRadius: 28 }} 
                                            resizeMode="cover" 
                                        />
                                    </View>

                                    {/* Center Phone (Straight - Challenge Screenshot) */}
                                    <View style={[styles.mockPhoneFrame, styles.centerPhone, { borderColor: theme.borderPrimary, backgroundColor: theme.bgSecondary }]}>
                                        <Image 
                                            source={require('@/assets/images/onboarding_challenge.png')} 
                                            style={{ width: '100%', height: '100%', borderRadius: 28 }} 
                                            resizeMode="cover" 
                                        />
                                    </View>

                                    {/* Overlapping Floating Icon Bubbles */}
                                    <View style={[styles.floatBubble, styles.bubble1, { backgroundColor: theme.bgSecondary, shadowColor: '#000' }]}>
                                        <Sparkles size={18} color={theme.primary} />
                                    </View>
                                    <View style={[styles.floatBubble, styles.bubble2, { backgroundColor: theme.bgSecondary, shadowColor: '#000' }]}>
                                        <Award size={18} color="#EAB308" />
                                    </View>
                                    <View style={[styles.floatBubble, styles.bubble3, { backgroundColor: theme.bgSecondary, shadowColor: '#000' }]}>
                                        <Gamepad size={18} color="#10B981" />
                                    </View>
                                </View>

                                <View style={styles.finalActionsContainer}>
                                    {user ? (
                                        <AnimatedPressable
                                            onPress={() => handleFinish(false)}
                                            style={styles.finalContinueButton}
                                            interactionScale="subtle"
                                        >
                                            <TextComponent variant="h3" color="#FFF" bold>
                                                {ot('continue')}
                                            </TextComponent>
                                        </AnimatedPressable>
                                    ) : (
                                        <>
                                            <AnimatedPressable
                                                onPress={() => handleAuthRedirect('/auth/register')}
                                                style={styles.finalContinueButton}
                                                interactionScale="subtle"
                                            >
                                                <TextComponent variant="h3" color="#FFF" bold>
                                                    {ot('signUp')}
                                                </TextComponent>
                                            </AnimatedPressable>

                                            <TouchableOpacity
                                                onPress={() => handleFinish(false)}
                                                style={styles.finalGuestLink}
                                            >
                                                <TextComponent variant="body" color={theme.textSecondary} bold center style={styles.finalGuestText}>
                                                    {ot('orUseAsGuest')}
                                                </TextComponent>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            </Animated.View>
                        )}
                    </ScrollView>

                    {step < 5 && (
                        <View style={[styles.bottomBar, { backgroundColor: theme.bgSecondary, borderTopColor: 'transparent' }]}>
                            <TouchableOpacity
                                onPress={handleNext}
                                style={[
                                    styles.finalContinueButton,
                                    isContinueDisabled && { backgroundColor: theme.bgDisabled }
                                ]}
                                disabled={isContinueDisabled}
                            >
                                {isVerifyingName ? (
                                    <ActivityIndicator color={theme.textOnPrimary} size="small" />
                                ) : (
                                    <TextComponent variant="h3" color={isContinueDisabled ? theme.textSecondary : "#FFF"} bold>
                                        {ot('continue')}
                                    </TextComponent>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {showConfetti && <Confetti />}

            {floatingPoints?.map((item) => (
                <FloatingPoints
                    key={item.id}
                    id={item.id}
                    pointAmount={item.amount}
                    label={item.label}
                    onAnimationComplete={() => {
                        setFloatingPoints(prev => prev?.filter(fp => fp.id !== item.id));
                    }}
                />
            ))}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    splashContent: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 60,
    },
    splashTop: {
        alignItems: 'center',
        marginTop: 20,
    },
    splashLogo: {
        fontSize: 42,
        fontWeight: '900',
        letterSpacing: -1.5,
    },
    splashSub: {
        fontSize: 16,
        marginTop: 4,
        letterSpacing: 0.5,
    },
    illustrationContainer: {
        width: screenWidth * 0.8,
        height: screenWidth * 0.8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardIllustrationBg: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 10,
    },
    polaroidCard: {
        position: 'absolute',
        bottom: 0,
        right: 10,
        padding: 16,
        borderRadius: 16,
        width: 180,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    splashBottom: {
        width: '100%',
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    getStartedButton: {
        width: '100%',
        borderRadius: 30,
        overflow: 'hidden',
    },
    gradientButton: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 16,
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconButton: {
        padding: 4,
    },
    progressBarTrack: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        width: '100%',
    },
    progressBarFillContainer: {
        height: '100%',
        borderRadius: 4,
    },
    stepScrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 40,
    },
    stepContainer: {
        width: '100%',
    },
    borderContainer: {
        borderRadius: 24,
        padding: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    innerCard: {
        borderRadius: 22,
        padding: 20,
        width: '100%',
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    stepTitle: {
        fontSize: 24,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    stepDesc: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },
    optionsList: {
        width: '100%',
        gap: 12,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    optionCardMultiLine: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    multiLineContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    emojiIcon: {
        fontSize: 24,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioFill: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    checkboxSelected: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeChallengeCardMock: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
    },
    input: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    celebrationCard: {
        width: '100%',
        alignItems: 'center',
    },
    xpRewardBox: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    bottomBar: {
        padding: 20,
    },
    innerPreferenceCard: {
        padding: 12,
        borderRadius: 16,
        marginBottom: 10,
    },
    themeScrollContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    themeOption: {
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    themeColorCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginBottom: 8,
    },
    themeLabel: {
        textAlign: 'center',
    },
    activeBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trueFalseRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
        width: '100%',
    },
    trueFalseButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 2,
    },
    authSelectButton: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
    },
    authGradientButton: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    authBorderButton: {
        paddingVertical: 14,
        borderRadius: 20,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    guestLink: {
        marginTop: 10,
        paddingVertical: 8,
    },
    tinyGuestText: {
        fontSize: 11,
        textDecorationLine: 'underline',
    },
    finalStepContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
        alignItems: 'center',
    },
    finalTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'left',
        width: '100%',
        lineHeight: 38,
        marginBottom: 12,
    },
    finalSub: {
        fontSize: 16,
        lineHeight: 22,
        textAlign: 'left',
        width: '100%',
        marginBottom: 20,
    },
    mockupContainer: {
        height: 310,
        width: '100%',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    mockPhoneFrame: {
        width: 155,
        height: 265,
        borderRadius: 32,
        borderWidth: 4.5,
        overflow: 'hidden',
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    leftPhone: {
        transform: [{ rotate: '-12deg' }, { translateX: -72 }],
        zIndex: 1,
    },
    rightPhone: {
        transform: [{ rotate: '12deg' }, { translateX: 72 }],
        zIndex: 1,
    },
    centerPhone: {
        zIndex: 2,
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    mockScreenContent: {
        flex: 1,
        padding: 12,
    },
    floatBubble: {
        position: 'absolute',
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        zIndex: 3,
    },
    bubble1: {
        top: 25,
        left: '8%',
    },
    bubble2: {
        bottom: 50,
        left: '6%',
    },
    bubble3: {
        top: 45,
        right: '6%',
    },
    finalActionsContainer: {
        width: '100%',
        marginTop: 20,
        gap: 12,
    },
    finalContinueButton: {
        backgroundColor: '#000000',
        paddingVertical: 16,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    finalGuestLink: {
        paddingVertical: 8,
        alignItems: 'center',
    },
    finalGuestText: {
        fontSize: 14,
    }
});

const lightTheme = {
    bgPrimary: '#F8FAFC',
};
const darkTheme = {
    bgPrimary: '#0F172A',
};
