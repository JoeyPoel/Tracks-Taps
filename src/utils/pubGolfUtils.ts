export interface ScoreDetails {
    nameKey: string;
    subKey: string;
    colorKey: string;
    emoji: string;
}

export const getScoreDetails = (par: number, sips?: number): ScoreDetails | null => {
    if (sips === undefined || sips === null) return null;

    const diff = sips - par;

    // Special Case: Hole in One
    if (sips === 1) return {
        nameKey: 'holeInOne',
        subKey: 'legendary',
        colorKey: 'holeInOne',
        emoji: '🌟'
    };

    // Under Par
    if (diff <= -3) return {
        nameKey: 'albatross',
        subKey: 'unreal',
        colorKey: 'albatross',
        emoji: '🦕'
    };
    if (diff === -2) return {
        nameKey: 'eagle',
        subKey: 'amazing',
        colorKey: 'eagle',
        emoji: '🦅'
    };
    if (diff === -1) return {
        nameKey: 'birdie',
        subKey: 'greatJob',
        colorKey: 'birdie',
        emoji: '🐦'
    };

    // Par
    if (diff === 0) return {
        nameKey: 'parScore',
        subKey: 'perfect',
        colorKey: 'par',
        emoji: '⛳'
    };

    // Over Par
    if (diff === 1) return {
        nameKey: 'bogey',
        subKey: 'niceTry',
        colorKey: 'bogey',
        emoji: '😅'
    };
    if (diff === 2) return {
        nameKey: 'doubleBogey',
        subKey: '',
        colorKey: 'doubleBogey',
        emoji: '😳'
    };

    // Triple Bogey+
    return {
        nameKey: 'tripleBogeyPlus',
        subKey: '',
        colorKey: 'tripleBogey',
        emoji: '💀'
    };
};

