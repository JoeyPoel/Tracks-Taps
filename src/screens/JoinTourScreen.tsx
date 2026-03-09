import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { MapPinIcon, TicketIcon, UserGroupIcon } from 'react-native-heroicons/solid'; // Changed imports
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { AppModal } from '../components/common/AppModal';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { TourInviteCard } from '../components/friends/TourInviteCard';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useInvites } from '../hooks/useInvites';
import { useJoinTour } from '../hooks/useJoinTour';
import { authEvents } from '../utils/authEvents';

export default function JoinTourScreen() {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();
    const { user } = useAuth(); // Added useAuth
    const {
        tourCode,
        setTourCode,
        loading: joining,
        error,
        setError,
        handleJoinTour: originalHandleJoin
    } = useJoinTour();

    const handleJoinTour = () => {
        if (!user) {
            authEvents.emit();
            return;
        }
        originalHandleJoin();
    };

    const { invites, loading: loadingInvites, acceptInvite, declineInvite, processingId, expiredModalVisible, setExpiredModalVisible } = useInvites();

    // Animation shared values for floating effect
    const floatY = useSharedValue(0);

    React.useEffect(() => {
        floatY.value = withRepeat(
            withSequence(
                withTiming(-10, { duration: 2000 }),
                withTiming(0, { duration: 2000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: floatY.value }],
        };
    });

    return (
        <ScreenWrapper animateEntry={false} includeTop={true} includeBottom={false} style={{ backgroundColor: theme.bgPrimary }}>
            <Stack.Screen options={{ headerShown: false }} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    <ScreenHeader
                        title=" "
                        showBackButton={false}
                        style={{ paddingHorizontal: 0, paddingTop: 0 }}
                    />

                    {/* Hero Section */}
                    <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.heroContainer}>
                        <View style={[styles.heroCircle, { backgroundColor: theme.primary + '15' }]}>
                            <Animated.View style={animatedStyle}>
                                <MapPinIcon size={80} color={theme.primary} />
                            </Animated.View>

                            {/* Floating Elements */}
                            <Animated.View style={[styles.floatingIcon, { top: 10, right: 10, backgroundColor: theme.secondary }]}>
                                <UserGroupIcon size={24} color="#FFF" />
                            </Animated.View>
                            <Animated.View style={[styles.floatingIcon, { bottom: 10, left: 10, backgroundColor: '#8B5CF6' }]}>
                                <TicketIcon size={24} color="#FFF" />
                            </Animated.View>
                        </View>

                        <TextComponent style={styles.heroTitle} color={theme.textPrimary} bold variant="h1" center>
                            {t('readyForAdventure') || "Ready for Adventure?"}
                        </TextComponent>
                        <TextComponent style={styles.heroSubtitle} color={theme.textSecondary} variant="body" center>
                            {t('enterCodeInstruction') || "Enter the code shared by your team captain to join the tour."}
                        </TextComponent>
                    </Animated.View>

                    {/* Code Input */}
                    <Animated.View entering={FadeInUp.delay(200).springify()} style={{ width: '100%', alignItems: 'center' }}>
                        <View style={[
                            styles.codeInputContainer,
                            {
                                backgroundColor: theme.bgSecondary,
                                borderColor: error ? theme.danger : theme.borderSecondary,
                                borderWidth: 2
                            }
                        ]}>
                            <TextInput
                                style={[styles.hiddenInput, { color: 'transparent' }]} // Set color transparent, remove opacity from style
                                value={tourCode}
                                onChangeText={(text) => {
                                    const cleaned = text.replace(/\D/g, '');
                                    const limited = cleaned.slice(0, 9);
                                    // Format with spaces for display logic
                                    const formatted = limited.replace(/(\d{3})(?=\d)/g, '$1 ');
                                    setTourCode(formatted);
                                    setError(null);
                                }}
                                keyboardType="number-pad"
                                maxLength={11} // 9 digits + 2 spaces
                                // autoFocus={true} // Removed for better UX
                                caretHidden={true}
                                cursorColor="transparent" // Android-specific to hide cursor
                                selectionColor="transparent" // Hide selection
                            />

                            {/* Visual Placeholder if empty */}
                            {!tourCode && (

                                <TextComponent style={[styles.placeholderText, { opacity: 0.3 }]} color={theme.textTertiary} bold variant="h1">
                                    000 000 000
                                </TextComponent>
                            )}
                            {/* Real Text Overlay */}
                            <TextComponent style={styles.inputText} color={theme.textPrimary} bold variant="h1">
                                {tourCode}
                            </TextComponent>

                        </View>

                        {error && error !== t('tourNotFound') && (
                            <Animated.View entering={FadeInUp}>
                                <TextComponent style={styles.errorText} color={theme.danger} bold variant="caption">
                                    {error}
                                </TextComponent>
                            </Animated.View>
                        )}
                    </Animated.View>

                    <AnimatedButton
                        title={joining ? t('verifying') : t('joinTourButton')}
                        onPress={handleJoinTour}
                        loading={joining}
                        disabled={joining || tourCode.length < 3} // Basic loose check
                        variant="primary"
                        style={{ marginTop: 32, width: '100%' }}
                    />

                    {/* Section 2: Pending Invites */}
                    {(invites || []).length > 0 && (
                        <Animated.View entering={FadeInUp.delay(300).springify()} style={{ marginTop: 48, width: '100%' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                <View style={{ height: 1, flex: 1, backgroundColor: theme.borderSecondary }} />
                                <TextComponent style={[styles.sectionDividerText, { backgroundColor: theme.bgPrimary }]} color={theme.textSecondary} bold variant="caption">
                                    {t('orAcceptInvite') || "OR ACCEPT INVITE"}
                                </TextComponent>
                                <View style={{ height: 1, flex: 1, backgroundColor: theme.borderSecondary }} />
                            </View>

                            {(invites || []).map((invite) => (
                                <TourInviteCard
                                    key={invite.id}
                                    invite={invite}
                                    processingId={processingId}
                                    onAccept={acceptInvite}
                                    onDecline={declineInvite}
                                />
                            ))}
                        </Animated.View>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>

            <AppModal
                visible={error === t('tourNotFound')}
                onClose={() => setError(null)}
                title={t('tourNotFound') || "Tour Not Found"}
                alignment="center"
            >
                <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                    <TextComponent color={theme.textSecondary} center style={{ marginBottom: 20 }}>
                        {t('noToursFoundDesc') || "The tour code you entered does not exist or has expired. Please check the code and try again."}
                    </TextComponent>
                    <AnimatedButton
                        title="OK"
                        onPress={() => setError(null)}
                        variant="primary"
                        style={{ width: '100%' }}
                    />
                </View>
            </AppModal>

            <AppModal
                visible={expiredModalVisible}
                onClose={() => setExpiredModalVisible(false)}
                title={"Invitation Expired"}
                alignment="center"
            >
                <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                    <TextComponent color={theme.textSecondary} center style={{ marginBottom: 20 }}>
                        {"This invitation has expired. The tour may have already finished or been cancelled."}
                    </TextComponent>
                    <AnimatedButton
                        title="OK"
                        onPress={() => setExpiredModalVisible(false)}
                        variant="primary"
                        style={{ width: '100%' }}
                    />
                </View>
            </AppModal>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        alignItems: 'center',
    },
    heroContainer: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
    },
    heroCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    floatingIcon: {
        position: 'absolute',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        maxWidth: '80%',
        lineHeight: 24,
    },

    // Code Input
    codeInputContainer: {
        width: '100%',
        height: 72,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    hiddenInput: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        // opacity: 0, // Removed, handled by color: transparent
        zIndex: 100, // Increased zIndex
    },
    placeholderText: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: 4,
        opacity: 0.3,
        position: 'absolute',
    },
    inputText: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: 4,
    },
    errorText: {
        marginTop: 12,
        fontSize: 14,
        fontWeight: '600',
        alignSelf: 'flex-start',
        marginLeft: 8,
    },

    // Invites
    sectionDividerText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        paddingHorizontal: 16,
    },
});

