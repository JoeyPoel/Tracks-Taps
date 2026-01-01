import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MapPinIcon, TicketIcon, UserGroupIcon } from 'react-native-heroicons/solid'; // Changed imports
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useInvites } from '../hooks/useInvites';
import { useJoinTour } from '../hooks/useJoinTour';

export default function JoinTourScreen() {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();
    const {
        tourCode,
        setTourCode,
        loading: joining,
        error,
        setError,
        handleJoinTour
    } = useJoinTour();

    const { invites, loading: loadingInvites, acceptInvite, declineInvite, processingId } = useInvites();

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
                        title={t('joinTourButton')}
                        showBackButton
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

                        <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
                            {t('readyForAdventure') || "Ready for Adventure?"}
                        </Text>
                        <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
                            {t('enterCodeInstruction') || "Enter the code shared by your team captain to join the tour."}
                        </Text>
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
                                autoFocus={true}
                                caretHidden={true}
                                cursorColor="transparent" // Android-specific to hide cursor
                                selectionColor="transparent" // Hide selection
                            />

                            {/* Visual Placeholder if empty */}
                            {!tourCode && (
                                <Text style={[styles.placeholderText, { color: theme.textTertiary }]}>
                                    000 000 000
                                </Text>
                            )}
                            {/* Real Text Overlay */}
                            <Text style={[styles.inputText, { color: theme.textPrimary }]}>
                                {tourCode}
                            </Text>

                        </View>

                        {error && (
                            <Animated.Text entering={FadeInUp} style={[styles.errorText, { color: theme.danger }]}>
                                {error}
                            </Animated.Text>
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
                    {invites.length > 0 && (
                        <Animated.View entering={FadeInUp.delay(300).springify()} style={{ marginTop: 48, width: '100%' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                <View style={{ height: 1, flex: 1, backgroundColor: theme.borderSecondary }} />
                                <Text style={[styles.sectionDividerText, { color: theme.textSecondary, backgroundColor: theme.bgPrimary }]}>
                                    {t('orAcceptInvite') || "OR ACCEPT INVITE"}
                                </Text>
                                <View style={{ height: 1, flex: 1, backgroundColor: theme.borderSecondary }} />
                            </View>

                            {invites.map((invite) => (
                                <View key={invite.id} style={[styles.inviteCard, { backgroundColor: theme.bgSecondary }]}>
                                    <View style={[styles.inviteIcon, { backgroundColor: theme.primary + '20' }]}>
                                        <TicketIcon size={24} color={theme.primary} />
                                    </View>

                                    <View style={styles.inviteInfo}>
                                        <Text style={[styles.inviteTourName, { color: theme.textPrimary }]} numberOfLines={1}>
                                            {invite.parsedData?.tourName || "Unknown Tour"}
                                        </Text>
                                        <Text style={[styles.inviteFrom, { color: theme.textSecondary }]} numberOfLines={1}>
                                            {t('invitedBy') || "Invited by"} {invite.parsedData?.inviterName || "a friend"}
                                        </Text>
                                    </View>

                                    <View style={styles.inviteActions}>
                                        {processingId === invite.id ? (
                                            <ActivityIndicator color={theme.primary} />
                                        ) : (
                                            <>
                                                <TouchableOpacity
                                                    onPress={() => declineInvite(invite.id)}
                                                    style={[styles.actionButton, { backgroundColor: theme.bgTertiary, marginRight: 8 }]}
                                                >
                                                    <Ionicons name="close" size={20} color={theme.textSecondary} />
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    onPress={() => acceptInvite(invite.id)}
                                                    style={[styles.actionButton, { backgroundColor: theme.primary }]}
                                                >
                                                    <Ionicons name="checkmark" size={20} color="#FFF" />
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </Animated.View>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>
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
    inviteCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 12,
    },
    inviteIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    inviteInfo: {
        flex: 1,
        marginRight: 12,
    },
    inviteTourName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    inviteFrom: {
        fontSize: 13,
        fontWeight: '500',
    },
    inviteActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

