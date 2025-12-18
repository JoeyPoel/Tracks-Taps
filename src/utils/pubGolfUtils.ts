export interface ScoreDetails {
    nameKey: string;
    subKey: string;
    colorKey: string;
    emoji: string;
    recommendedXP: number;
}

export const getScoreDetails = (par: number, sips?: number): ScoreDetails | null => {
    if (sips === undefined || sips === null) return null;

    const diff = sips - par;

    // Special Case: Hole in One
    if (sips === 1) return {
        nameKey: 'holeInOne',
        subKey: 'legendary',
        colorKey: 'holeInOne',
        emoji: '🌟',
        recommendedXP: 200
    };

    // Under Par
    if (diff <= -3) return {
        nameKey: 'albatross',
        subKey: 'unreal',
        colorKey: 'albatross',
        emoji: '🦕',
        recommendedXP: 180
    };
    if (diff === -2) return {
        nameKey: 'eagle',
        subKey: 'amazing',
        colorKey: 'eagle',
        emoji: '🦅',
        recommendedXP: 150
    };
    if (diff === -1) return {
        nameKey: 'birdie',
        subKey: 'greatJob',
        colorKey: 'birdie',
        emoji: '🐦',
        recommendedXP: 125
    };

    // Par
    if (diff === 0) return {
        nameKey: 'parScore',
        subKey: 'perfect',
        colorKey: 'par',
        emoji: '⛳',
        recommendedXP: 100
    };

    // Over Par
    if (diff === 1) return {
        nameKey: 'bogey',
        subKey: 'niceTry',
        colorKey: 'bogey',
        emoji: '😅',
        recommendedXP: 60
    };
    if (diff === 2) return {
        nameKey: 'doubleBogey',
        subKey: '',
        colorKey: 'doubleBogey',
        emoji: '😳',
        recommendedXP: 30
    };

    // Triple Bogey+
    return {
        nameKey: 'tripleBogeyPlus',
        subKey: '',
        colorKey: 'tripleBogey',
        emoji: '💀',
        recommendedXP: 0
    };
};

export const PUB_GOLF_LEGEND_DATA = [
    { nameKey: 'holeInOne', xp: 200, emoji: '🌟', colorKey: 'holeInOne' },
    { nameKey: 'albatross', xp: 180, emoji: '🦕', colorKey: 'albatross' },
    { nameKey: 'eagle', xp: 150, emoji: '🦅', colorKey: 'eagle' },
    { nameKey: 'birdie', xp: 125, emoji: '🐦', colorKey: 'birdie' },
    { nameKey: 'parScore', xp: 100, emoji: '⛳', colorKey: 'par' },
    { nameKey: 'bogey', xp: 60, emoji: '😅', colorKey: 'bogey' },
    { nameKey: 'doubleBogey', xp: 30, emoji: '😳', colorKey: 'doubleBogey' },
    { nameKey: 'tripleBogeyPlus', xp: 0, emoji: '💀', colorKey: 'tripleBogey' },
];

