import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Team } from '../../types/models';
import { getPubGolfStats } from '../../utils/pubGolfUtils';

interface PodiumProps {
    teams: Team[];
    visibleRanks?: number[]; // [1, 2, 3] to show all, [] to show none
    isPubGolf?: boolean;
    stops?: any[];
}

const PodiumBar = ({
    team,
    place,
    isVisible,
    isPubGolf,
    stops
}: {
    team: Team | null,
    place: number,
    isVisible: boolean,
    isPubGolf?: boolean,
    stops?: any[]
}) => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const height = useSharedValue(0);
    const opacity = useSharedValue(0);

    // Target heights for each place
    const targetHeight = place === 1 ? 180 : place === 2 ? 140 : 110;

    useEffect(() => {
        if (isVisible) {
            height.value = withSpring(targetHeight, { damping: 12, stiffness: 90 });
            opacity.value = withSpring(1);
        } else {
            height.value = 0;
            opacity.value = 0;
        }
    }, [isVisible]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            height: height.value,
            opacity: opacity.value,
        };
    });

    if (!team) return <View style={styles.emptyStep} />;

    const displayName = team.name || team.user?.name || t('unknown');
    const teamColor = team.color || theme.primary;

    // Helper for Hex to RGBA
    const hexToRgba = (hex: string, alpha: number) => {
        let c: any;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length === 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
        }
        return hex; // Fallback
    };

    const barColor = hexToRgba(teamColor, 0.25);
    const borderColor = hexToRgba(teamColor, 0.6);

    let pgText = '';
    if (isPubGolf) {
        const stats = getPubGolfStats(stops, team.pubGolfStops);
        const score = stats.currentScore;
        pgText = score === 0 ? ' (E PG)' : score > 0 ? ` (+${score} PG)` : ` (${score} PG)`;
    }

    return (
        <View style={styles.stepContainer}>
            {/* Info floats above the bar */}
            <Animated.View style={[styles.teamInfo, animatedStyle, { height: undefined, minHeight: 60, marginBottom: 8 }]}>
                <TextComponent style={styles.teamName} color={theme.textPrimary} bold variant="caption" numberOfLines={1}>
                    {displayName}
                </TextComponent>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.scoreBadge, { backgroundColor: theme.bgSecondary }]}>
                        <TextComponent style={styles.score} color={teamColor} bold variant="caption">
                            {team.score}
                        </TextComponent>
                    </View>
                    {isPubGolf && (
                        <TextComponent style={[styles.score, { color: theme.textSecondary, marginLeft: 4 }]} bold variant="caption">
                            {pgText}
                        </TextComponent>
                    )}
                </View>
            </Animated.View>

            <Animated.View style={[
                styles.bar,
                animatedStyle,
                {
                    backgroundColor: barColor,
                    borderColor: borderColor,
                }
            ]}>
                {/* Crown for 1st place */}
                {place === 1 && (
                    <View style={styles.crownContainer}>
                        <Ionicons name="trophy" size={32} color="#FFD700" />
                    </View>
                )}

                {/* Rank Number */}
                <TextComponent style={styles.rankNumber} color={place === 1 ? '#FFD700' : theme.textSecondary} bold variant="h1">
                    {place}
                </TextComponent>

                {/* Team Emoji Inside the Pillar */}
                <View style={[styles.emojiContainer]}>
                    <TextComponent style={styles.emoji}>{team.emoji || '👤'}</TextComponent>
                </View>
            </Animated.View>
        </View>
    );
};

export default function Podium({ teams, visibleRanks = [1, 2, 3], isPubGolf, stops }: PodiumProps) {
    const sortedTeams = [...teams].sort((a, b) => (b.score || 0) - (a.score || 0));

    const first = sortedTeams[0];
    const second = sortedTeams.length > 1 ? sortedTeams[1] : null;
    const third = sortedTeams.length > 2 ? sortedTeams[2] : null;

    return (
        <View style={styles.container}>
            <View style={styles.podiumWrapper}>
                <PodiumBar team={second} place={2} isVisible={visibleRanks.includes(2)} isPubGolf={isPubGolf} stops={stops} />
                <PodiumBar team={first} place={1} isVisible={visibleRanks.includes(1)} isPubGolf={isPubGolf} stops={stops} />
                <PodiumBar team={third} place={3} isVisible={visibleRanks.includes(3)} isPubGolf={isPubGolf} stops={stops} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 10,
        width: '100%',
        height: 280, // Fixed height to prevent layout jumps
        justifyContent: 'flex-end',
    },
    podiumWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 12,
        width: '100%',
        paddingHorizontal: 10,
    },
    stepContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
    },
    emptyStep: {
        flex: 1,
    },
    teamInfo: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
    },
    teamName: {
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 4,
    },
    scoreBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    score: {
        fontSize: 12,
        fontWeight: '800',
    },
    bar: {
        width: '100%',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderWidth: 1,
        borderBottomWidth: 0,
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 12,
        position: 'relative',
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    rankNumber: {
        fontSize: 24,
        fontWeight: '900',
        opacity: 0.8,
    },
    crownContainer: {
        position: 'absolute',
        top: -40,
        width: '100%',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    emojiContainer: {
        opacity: 0.9,
    },
    emoji: {
        fontSize: 28,
    },
});
