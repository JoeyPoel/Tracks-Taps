import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/TranslationContext';
import { Stop } from '../../types/models';
import { GenericCard } from '../common/GenericCard';
import { TextComponent } from '../common/TextComponent';

export default function StopCard({ stop }: { stop: Stop }) {
    const { theme } = useTheme();
    const { t, language } = useLanguage();
    const { translateText, isAutoTranslateEnabled } = useTranslation();

    const originalDescription = stop.description || t('completeAllChallengesToContinue') || '';
    const displayedDescription = translateText(originalDescription);

    return (
        <GenericCard
            variant="gradient"
            gradientColors={[`${theme.fixedGradientFrom}22`, `${theme.fixedGradientTo}22`]}
            style={[styles.container, { borderColor: theme.secondary, borderWidth: 1 }]}
        >
            <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <TextComponent style={[styles.headerTitle, { flex: 1, marginRight: 8 }]} color={theme.textPrimary} bold variant="h3">
                        {`${t('Stop')} ${stop.number}: ${stop.name}`}
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
