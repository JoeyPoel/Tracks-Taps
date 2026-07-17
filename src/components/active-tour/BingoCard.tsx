import { TextComponent } from '@/src/components/common/TextComponent';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useAppWidth } from '@/src/hooks/useAppWidth';
import { useTextToSpeech } from '@/src/hooks/useTextToSpeech';
import { useStore } from '@/src/store/store';
import { Challenge, ChallengeType, Team } from '@/src/types/models';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from '../../context/TranslationContext';

interface BingoCardProps {
    team: Team;
    challenges: Challenge[]; // All tour challenges to lookup details
    onChallengePress: (challenge: Challenge) => void;
}

const GAP = 8;
const SCREEN_PADDING = 40; // Padding from ActiveTourScreen parent (20 * 2)

export function BingoCard({ team, challenges, onChallengePress }: BingoCardProps) {
    const appWidth = useAppWidth();
    // Calculate cell size based on screen width minus parent padding and gaps
    const CELL_SIZE = Math.floor((appWidth - SCREEN_PADDING - (GAP * 2)) / 3);

    const { theme } = useTheme();
    const { t } = useLanguage();
    const { translateText, isAutoTranslateEnabled, forceTranslate } = useTranslation();
    const showSpeakButtons = useStore(state => state.showSpeakButtons);
    const { speak, stop, isSpeaking } = useTextToSpeech();
    const bingoCard = team.bingoCard;

    // Helper to check if a cell is completed
    const isCompleted = (challengeId: number) => {
        return team.activeChallenges?.some(ac => ac.challengeId === challengeId && ac.completed) || false;
    };

    const isFailed = (challengeId: number) => {
        return team.activeChallenges?.some(ac => ac.challengeId === challengeId && ac.failed) || false;
    };

    const handleSpeakBingo = async () => {
        if (isSpeaking) {
            stop();
            return;
        }
        let speechText = (t('narrationBingoGridChallenges') || 'Bingo card challenges:') + ' ';

        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const challenge = challenges.find(ch => ch.bingoRow === r && ch.bingoCol === c);
                const rowName = r === 0 ? t('rowTop') : r === 1 ? t('rowMiddle') : t('rowBottom');
                const colName = c === 0 ? t('colLeft') : c === 1 ? t('colCenter') : t('colRight');

                let challengeDesc = t('emptySpace') || 'Empty space';
                let statusText = '';

                if (challenge) {
                    let textToTranslate = challenge.title || challenge.description || '';
                    if (isAutoTranslateEnabled && textToTranslate) {
                        if (translateText(textToTranslate) === textToTranslate) {
                            await forceTranslate(textToTranslate);
                        }
                        challengeDesc = translateText(textToTranslate);
                    } else {
                        challengeDesc = textToTranslate;
                    }

                    const completed = isCompleted(challenge.id);
                    const failed = isFailed(challenge.id);
                    statusText = completed
                        ? `, ${t('completed') || 'Completed'}`
                        : failed
                            ? `, ${t('failed') || 'Failed'}`
                            : `, ${t('incomplete') || 'Incomplete'}`;
                }

                speechText += `${rowName} ${colName}: ${challengeDesc}${statusText}. `;
            }
        }
        speak(speechText, true);
    };

    if (!bingoCard) {
        return (
            <View style={styles.emptyContainer}>
                <TextComponent>{t('noBingoCardFound')}</TextComponent>
            </View>
        );
    }

    const getColor = (type: ChallengeType) => {
        switch (type) {
            case ChallengeType.LOCATION: return theme.challenges.location;
            case ChallengeType.TRIVIA: return theme.challenges.trivia;
            case ChallengeType.PICTURE: return theme.challenges.picture;
            case ChallengeType.TRUE_FALSE: return theme.challenges.trueFalse;
            case ChallengeType.DARE: return theme.challenges.dare;
            case ChallengeType.RIDDLE: return theme.challenges.riddle;
            case ChallengeType.CHECK_IN: return theme.challenges.checkIn;
            default: return theme.challenges.default;
        }
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
                <View style={styles.titleContainer}>
                    <TextComponent variant="h3" bold>{t('bingoCardTitle')}</TextComponent>
                    {showSpeakButtons && (
                        <TouchableOpacity
                            onPress={handleSpeakBingo}
                            style={{ padding: 4 }}
                            accessibilityLabel={isSpeaking ? 'Stop reading bingo grid' : 'Read bingo grid aloud'}
                            accessibilityRole="button"
                        >
                            <Ionicons name={isSpeaking ? "volume-mute-outline" : "volume-medium-outline"} size={24} color={theme.primary} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.badge, { backgroundColor: theme.accent }]}>
                        <TextComponent variant="caption" color="#FFF" bold>
                            {team.bingoCard?.fullHouseAwarded ? t('fullHouse') : `${team.bingoCard?.awardedLines.length || 0} ${t('lines')}`}
                        </TextComponent>
                    </View>
                </View>
            </View>

            <View style={styles.grid}>
                {Array.from({ length: 9 }).map((_, index) => {
                    const row = Math.floor(index / 3);
                    const col = index % 3;

                    // Find challenge for this position
                    const challenge = challenges.find(c => c.bingoRow === row && c.bingoCol === col);

                    // If no challenge at this position, render empty placeholder
                    if (!challenge) {
                        return (
                            <View
                                key={`empty-${index}`}
                                style={[
                                    styles.cell,
                                    {
                                        width: CELL_SIZE,
                                        height: CELL_SIZE,
                                        backgroundColor: theme.bgSecondary,
                                        borderColor: theme.borderPrimary,
                                        borderStyle: 'dashed'
                                    }
                                ]}
                            />
                        );
                    }

                    const completed = isCompleted(challenge.id);
                    const failed = isFailed(challenge.id);
                    const typeColor = getColor(challenge.type);

                    // Default Style (Active/Unfinished)
                    let bgColor = theme.bgSecondary;
                    let borderColor = theme.borderPrimary;
                    let iconColor = typeColor;
                    let textColor = theme.textPrimary;
                    let borderWidth = 1;

                    // Overrides for Completed/Failed
                    if (completed) {
                        bgColor = theme.bgSuccess;
                        borderColor = theme.success;
                        iconColor = theme.success;
                        textColor = theme.success;
                        borderWidth = 2;
                    } else if (failed) {
                        bgColor = theme.challengeFailedBackground;
                        borderColor = theme.danger;
                        iconColor = theme.danger;
                        textColor = theme.danger;
                        borderWidth = 2;
                    }

                    return (
                        <TouchableOpacity
                            key={challenge.id}
                            activeOpacity={0.8}
                            onPress={() => onChallengePress(challenge)}
                            accessible={true}
                            accessibilityLabel={`Row ${row + 1}, Column ${col + 1}: ${translateText(challenge.title)}. Status: ${completed ? 'Completed' : failed ? 'Failed' : 'Incomplete'}.`}
                            accessibilityRole="button"
                        >
                            <Animated.View
                                entering={FadeIn.delay(index * 50)}
                                style={[
                                    styles.cell,
                                    {
                                        width: CELL_SIZE,
                                        height: CELL_SIZE,
                                        backgroundColor: bgColor,
                                        borderColor: borderColor,
                                        borderWidth: borderWidth
                                    }
                                ]}
                            >
                                {completed ? (
                                    <Ionicons name="checkmark-circle" size={32} color={theme.success} />
                                ) : failed ? (
                                    <Ionicons name="close-circle" size={32} color={theme.danger} />
                                ) : (
                                    <Ionicons
                                        name={getIcon(challenge.type) as any}
                                        size={28}
                                        color={iconColor}
                                    />
                                )}

                                <TextComponent
                                    variant="caption"
                                    numberOfLines={2}
                                    style={{ marginTop: 4, textAlign: 'center', fontSize: 10 }}
                                    color={textColor}
                                >
                                    {translateText(challenge.title)}
                                </TextComponent>
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
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
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
    emptyContainer: {
        padding: 20,
        alignItems: 'center'
    }
});