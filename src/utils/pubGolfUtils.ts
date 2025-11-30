export interface ScoreDetails {
    name: string;
    sub: string;
    color: readonly [string, string, string];
    emoji: string;
}

export const getScoreDetails = (par: number, sips?: number): ScoreDetails | null => {
    if (sips === undefined || sips === null) return null;

    const diff = sips - par;

    // Special Case: Hole in One
    if (sips === 1) return {
        name: 'HOLE IN ONE!',
        sub: 'Legendary!',
        color: ['#FFD700', '#F59E0B', '#291c06'] as const,
        emoji: '🌟'
    };

    // Under Par
    if (diff <= -3) return {
        name: 'Albatross!',
        sub: 'Unreal!',
        color: ['#A855F7', '#9333EA', '#1e1b4b'] as const, // Deep Indigo/Purple bg
        emoji: '🦕'
    };
    if (diff === -2) return {
        name: 'EAGLE!',
        sub: 'Amazing!',
        color: ['#E879F9', '#D946EF', '#1f0f21'] as const, // Pink/Purple -> Dark Purple bg
        emoji: '🦅'
    };
    if (diff === -1) return {
        name: 'Birdie!',
        sub: 'Great job!',
        color: ['#4ADE80', '#22C55E', '#062115'] as const, // Green -> Dark Green bg
        emoji: '🐦'
    };

    // Par
    if (diff === 0) return {
        name: 'PAR!',
        sub: 'Perfect!',
        color: ['#60A5FA', '#3B82F6', '#0f172a'] as const, // Blue -> Dark Navy bg
        emoji: '⛳'
    };

    // Over Par
    if (diff === 1) return {
        name: 'Bogey!',
        sub: 'Nice try!',
        color: ['#FB923C', '#F97316', '#27150a'] as const, // Orange -> Dark Brown bg
        emoji: '😅'
    };
    if (diff === 2) return {
        name: 'Double Bogey',
        sub: '',
        color: ['#F87171', '#EF4444', '#2b0e0e'] as const, // Red -> Dark Red bg
        emoji: '😳'
    };

    // Triple Bogey+
    return {
        name: 'Triple Bogey+',
        sub: '',
        color: ['#9CA3AF', '#6B7280', '#111827'] as const, // Grey -> Black bg
        emoji: '💀'
    };
};
