import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { ScreenHeader } from '../components/common/ScreenHeader';
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
            <ScreenHeader
                title={t('teamSetup')}
                showBackButton={true}
                /* onBackPress removed to use default safe navigation from ScreenHeader */
                style={{ paddingHorizontal: 0 }} // Match original padding if needed, or stick to default
            />

            <ScrollView contentContainerStyle={styles.content}>
                <TextComponent style={styles.subText} color={theme.textSecondary} variant="body" center>
                    {t('customizeTeam')}
                </TextComponent>

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
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { padding: 24 },
    subText: { textAlign: 'center', marginBottom: 20 },
    backLink: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    footer: { padding: 24, borderTopWidth: 1 },
    createButton: {
        width: '100%',
    },
    // Removed createButtonText as it's handled by AnimatedButton
});
