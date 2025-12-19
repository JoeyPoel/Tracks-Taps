import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { ColorSelector } from '../components/teamSetup/ColorSelector';
import { EmojiSelector } from '../components/teamSetup/EmojiSelector';
import { TeamCard } from '../components/teamSetup/TeamCard';
import { TeamNameInput } from '../components/teamSetup/TeamNameInput';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useTeamSetup } from '../hooks/useTeamSetup';

export default function TeamSetupScreen() {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();

    const {
        teamName,
        setTeamName,
        selectedColor,
        setSelectedColor,
        selectedEmoji,
        setSelectedEmoji,
        loading,
        handleCreateTeam
    } = useTeamSetup();

    return (
        <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} animateEntry={false}>
            <View style={[styles.header, { borderBottomColor: theme.borderPrimary }]}>
                <AnimatedPressable
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace('/');
                        }
                    }}
                    style={styles.closeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    interactionScale="subtle"
                >
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </AnimatedPressable>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t('teamSetup')}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.subText, { color: theme.textSecondary }]}>
                    {t('customizeTeam')}
                </Text>

                <TeamNameInput value={teamName} onChange={setTeamName} />

                <ColorSelector selectedColor={selectedColor} onSelect={setSelectedColor} />

                <EmojiSelector selectedEmoji={selectedEmoji} onSelect={setSelectedEmoji} />

                <TeamCard name={teamName} color={selectedColor} emoji={selectedEmoji} />

            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.borderPrimary, backgroundColor: theme.bgPrimary }]}>
                <AnimatedButton
                    title={loading ? t('creating') : t('saveTeam')}
                    onPress={() => handleCreateTeam(false)}
                    loading={loading}
                    disabled={loading}
                    variant="primary"
                    style={styles.createButton}
                />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    closeButton: {},
    content: { padding: 24 },
    subText: { textAlign: 'center', marginBottom: 20 },
    backLink: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    footer: { padding: 24, borderTopWidth: 1 },
    createButton: {
        width: '100%',
    },
    // Removed createButtonText as it's handled by AnimatedButton
});
