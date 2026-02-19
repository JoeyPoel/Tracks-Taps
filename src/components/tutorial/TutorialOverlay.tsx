import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useTutorial } from '@/src/context/TutorialContext';
import { useRouter } from 'expo-router';
import { Wand2 } from 'lucide-react-native';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { TextComponent } from '../common/TextComponent';

const { width, height } = Dimensions.get('window');

export const TutorialOverlay = () => {
    const { isActive, currentStepIndex, steps, nextStep, skipTutorial } = useTutorial();
    const { theme } = useTheme();
    const router = useRouter();
    const { session } = useAuth();

    if (!isActive) return null;

    const step = steps[currentStepIndex];

    const getPositionStyle = () => {
        switch (step.position) {
            case 'top':
                return { top: 120 };
            case 'center':
                return { top: height / 2 - 100 };
            case 'bottom':
            default:
                return { bottom: 140 }; // Moved up slightly to make room for arrow
        }
    };

    return (
        <View style={styles.overlay} pointerEvents="box-none">
            {/* Backdrop to block interaction and dim background */}
            <View style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />

            <Animated.View
                key={step.id}
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(300)}
                style={[
                    styles.card,
                    getPositionStyle(),
                    { backgroundColor: theme.bgSecondary, borderColor: theme.primary, shadowColor: theme.textPrimary }
                ]}
            >
                {step.position === 'top' && (
                    <View style={[styles.pointer, styles.pointerTop, { backgroundColor: theme.bgSecondary, borderColor: theme.primary }]} />
                )}

                <View style={[styles.iconContainer, { backgroundColor: theme.primary, borderColor: theme.bgSecondary }]}>
                    <Wand2 size={24} color="#FFF" />
                </View>

                <View style={styles.content}>
                    <TextComponent variant="h3" style={{ marginBottom: 8 }} center>{step.title}</TextComponent>
                    <TextComponent variant="body" color={theme.textSecondary} center>{step.description}</TextComponent>
                </View>

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
                    ) : step.id !== 'finish' ? (
                        <TouchableOpacity onPress={skipTutorial} style={{ padding: 10 }}>
                            <TextComponent variant="label" color={theme.textSecondary}>Skip</TextComponent>
                        </TouchableOpacity>
                    ) : (
                        <View />
                    )}

                    {/* Right Side Action */}
                    {step.id === 'finish' && !session ? (
                        <TouchableOpacity
                            onPress={() => {
                                skipTutorial();
                                router.push('/auth/register');
                            }}
                            style={[styles.nextButton, { backgroundColor: theme.primary }]}
                        >
                            <TextComponent variant="label" color="#FFF" bold>
                                Sign Up
                            </TextComponent>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={nextStep}
                            style={[styles.nextButton, { backgroundColor: theme.primary }]}
                        >
                            <TextComponent variant="label" color="#FFF" bold>
                                {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
                            </TextComponent>
                        </TouchableOpacity>
                    )}
                </View>

                {step.position === 'bottom' && (
                    <View style={[styles.pointer, styles.pointerBottom, { backgroundColor: theme.bgSecondary, borderColor: theme.primary }]} />
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
        width: Math.min(width * 0.8, 340), // Reduced width, max cap
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
    },
    iconContainer: {
        position: 'absolute',
        top: -24,
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        zIndex: 2,
    },
    content: {
        marginBottom: 20,
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
    },
    nextButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 30,
    },
    pointer: {
        position: 'absolute',
        width: 20,
        height: 20,
        transform: [{ rotate: '45deg' }],
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
    }
});
