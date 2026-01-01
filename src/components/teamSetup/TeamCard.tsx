import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import React from 'react';
import { StyleSheet, View } from 'react-native';
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
                <TextComponent style={{ fontSize: 32, marginRight: 16 }}>{emoji}</TextComponent>
                <View>
                    <TextComponent style={styles.name} color={theme.textPrimary} size={18} bold variant="body">
                        {name || t('yourTeamName')}
                    </TextComponent>
                    <TextComponent style={{ fontSize: 14 }} color={theme.textSecondary} bold variant="caption">
                        {t('ready') || t('readyToJoin')}
                    </TextComponent>
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
