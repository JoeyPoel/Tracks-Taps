import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface TeamCardProps {
    name: string;
    color: string;
    emoji: string;
}

export const TeamCard: React.FC<TeamCardProps> = ({ name, color, emoji }) => {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View
            style={[
                styles.playerRow,
                {
                    backgroundColor: theme.bgSecondary,
                    borderColor: color || theme.borderPrimary,
                    borderWidth: color ? 2 : 1
                }
            ]}
        >
            <LinearGradient
                colors={color ? [theme.bgTertiary, color + '40'] : [theme.bgTertiary, theme.bgTertiary]}
                style={[styles.avatarContainer, color ? { borderColor: color, borderWidth: 1 } : null]}
            >
                <TextComponent style={styles.avatarEmoji} size={26}>{emoji || "👤"}</TextComponent>
            </LinearGradient>

            <View style={styles.playerInfo}>
                <TextComponent style={styles.playerName} color={color || theme.textPrimary} bold variant="body">
                    {name || t('yourTeamName')}
                </TextComponent>
                <TextComponent style={styles.playerRole} color={theme.textSecondary} variant="caption">
                    {t('ready')}
                </TextComponent>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 0,
        marginTop: 16,
        width: '100%',
    },
    avatarContainer: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarEmoji: {
        fontSize: 26,
        lineHeight: 32,
    },
    playerInfo: {
        flex: 1,
    },
    playerName: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 2,
    },
    playerRole: {
        fontSize: 13,
        fontWeight: '500',
    },
});
