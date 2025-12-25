import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Team } from '../../types/models';

interface PodiumProps {
    teams: Team[];
}

export default function Podium({ teams }: PodiumProps) {
    const { theme } = useTheme();

    const sortedTeams = [...teams].sort((a, b) => (b.score || 0) - (a.score || 0));

    const first = sortedTeams[0];
    const second = sortedTeams.length > 1 ? sortedTeams[1] : null;
    const third = sortedTeams.length > 2 ? sortedTeams[2] : null;

    const renderPodiumStep = (team: Team | null, place: number) => {
        if (!team) return <View style={styles.emptyStep} />;

        let barHeight = 100;

        if (place === 1) {
            barHeight = 160;
        } else if (place === 2) {
            barHeight = 130;
        } else if (place === 3) {
            barHeight = 100;
        }

        const displayName = team.name || team.user?.name;

        // Use team color with opacity for the bar
        // Need to parse hex to rgba or just opacity style if color is hex
        // Assuming team.color is a hex string like #RRGGBB

        // Simple hex to transparent helper
        const hexToRgba = (hex: string, alpha: number) => {
            let c: any;
            if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                c = hex.substring(1).split('');
                if (c.length == 3) {
                    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
                }
                c = '0x' + c.join('');
                return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
            }
            return hex; // Fallback
        }

        const teamColor = team.color || theme.primary;
        const barBackgroundColor = hexToRgba(teamColor, 0.3);

        return (
            <View style={styles.stepContainer}>

                <View style={[styles.teamInfo, place === 1 && { marginBottom: 36 }]}>
                    <Text style={[styles.teamName, { color: theme.textPrimary }]} numberOfLines={1}>
                        {displayName}
                    </Text>
                    <Text style={[styles.score, { color: teamColor }]}>
                        {team.score}
                    </Text>
                </View>

                <View style={[styles.bar, { height: barHeight, backgroundColor: barBackgroundColor }]}>
                    {/* Crown for 1st place */}
                    {place === 1 && (
                        <View style={styles.crownContainer}>
                            <Text style={styles.crownEmoji}>{'👑'}</Text>
                        </View>
                    )}

                    {/* Rank Number */}
                    <Text style={[styles.rankNumber, { color: '#FFFFFF' }]}>{place}</Text>

                    {/* Team Emoji Inside the Pillar */}
                    <View style={styles.emojiContainer}>
                        <Text style={styles.emoji}>{team.emoji || '👤'}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Final Rankings</Text>
            <View style={styles.podiumWrapper}>
                {renderPodiumStep(second, 2)}
                {renderPodiumStep(first, 1)}
                {renderPodiumStep(third, 3)}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 24,
        width: '100%',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    podiumWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 12,
        width: '100%',
    },
    stepContainer: {
        alignItems: 'center',
        width: 90,
        flex: 1,
        maxWidth: 110,
    },
    emptyStep: {
        width: 90,
        flex: 1,
        maxWidth: 110,
    },
    teamInfo: {
        alignItems: 'center',
        marginBottom: 8,
        justifyContent: 'flex-end',
    },
    teamName: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 2,
    },
    score: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    bar: {
        width: '100%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 16,
        position: 'relative',
        justifyContent: 'space-between',
    },
    rankNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        zIndex: 2,
    },
    crownContainer: {
        position: 'absolute',
        top: -45,
        width: '100%',
        alignItems: 'center',
    },
    crownEmoji: {
        fontSize: 32,
    },
    emojiContainer: {
        opacity: 0.9,
    },
    emoji: {
        fontSize: 32,
    },
});
