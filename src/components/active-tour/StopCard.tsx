import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/TranslationContext';
import { Stop } from '../../types/models';
import { GenericCard } from '../common/GenericCard';
import { TextComponent } from '../common/TextComponent';

interface StopCardProps {
    stop: Stop;
    pubNumber?: number;
}

export default function StopCard({ stop, pubNumber }: StopCardProps) {
    const { theme } = useTheme();
    const { t, language } = useLanguage();
    const { translateText, isAutoTranslateEnabled } = useTranslation();

    const originalDescription = stop.description || t('completeAllChallengesToContinue') || '';
    const displayedDescription = translateText(originalDescription);

    const isPubGolf = pubNumber !== undefined;
    const gradientColors = (isPubGolf
        ? [`${theme.warning}22`, `${theme.warning}11`]
        : [`${theme.fixedGradientFrom}22`, `${theme.fixedGradientTo}22`]) as [string, string];

    const borderColor = isPubGolf ? theme.warning : theme.secondary;

    return (
        <GenericCard
            variant="gradient"
            gradientColors={gradientColors}
            style={[styles.container, { borderColor: borderColor, borderWidth: 1 }]}
        >
            <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <TextComponent style={[styles.headerTitle, { flex: 1, marginRight: 8 }]} color={theme.textPrimary} bold variant="h3">
                        {isPubGolf
                            ? `${t('Stop')} ${stop.number} (Pub ${pubNumber}): ${stop.name}`
                            : `${t('Stop')} ${stop.number}: ${stop.name}`}
                    </TextComponent>

                </View>
                <TextComponent style={styles.subtitle} color={theme.textSecondary} variant="body">
                    {displayedDescription}
                </TextComponent>
            </View>
        </GenericCard>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 0,
        marginTop: 8,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 24,
        overflow: 'hidden',
    },
    headerTitle: {
        marginBottom: 6,
    },
    subtitle: {
        lineHeight: 22,
        opacity: 0.8,
    },
});
