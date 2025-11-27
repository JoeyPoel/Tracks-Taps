import { Stop } from '@prisma/client';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';


export default function StopCard({ stop }: { stop: Stop }) {
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
            <View>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                    {`${t('Stop')} ${stop.id}: ${stop.name}`}
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    {t('completeAllChallengesToContinue')}
                </Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 24,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
    },
});
