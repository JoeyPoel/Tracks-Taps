
import { TextComponent } from '@/src/components/common/TextComponent';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Challenge, ChallengeType, Team } from '@/src/types/models';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

interface BingoCardProps {
    team: Team;
    challenges: Challenge[]; // All tour challenges to lookup details
    onChallengePress: (challenge: Challenge) => void;
}

const { width } = Dimensions.get('window');
const GAP = 8;
const SCREEN_PADDING = 40; // Padding from ActiveTourScreen parent (20 * 2)

// Calculate cell size based on screen width minus parent padding and gaps
const CELL_SIZE = Math.floor((width - SCREEN_PADDING - (GAP * 2)) / 3);

export function BingoCard({ team, challenges, onChallengePress }: BingoCardProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const bingoCard = team.bingoCard;

    if (!bingoCard) {
        return (
            <View style={styles.emptyContainer}>
                <TextComponent>{t('noBingoCardFound')}</TextComponent>
            </View>
        );
    }

    // Helper to get challenge details
    const getChallenge = (id: number) => challenges.find(c => c.id === id);

    // Helper to check if a cell is completed
    const isCompleted = (challengeId: number) => {
        return team.activeChallenges?.some(ac => ac.challengeId === challengeId && ac.completed);
    };

    const isFailed = (challengeId: number) => {
        return team.activeChallenges?.some(ac => ac.challengeId === challengeId && ac.failed);
    };

    const getIcon = (type: ChallengeType) => {
        switch (type) {
            case ChallengeType.LOCATION: return 'location';
            case ChallengeType.TRIVIA: return 'help';
            case ChallengeType.PICTURE: return 'camera';
            case ChallengeType.TRUE_FALSE: return 'checkmark-circle';
            case ChallengeType.DARE: return 'flash';
            case ChallengeType.RIDDLE: return 'bulb';
            default: return 'trophy';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TextComponent variant="h3" bold>{t('bingoCardTitle')}</TextComponent>
                <View style={[styles.badge, { backgroundColor: theme.accent }]}>
                    <TextComponent variant="caption" color="#FFF" bold>
                        {bingoCard.fullHouseAwarded ? t('fullHouse') : `${bingoCard.awardedLines.length} ${t('lines')}`}
                    </TextComponent>
                </View>
            </View>

            <View style={styles.grid}>
                {bingoCard.cells.sort((a, b) => (a.row * 3 + a.col) - (b.row * 3 + b.col)).map((cell, index) => {
                    const challenge = getChallenge(cell.challengeId);
                    const completed = isCompleted(cell.challengeId);
                    const failed = isFailed(cell.challengeId);

                    if (!challenge) return <View key={cell.id} style={[styles.cell, { width: CELL_SIZE, height: CELL_SIZE }]} />;

                    let bgColor = theme.bgSecondary;
                    let borderColor = theme.borderPrimary;
                    let iconColor = theme.textSecondary;
                    let textColor = theme.textPrimary;

                    if (completed) {
                        bgColor = theme.bgSuccess;
                        borderColor = theme.success;
                        iconColor = theme.success;
                        textColor = theme.success;
                    } else if (failed) {
                        bgColor = theme.challengeFailedBackground;
                        borderColor = theme.danger;
                        iconColor = theme.danger;
                        textColor = theme.danger;
                    }

                    return (
                        <TouchableOpacity
                            key={cell.id}
                            activeOpacity={0.8}
                            onPress={() => onChallengePress(challenge)}
                        >
                            <Animated.View
                                entering={FadeIn.delay(index * 50)}
                                style={[
                                    styles.cell,
                                    {
                                        width: CELL_SIZE,
                                        height: CELL_SIZE,
                                        backgroundColor: bgColor,
                                        borderColor: borderColor
                                    }
                                ]}
                            >
                                <Ionicons
                                    name={getIcon(challenge.type) as any}
                                    size={24}
                                    color={iconColor}
                                />
                                <TextComponent
                                    variant="caption"
                                    numberOfLines={2}
                                    style={{ marginTop: 4, textAlign: 'center' }}
                                    color={textColor}
                                >
                                    {challenge.title}
                                </TextComponent>

                                {completed && (
                                    <Animated.View entering={ZoomIn} style={styles.check}>
                                        <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                                    </Animated.View>
                                )}
                                {failed && (
                                    <Animated.View entering={ZoomIn} style={styles.check}>
                                        <Ionicons name="close-circle" size={16} color={theme.danger} />
                                    </Animated.View>
                                )}
                            </Animated.View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // Padding is handled by parent ScrollView
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP,
    },
    cell: {
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
    },
    check: {
        position: 'absolute',
        top: 4,
        right: 4,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center'
    }
});
