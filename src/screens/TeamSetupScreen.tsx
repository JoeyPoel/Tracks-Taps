import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
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
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useStore } from '../store/store';


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

    const { speak, stop, isSpeaking } = useTextToSpeech();
    const narrationMode = useStore(state => state.narrationMode);
    const showSpeakButtons = useStore(state => state.showSpeakButtons);
    const isFocused = useIsFocused();

    const buildNarration = () =>
        `${t('teamSetup')}. ${t('narrationTeamSetupDesc')} ` +
        `${t('teamName')} — ${t('narrationCurrentName')}: ${teamName || t('narrationNotSet')}. ` +
        `${t('teamColor')} — ${t('narrationCurrentColor')}: ${selectedColor || t('narrationNotSelected')}. ` +
        `${t('teamEmoji')} — ${t('narrationCurrentEmoji')}: ${selectedEmoji || t('narrationNotSelected')}. ` +
        `${t('narrationTapSaveTeamToJoin')}`;

    useEffect(() => {
        if (isFocused && narrationMode === 'full') {
            speak(buildNarration());
        }
        return () => { stop(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocused, narrationMode]);

    return (
        <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={false} animateEntry={false}>
            <ScreenHeader
                title={t('teamSetup')}
                showBackButton={true}
                style={{ paddingBottom: 16, marginBottom: 0 }}
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
    content: { padding: 20 },
    subText: { textAlign: 'center', marginBottom: 20 },
    backLink: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    footer: { padding: 24, borderTopWidth: 1 },
    createButton: {
        width: '100%',
    },
    // Removed createButtonText as it's handled by AnimatedButton
});
