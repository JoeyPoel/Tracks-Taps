import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useTutorial } from '@/src/context/TutorialContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAppWidth } from '@/src/hooks/useAppWidth';
import { useRouter } from 'expo-router';
import { Wand2 } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { 
    FadeIn, 
    FadeOut, 
    FadeInDown,
    ZoomIn, 
    useSharedValue, 
    useAnimatedStyle, 
    withRepeat, 
    withSequence, 
    withTiming, 
    Easing 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { TextComponent } from '../common/TextComponent';

const { height } = Dimensions.get('window');

export const TutorialOverlay = () => {
    const appWidth = useAppWidth();
    const { isActive, currentStepIndex, steps, nextStep, skipTutorial } = useTutorial();
    const { theme } = useTheme();
    const router = useRouter();
    const { session } = useAuth();
    const { setLanguage } = useLanguage();

    const bobOffset = useSharedValue(0);
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        if (isActive) {
            // Bobbing animation for the pointer (slowed down from 600 to 1200)
            bobOffset.value = withRepeat(
                withSequence(
                    withTiming(-8, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );

            // Pulsing animation for the top icon (slowed down from 800 to 1600)
            pulseScale.value = withRepeat(
                withSequence(
                    withTiming(1.15, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1.0, { duration: 1600, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        }
    }, [isActive, currentStepIndex]);

    const step = steps[currentStepIndex];

    const getPositionStyle = () => {
        // Per-step overrides take priority so each card sits in the ideal spot
        if (step.id === 'language_select') {
            // Tall card (6 language buttons) — push higher so it is visually centered
            return { top: height / 2 - 230 };
        }
        if (step.id === 'tour_details') {
            // On the tour detail screen the card should sit near the top
            // so the user can still scroll and interact with the content below
            return { top: 80 };
        }
        switch (step.position) {
            case 'top':
                return { top: 120 };
            case 'top-down':
                return { top: 120 };
            case 'center':
                return { top: height / 2 - 120 };
            case 'bottom':
            default:
                return { bottom: 140 };
        }
    };

    const animatedPointerStyle = useAnimatedStyle(() => {
        const isTopDown = step?.position === 'top-down';
        let translateY = bobOffset.value;
        
        if (isTopDown) {
            return {
                transform: [
                    { rotate: '45deg' },
                    { translateY: -translateY } // Inverse translation for pointing down
                ]
            };
        }
        
        return {
            transform: [
                { rotate: '45deg' },
                { translateY: translateY }
            ]
        };
    });

    const animatedIconStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pulseScale.value }]
        };
    });

    if (!isActive) return null;

    const isInteractiveStep = step.id === 'tour_select' || step.id === 'tour_details';
    // Fully transparent backdrop for interactive steps so the user can see and
    // interact with the screen content behind the guide card without distraction.
    const backdropColor = isInteractiveStep ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.55)';

    return (
        <View style={styles.overlay} pointerEvents="box-none">
            {/* Backdrop to block interaction and dim background */}
            <View 
                style={[styles.backdrop, { backgroundColor: backdropColor }]} 
                pointerEvents={isInteractiveStep ? 'none' : 'auto'}
            />

            <Animated.View
                key={step.id}
                entering={ZoomIn.springify().damping(22).mass(1.2).stiffness(90)}
                exiting={FadeOut.duration(400)}
                style={[
                    styles.card,
                    getPositionStyle(),
                    {
                        backgroundColor: theme.bgSecondary,
                        borderColor: theme.primary,
                        shadowColor: theme.textPrimary,
                        width: Math.min(appWidth * 0.8, 340)
                    }
                ]}
            >
                {/* Top Glow Bar — wrapped in overflow:hidden so it clips to the card corners.
                    The outer card keeps overflow:visible for the pointer triangle. */}
                <View style={styles.topGlowBarClip}>
                    <LinearGradient
                        colors={[theme.primary, theme.accent || theme.primary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.topGlowBar}
                    />
                </View>

                {step.position === 'top' && (
                    <Animated.View style={[styles.pointer, styles.pointerTop, { backgroundColor: theme.bgSecondary, borderColor: theme.primary }, animatedPointerStyle]} />
                )}

                <Animated.View style={[styles.iconContainer, { backgroundColor: theme.primary, borderColor: theme.bgSecondary }, animatedIconStyle]}>
                    <LinearGradient
                        colors={[theme.primary, theme.accent || theme.primary]}
                        style={StyleSheet.absoluteFill}
                    />
                    <Wand2 size={24} color="#FFF" />
                </Animated.View>

                {/* Guide companion indicator tag to make it feel like a helpful character guide */}
                <View style={[styles.guideBadge, { backgroundColor: theme.primary + '12', borderColor: theme.primary + '25' }]}>
                    <TextComponent variant="caption" bold color={theme.primary} style={{ letterSpacing: 0.8 }}>
                        ✨ QUEST GUIDE
                    </TextComponent>
                </View>

                <View style={styles.content}>
                    <TextComponent variant="h3" style={{ marginBottom: 8 }} center>{step.title}</TextComponent>
                    <TextComponent variant="body" color={theme.textSecondary} center style={{ marginBottom: step.id === 'language_select' ? 16 : 0 }}>
                        {step.description}
                    </TextComponent>

                    {step.id === 'language_select' && (
                        <View style={styles.languageContainer}>
                            {[
                                { code: 'en', label: 'English', flag: '🇬🇧' },
                                { code: 'es', label: 'Español', flag: '🇪🇸' },
                                { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
                                { code: 'fr', label: 'Français', flag: '🇫🇷' },
                                { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
                                { code: 'pl', label: 'Polski', flag: '🇵🇱' },
                            ].map((lang, idx) => (
                                <Animated.View
                                    key={lang.code}
                                    entering={FadeInDown.delay(idx * 80).duration(400).springify().damping(28)}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.languageBtn,
                                            { 
                                                borderColor: theme.borderPrimary, 
                                                backgroundColor: theme.bgPrimary 
                                            }
                                        ]}
                                        onPress={() => {
                                            setLanguage(lang.code as any);
                                            nextStep();
                                        }}
                                    >
                                        <TextComponent variant="body" bold>{lang.flag}  {lang.label}</TextComponent>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                        </View>
                    )}
                </View>

                {step.id !== 'language_select' && (
                    <View style={[styles.footer, { justifyContent: 'space-between' }]}>
                        {/* Left Side Action */}
                        {step.id === 'finish' && !session ? (
                            <TouchableOpacity
                                onPress={() => {
                                    skipTutorial();
                                }}
                                style={{ padding: 10 }}
                            >
                                <TextComponent variant="label" color={theme.textSecondary}>Maybe Later</TextComponent>
                            </TouchableOpacity>
                        ) : step.id !== 'finish' && !isInteractiveStep ? (
                            <TouchableOpacity onPress={skipTutorial} style={{ padding: 10 }}>
                                <TextComponent variant="label" color={theme.textSecondary}>Skip</TextComponent>
                            </TouchableOpacity>
                        ) : (
                            <View />
                        )}

                        {/* Right Side Action */}
                        {step.id === 'finish' ? (
                            !session ? (
                                <TouchableOpacity
                                    onPress={() => {
                                        skipTutorial();
                                        router.push('/auth/register');
                                    }}
                                    style={styles.nextButtonWrapper}
                                >
                                    <LinearGradient
                                        colors={[theme.primary, theme.accent || theme.primary]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.nextButtonGradient}
                                    >
                                        <TextComponent variant="label" color="#FFF" bold style={{ fontSize: 15 }}>
                                            Sign Up! 🚀
                                        </TextComponent>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    onPress={nextStep}
                                    style={styles.nextButtonWrapper}
                                >
                                    <LinearGradient
                                        colors={[theme.primary, theme.accent || theme.primary]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.nextButtonGradient}
                                    >
                                        <TextComponent variant="label" color="#FFF" bold style={{ fontSize: 15 }}>
                                            Let's Play! 🍻
                                        </TextComponent>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )
                        ) : step.id === 'tour_select' ? (
                            <TextComponent variant="caption" color={theme.primary} bold style={{ paddingVertical: 10 }}>
                                👇 Tap the first card below to proceed!
                            </TextComponent>
                        ) : step.id === 'tour_details' ? (
                            <TouchableOpacity
                                onPress={nextStep}
                                style={styles.nextButtonWrapper}
                            >
                                <LinearGradient
                                    colors={[theme.primary, theme.accent || theme.primary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.nextButtonGradient}
                                >
                                    <TextComponent variant="label" color="#FFF" bold>
                                        Next
                                    </TextComponent>
                                </LinearGradient>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={nextStep}
                                style={styles.nextButtonWrapper}
                            >
                                <LinearGradient
                                    colors={[theme.primary, theme.accent || theme.primary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.nextButtonGradient}
                                >
                                    <TextComponent variant="label" color="#FFF" bold>
                                        Next
                                    </TextComponent>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {(step.position === 'bottom' || step.position === 'top-down') && (
                    // tour_select: static pointer — no bobbing so the UI feels calmer
                    // while the user is looking for the first tour card to tap.
                    step.id === 'tour_select' ? (
                        <View style={[styles.pointer, styles.pointerBottom, { backgroundColor: theme.bgSecondary, borderColor: theme.primary, transform: [{ rotate: '45deg' }] }]} />
                    ) : (
                        <Animated.View style={[styles.pointer, styles.pointerBottom, { backgroundColor: theme.bgSecondary, borderColor: theme.primary }, animatedPointerStyle]} />
                    )
                )}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999, // On top of everything
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        position: 'absolute',
        borderRadius: 20,
        padding: 20, // Reduced padding
        paddingTop: 32,
        borderWidth: 2,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        overflow: 'visible', // Allow pointer to stick out
        alignSelf: 'center',
    },
    guideBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 10,
        marginTop: -4,
    },
    topGlowBarClip: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 6,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    topGlowBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 6,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    iconContainer: {
        position: 'absolute',
        top: -24,
        left: '50%',
        marginLeft: -24,
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        zIndex: 2,
        overflow: 'hidden',
    },
    content: {
        marginBottom: 20,
        alignItems: 'center',
        width: '100%',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
    },
    nextButtonWrapper: {
        borderRadius: 30,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },
    nextButtonGradient: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pointer: {
        position: 'absolute',
        width: 20,
        height: 20,
        left: '50%',
        marginLeft: -10,
        zIndex: 1, // On top of card to cover border
    },
    pointerBottom: {
        bottom: -11, // Push out slightly to align border
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderTopWidth: 0,
        borderLeftWidth: 0,
    },
    pointerTop: {
        top: -11,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderBottomWidth: 0,
        borderRightWidth: 0,
    },
    languageContainer: {
        width: '100%',
        gap: 8,
        marginTop: 10,
    },
    languageBtn: {
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderWidth: 1.5,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
});
