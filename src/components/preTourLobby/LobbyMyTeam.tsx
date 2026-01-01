import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { TeamCard } from '../../components/teamSetup/TeamCard';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface LobbyMyTeamProps {
    userTeam: any;
    activeTourId: number;
}

export const LobbyMyTeam: React.FC<LobbyMyTeamProps> = ({ userTeam, activeTourId }) => {
    const { theme } = useTheme();
    const router = useRouter();
    const { t } = useLanguage();

    if (!userTeam) return null;

    return (
        <Animated.View entering={FadeInUp.delay(250).springify()} style={{ marginBottom: 24 }}>
            <TextComponent style={styles.sectionLabel} color={theme.textSecondary} bold variant="label">
                {t('myTeam')}
            </TextComponent>
            <TouchableOpacity onPress={() => router.push({
                pathname: '/team-setup',
                params: {
                    activeTourId,
                    mode: 'update',
                    currentName: userTeam?.name,
                    currentColor: userTeam?.color,
                    currentEmoji: userTeam?.emoji
                }
            })}>
                <TeamCard
                    name={userTeam.name}
                    color={userTeam.color}
                    emoji={userTeam.emoji}
                />
                <View style={styles.editBadge}>
                    <Ionicons name="pencil" size={12} color="#FFF" />
                    <TextComponent style={styles.editBadgeText} color="#FFF" bold variant="caption">
                        {t('edit').toUpperCase()}
                    </TextComponent>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    sectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 1.5,
        opacity: 0.6,
    },
    editBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#00000080',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    editBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    }
});
