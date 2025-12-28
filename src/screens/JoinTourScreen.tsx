import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyIcon } from 'react-native-heroicons/outline';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedButton } from '../components/common/AnimatedButton';
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
    const insets = useSafeAreaInsets();

    return (
        <ScreenWrapper animateEntry={false} includeTop={true} includeBottom={false}>
            <Stack.Screen options={{ headerShown: false }} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* New Header Style */}
                    <Animated.View entering={FadeInDown.duration(600).springify()} style={[styles.headerContainer, { marginTop: 16, marginBottom: 48 }]}>
                        <Text style={[styles.screenTitle, { color: theme.textPrimary }]}>{t('joinTourButton')}</Text>
                        <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>
                            {t('askCaptainForCode') || 'Ask your team captain for the unique request code'}
                        </Text>
                    </Animated.View>

                    {/* Section 1: Manual Code Entry */}
                    <Animated.View entering={FadeInUp.delay(100).springify()} style={[styles.cleanInputContainer, { backgroundColor: theme.bgSecondary }]}>
                        <View style={styles.inputIcon}>
                            <KeyIcon size={24} color={theme.primary} />
                        </View>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    color: theme.textPrimary,
                                    borderColor: error ? theme.danger : 'transparent',
                                }
                            ]}
                            placeholder="000 000 000" // 9 digits
                            placeholderTextColor={theme.textSecondary + '80'}
                            value={tourCode}
                            onChangeText={(text) => {
                                const cleaned = text.replace(/\D/g, '');
                                const limited = cleaned.slice(0, 9);
                                const formatted = limited.replace(/(\d{3})(?=\d)/g, '$1 ');
                                setTourCode(formatted);
                                setError(null);
                            }}
                            keyboardType="number-pad"
                            maxLength={11} // 9 digits + 2 spaces
                            autoFocus={true}
                        />
                    </Animated.View>
                    {error && <Text style={[styles.errorText, { color: theme.warning }]}>{error}</Text>}

                    <AnimatedButton
                        title={joining ? t('verifying') : t('joinTourButton')}
                        onPress={handleJoinTour}
                        loading={joining}
                        disabled={joining || !tourCode}
                        variant="primary"
                        style={{ marginTop: 24, width: '100%' }}
                    />

                    {/* Section 2: Pending Invites */}
                    {invites.length > 0 && (
                        <Animated.View entering={FadeInUp.delay(200).springify()} style={{ marginTop: 40 }}>
                            <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>{t('pendingInvites') || 'PENDING INVITES'}</Text>

                            {invites.map((invite) => (
                                <View key={invite.id} style={[styles.inviteCard, { backgroundColor: theme.bgSecondary }]}>
                                    <View style={[styles.inviteIcon, { backgroundColor: theme.primary + '20' }]}>
                                        <Text style={{ fontSize: 20 }}>🎫</Text>
                                    </View>

                                    <View style={styles.inviteInfo}>
                                        <Text style={[styles.inviteTourName, { color: theme.textPrimary }]} numberOfLines={1}>
                                            {invite.parsedData?.tourName || "Unknown Tour"}
                                        </Text>
                                        <Text style={[styles.inviteFrom, { color: theme.textSecondary }]} numberOfLines={1}>
                                            From {invite.parsedData?.inviterName || "a friend"}
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
                                                    <Ionicons name="close" size={18} color={theme.textSecondary} />
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    onPress={() => acceptInvite(invite.id)}
                                                    style={[styles.actionButton, { backgroundColor: theme.primary }]}
                                                >
                                                    <Ionicons name="checkmark" size={18} color="#FFF" />
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
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerContainer: {
        marginBottom: 32,
    },
    screenTitle: {
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    screenSubtitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    cleanInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingHorizontal: 20,
        height: 80,
    },
    inputIcon: {
        marginRight: 16,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: 4,
    },
    errorText: {
        marginTop: 12,
        fontSize: 14,
        marginLeft: 8,
    },
    // Invites
    sectionHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 16,
        marginLeft: 4,
        letterSpacing: 1,
    },
    inviteCard: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    inviteIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    inviteInfo: {
        flex: 1,
        marginRight: 8,
    },
    inviteTourName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    inviteFrom: {
        fontSize: 13,
    },
    inviteActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

