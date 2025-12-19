import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export const JoinInfoCards = () => {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View>
            <View style={[styles.infoCard, { backgroundColor: theme.bgSecondaryColor, borderColor: theme.secondary }]}>
                <View style={styles.cardHeader}>
                    <View style={[styles.iconBadge, { backgroundColor: theme.bgSecondaryColor }]}>
                        <Ionicons name="sparkles" size={16} color={theme.secondary} />
                    </View>
                    <Text style={[styles.cardTitle, { color: theme.secondary }]}>{t('howItWorks')}</Text>
                </View>
                <Text style={[styles.cardStep, { color: theme.textSecondary }]}>{t('howItWorksStep1')}</Text>
                <Text style={[styles.cardStep, { color: theme.textSecondary }]}>{t('howItWorksStep2')}</Text>
                <Text style={[styles.cardStep, { color: theme.textSecondary }]}>{t('howItWorksStep3')}</Text>
                <Text style={[styles.cardStep, { color: theme.textSecondary }]}>{t('howItWorksStep4')}</Text>
            </View>

            <View style={[styles.infoCard, { backgroundColor: theme.bgAccentColor, borderColor: theme.accent, marginTop: 16 }]}>
                <View style={styles.cardHeader}>
                    <View style={[styles.iconBadge, { backgroundColor: theme.bgAccentColor }]}>
                        <Ionicons name="people" size={16} color={theme.accent} />
                    </View>
                    <Text style={[styles.cardTitle, { color: theme.accent }]}>{t('teamPlay')}</Text>
                </View>
                <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>{t('teamPlayDesc')}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    infoCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconBadge: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    cardStep: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 14,
        lineHeight: 20,
    },
});
