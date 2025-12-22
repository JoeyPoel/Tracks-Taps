import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedButton } from '../common/AnimatedButton';

interface PostTourFooterProps {
    userTeam: any;
    handleViewResults: () => void;
}

export default function PostTourFooter({ userTeam, handleViewResults }: PostTourFooterProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={[styles.footerContainer, { backgroundColor: 'transparent', borderTopWidth: 0 }]}>
            <View style={styles.yourTeamSection}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Ionicons name="sparkles" size={16} color={theme.gold} style={{ marginRight: 8 }} />
                    <Text style={[styles.yourTeamLabel, { color: theme.textPrimary }]}>{t('yourTeam')}</Text>
                </View>

                <View style={[styles.yourTeamCard, { backgroundColor: theme.bgSecondary, borderColor: theme.borderSecondary }]}>
                    {userTeam && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.avatar, { backgroundColor: userTeam.color }]}>
                                <Text style={{ fontSize: 20 }}>{userTeam.emoji}</Text>
                            </View>
                            <View style={{ marginLeft: 12 }}>
                                <Text style={[styles.yourTeamName, { color: theme.textPrimary }]}>{userTeam.name}</Text>
                                <Text style={[styles.yourTeamMembers, { color: theme.success }]}>{t('finished')}!</Text>
                            </View>
                        </View>
                    )}
                    <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                </View>
            </View>

            <AnimatedButton
                title={t('viewResults')}
                onPress={handleViewResults}
                icon="chevron-forward"
                variant="primary"
                style={styles.viewResultsButton}
            />

            <Text style={[styles.autoRedirectText, { color: theme.textSecondary }]}>
                {t('autoResults')}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    footerContainer: {
        width: '100%',
        paddingVertical: 10,
    },
    yourTeamSection: {
        marginBottom: 20,
    },
    yourTeamLabel: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    yourTeamCard: {
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    yourTeamName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    yourTeamMembers: {
        fontSize: 12,
    },
    viewResultsButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
    },
    autoRedirectText: {
        fontSize: 12,
        textAlign: 'center',
    },
});
