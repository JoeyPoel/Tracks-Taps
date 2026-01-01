import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Stop } from '../../types/models';
import { GenericCard } from '../common/GenericCard';
import { TextComponent } from '../common/TextComponent'; // Added import


export default function StopCard({ stop }: { stop: Stop }) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <GenericCard
            variant="gradient"
            gradientColors={[`${theme.fixedGradientFrom}22`, `${theme.fixedGradientTo}22`]}
            style={[styles.container, { borderColor: theme.secondary, borderWidth: 1 }]}
        >
            <View>
                <TextComponent style={styles.headerTitle} color={theme.textPrimary} bold variant="h3">
                    {`${t('Stop')} ${stop.number}: ${stop.name}`}
                </TextComponent>
                <TextComponent style={styles.subtitle} color={theme.textSecondary} variant="body">
                    {stop.description || t('completeAllChallengesToContinue')}
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
