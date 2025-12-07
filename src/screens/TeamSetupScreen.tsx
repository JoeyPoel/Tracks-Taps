import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ColorSelector } from '../components/teamSetup/ColorSelector';
import { EmojiSelector } from '../components/teamSetup/EmojiSelector';
import { TeamNameInput } from '../components/teamSetup/TeamNameInput';
import { TeamPreview } from '../components/teamSetup/TeamPreview';
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
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
            <View style={[styles.header, { borderBottomColor: theme.borderPrimary }]}>
                <TouchableOpacity
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace('/');
                        }
                    }}
                    style={styles.closeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="close" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t('teamSetup')}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.subText, { color: theme.textSecondary }]}>
                    {t('customizeTeam')}
                </Text>

                <TouchableOpacity
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace('/');
                        }
                    }}
                    style={styles.backLink}
                >
                    <Ionicons name="arrow-back" size={16} color={theme.textSecondary} />
                    <Text style={{ color: theme.textSecondary, marginLeft: 4 }}>{t('back')}</Text>
                </TouchableOpacity>

                <TeamNameInput value={teamName} onChange={setTeamName} />

                <ColorSelector selectedColor={selectedColor} onSelect={setSelectedColor} />

                <EmojiSelector selectedEmoji={selectedEmoji} onSelect={setSelectedEmoji} />

                <TeamPreview name={teamName} color={selectedColor} emoji={selectedEmoji} />

            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.borderPrimary, backgroundColor: theme.bgPrimary }]}>
                <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
                    onPress={() => handleCreateTeam(false)}
                    disabled={loading}
                >
                    <Text style={styles.createButtonText}>
                        {loading ? t('creating') : t('createTeam')}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
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
    content: { padding: 20 },
    subText: { textAlign: 'center', marginBottom: 20 },
    backLink: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    footer: { padding: 16, borderTopWidth: 1 },
    createButton: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    createButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
