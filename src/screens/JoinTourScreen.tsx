import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
        <ScreenWrapper animateEntry={false} includeTop={false} includeBottom={false}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconButton, { backgroundColor: theme.bgSecondary }]}>
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t('joinTourButton')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* Section 1: Manual Code Entry */}
                    <Animated.View entering={FadeInUp.delay(100).springify()} style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
                        <View style={[styles.iconBadge, { backgroundColor: theme.primary + '20' }]}>
                            <Ionicons name="keypad" size={24} color={theme.primary} />
                        </View>
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('enterTourCode')}</Text>
                        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>{t('getItFromHost')}</Text>

                        <TextInput
                            style={[
                                styles.input,
                                {
                                    borderColor: error ? theme.danger : theme.borderPrimary,
                                    color: theme.textPrimary,
                                    backgroundColor: theme.bgPrimary
                                }
                            ]}
                            placeholder="123 456"
                            placeholderTextColor={theme.textSecondary}
                            value={tourCode}
                            onChangeText={(text) => {
                                setTourCode(text);
                                setError(null);
                            }}
                            keyboardType="number-pad"
                            maxLength={9}
                        />
                        {error && <Text style={[styles.errorText, { color: theme.warning }]}>{error}</Text>}

                        <AnimatedButton
                            title={joining ? t('verifying') : t('joinTourButton')}
                            onPress={handleJoinTour}
                            loading={joining}
                            disabled={joining || !tourCode}
                            variant="primary"
                            style={{ marginTop: 16, width: '100%' }}
                        />
                    </Animated.View>

                    {/* Section 2: Pending Invites */}
                    {invites.length > 0 && (
                        <Animated.View entering={FadeInUp.delay(200).springify()} style={{ marginTop: 24 }}>
                            <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>PENDING INVITES</Text>

                            {invites.map((invite) => (
                                <View key={invite.id} style={[styles.inviteCard, { backgroundColor: theme.bgSecondary }]}>
                                    <View style={styles.inviteInfo}>
                                        <Text style={[styles.inviteTourName, { color: theme.textPrimary }]}>
                                            {invite.parsedData?.tourName || "Unknown Tour"}
                                        </Text>
                                        <Text style={[styles.inviteFrom, { color: theme.textSecondary }]}>
                                            Invited by {invite.parsedData?.inviterName || "a friend"}
                                        </Text>
                                    </View>

                                    <View style={styles.inviteActions}>
                                        {processingId === invite.id ? (
                                            <ActivityIndicator color={theme.primary} />
                                        ) : (
                                            <>
                                                <TouchableOpacity
                                                    onPress={() => declineInvite(invite.id)}
                                                    style={[styles.actionButton, { backgroundColor: theme.bgPrimary, marginRight: 8 }]}
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

                    {/* Section 3: Info (Simplified) */}
                    <Animated.View entering={FadeInDown.delay(400)} style={{ marginTop: 32, alignItems: 'center' }}>
                        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                            Ask your friend for the numeric code visible in their lobby.
                        </Text>
                    </Animated.View>

                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    card: {
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    iconBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        height: 60,
        borderRadius: 12,
        borderWidth: 1,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    errorText: {
        marginTop: 8,
        fontSize: 14,
        alignSelf: 'flex-start',
    },

    // Invites
    sectionHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 1,
    },
    inviteCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    inviteInfo: {
        flex: 1,
    },
    inviteTourName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    inviteFrom: {
        fontSize: 13,
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

