import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PuzzlePieceIcon, TrophyIcon } from 'react-native-heroicons/outline';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface TourGameModesProps {
    modes: string[];
    challengesCount: number;
    stopsCount: number;
}

export default function TourGameModes({ modes, challengesCount, stopsCount }: TourGameModesProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <LinearGradient
            colors={[
                `${theme.fixedGradientFrom}22`,
                `${theme.fixedGradientTo}22`
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.container, { borderColor: theme.secondary }]}
        >

            <View style={styles.headerRow}>
                <PuzzlePieceIcon size={20} color={theme.primary} />
                <TextComponent style={styles.headerTitle} color={theme.textPrimary} bold variant="body">{t('gameModes')}</TextComponent>
            </View>

            <View style={styles.tagsRow}>
                {modes.map((mode, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: theme.secondary }]}>
                        <TextComponent style={styles.tagText} color={theme.textPrimary} bold variant="caption">{mode}</TextComponent>
                    </View>
                ))}
            </View>

            <View style={[styles.headerRow, { marginTop: 16 }]}>
                <TrophyIcon size={20} color={theme.primary} />
                <TextComponent style={styles.headerTitle} color={theme.textPrimary} bold variant="body">{t('challengesIncluded')}</TextComponent>
            </View>

            <TextComponent style={styles.description} color={theme.textSecondary} variant="body">
                {challengesCount} {t('uniqueChallengesAcross')} {stopsCount} {t('stops')}
            </TextComponent>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 24,
        marginTop: 24,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    description: {
        fontSize: 14,
        marginLeft: 28,
    },
});
