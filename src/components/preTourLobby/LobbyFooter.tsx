import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedButton } from '../../components/common/AnimatedButton';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface LobbyFooterProps {
    activeTour: any;
    user: any;
    userTeam: any;
    onStartTour: () => void;
    activeTourId: number;
}

export const LobbyFooter: React.FC<LobbyFooterProps> = ({ activeTour, user, userTeam, onStartTour, activeTourId }) => {
    const { theme } = useTheme();
    const router = useRouter();
    const { t } = useLanguage();

    const isHost = activeTour?.userId === user?.id;

    return (
        <Animated.View entering={FadeInDown.delay(400)} style={[styles.footer, { backgroundColor: theme.bgSecondary, borderTopColor: theme.borderPrimary }]}>
            {isHost ? (
                <View>
                    <Text style={[styles.hostNote, { color: theme.textSecondary }]}>
                        {!userTeam?.name ? t('setupTeamToStart') : t('everyoneIn')}
                    </Text>
                    <AnimatedButton
                        title={!userTeam?.name ? t('setupTeamFirst') : t('startTour')}
                        onPress={() => {
                            if (!userTeam?.name) {
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                                router.push({
                                    pathname: '/team-setup',
                                    params: {
                                        activeTourId,
                                        mode: 'update',
                                        currentName: userTeam?.name,
                                        currentColor: userTeam?.color,
                                        currentEmoji: userTeam?.emoji
                                    }
                                });
                                return;
                            }
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                            onStartTour();
                        }}
                        icon={!userTeam?.name ? "pencil" : "play" as keyof typeof Ionicons.glyphMap}
                        variant={!userTeam?.name ? "secondary" : "primary"}
                        style={{ width: '100%', shadowColor: theme.primary, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
                    />
                </View >
            ) : (
                <View style={styles.waitingContainer}>
                    <ActivityIndicator size="small" color={theme.primary} />
                    <Text style={[styles.waitingText, { color: theme.textPrimary }]}>{t('waitingForHost')}</Text>
                </View>
            )}
        </Animated.View >
    );
};

const styles = StyleSheet.create({
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 48,
        borderTopWidth: 1,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 10,
    },
    hostNote: {
        textAlign: 'center',
        marginBottom: 16,
        fontSize: 14,
        fontWeight: '500',
        opacity: 0.7,
    },
    waitingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 12,
        borderRadius: 16,
    },
    waitingText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
