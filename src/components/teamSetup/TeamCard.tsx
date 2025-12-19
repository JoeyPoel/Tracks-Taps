import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { GenericCard } from '../common/GenericCard';

interface TeamCardProps {
    name: string;
    color: string;
    emoji: string;
}

export const TeamCard: React.FC<TeamCardProps> = ({ name, color, emoji }) => {
    const { theme } = useTheme();
    const { t } = useLanguage(); // Ensure you use 't' if needed, or remove if unused. kept for consistency.

    return (
        <GenericCard
            style={[styles.teamCard, { backgroundColor: theme.bgPrimary, borderColor: color }]}
            variant="outlined"
            padding="medium"
        >
            <View style={styles.teamHeader}>
                <Text style={{ fontSize: 32, marginRight: 16 }}>{emoji}</Text>
                <View>
                    <Text style={[styles.name, { color: theme.textPrimary, fontSize: 18, fontWeight: 'bold' }]}>
                        {name || t('yourTeamName')}
                    </Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '600' }}>
                        {t('ready') || 'Ready to join!'}
                    </Text>
                </View>
            </View>
        </GenericCard>
    );
};

const styles = StyleSheet.create({
    teamCard: {
        borderRadius: 16,
        paddingHorizontal: 16,
        marginTop: 16,
        borderWidth: 1,
        width: '100%', // Ensure full width
    },
    teamHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
});
