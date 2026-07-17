import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/TranslationContext';
import { Stop } from '../../types/models';
import { GenericCard } from '../common/GenericCard';
import { TextComponent } from '../common/TextComponent';
import { useStore } from '../../store/store';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

interface StopCardProps {
    stop: Stop;
    pubNumber?: number;
}

export default function StopCard({ stop, pubNumber }: StopCardProps) {
    const { theme } = useTheme();
    const { t, language } = useLanguage();
    const { translateText, isAutoTranslateEnabled, forceTranslate } = useTranslation();
    const showSpeakButtons = useStore(state => state.showSpeakButtons);
    const { speak } = useTextToSpeech();

    const originalDescription = stop.description || t('completeAllChallengesToContinue') || '';
    const displayedDescription = translateText(originalDescription);

    const isPubGolf = pubNumber !== undefined;
    const gradientColors = (isPubGolf
        ? [`${theme.warning}22`, `${theme.warning}11`]
        : [`${theme.fixedGradientFrom}22`, `${theme.fixedGradientTo}22`]) as [string, string];

    const borderColor = isPubGolf ? theme.warning : theme.secondary;

    const handleSpeak = async () => {
        let nameVal = stop.name;
        let descVal = originalDescription;
        if (isAutoTranslateEnabled) {
            if (nameVal && translateText(nameVal) === nameVal) {
                await forceTranslate(nameVal);
            }
            if (descVal && translateText(descVal) === descVal) {
                await forceTranslate(descVal);
            }
            nameVal = translateText(nameVal);
            descVal = translateText(descVal);
        }
        const speechText = isPubGolf
            ? `${t('Stop')} ${stop.number}, Pub ${pubNumber}: ${nameVal}. ${descVal}`
            : `${t('Stop')} ${stop.number}: ${nameVal}. ${descVal}`;
        speak(speechText, true);
    };

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
                    {showSpeakButtons && (
                        <TouchableOpacity
                            onPress={handleSpeak}
                            style={{ padding: 4 }}
                            accessibilityLabel="Read stop details aloud"
                            accessibilityRole="button"
                        >
                            <Ionicons name="volume-medium-outline" size={20} color={theme.primary} />
                        </TouchableOpacity>
                    )}
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
