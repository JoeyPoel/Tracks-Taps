
export class LevelSystem {
    private static BASE_XP = 500;
    private static MULTIPLIER = 1.2;

    /**
     * Calculates the XP required to reach a specific level.
     * Formula: BASE_XP * (MULTIPLIER ^ (level - 1))
     */
    static getXpForLevel(level: number): number {
        if (level <= 1) return 0;
        return Math.floor(this.BASE_XP * Math.pow(this.MULTIPLIER, level - 1));
    }

    /**
     * Calculates total XP required to reach a specific level from level 0.
     * This is a geometric series sum if we want total cumulative XP, 
     * but for this game, let's assume 'xp' in User model is TOTAL cumulative XP.
     */
    static getTotalXpToReachLevel(targetLevel: number): number {
        if (targetLevel <= 1) return 0;

        let total = 0;
        for (let i = 1; i < targetLevel; i++) {
            total += this.getXpForLevel(i); // XP needed to complete level i and reach i+1
        }
        return total;
    }

    /**
     * Determines the current level based on total XP.
     * Iteratively checks thresholds. 
     * Optimized for typical game levels (e.g. 1-100).
     */
    static getLevel(totalXp: number): number {
        let level = 1;
        let xpNeeded = this.getXpForLevel(level); // XP needed to go from 1 -> 2

        while (totalXp >= xpNeeded) {
            totalXp -= xpNeeded;
            level++;
            xpNeeded = this.getXpForLevel(level);
        }

        return level;
    }

    /**
     * Returns progress details for UI.
     */
    static getProgress(totalXp: number) {
        let level = 1;
        let currentXp = totalXp;
        let xpNeeded = this.getXpForLevel(level);

        while (currentXp >= xpNeeded) {
            currentXp -= xpNeeded;
            level++;
            xpNeeded = this.getXpForLevel(level);
        }

        return {
            level,
            currentLevelXp: currentXp, // XP earned in current level
            nextLevelXpStart: xpNeeded, // Total XP needed for next level relative to start of current
            progressPercent: Math.min(100, (currentXp / xpNeeded) * 100)
        };
    }
}
