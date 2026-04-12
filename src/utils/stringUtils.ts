/**
 * Normalizes a string by converting to lowercase, removing punctuation, 
 * and trimming extra whitespace.
 */
export function normalizeString(str: string): string {
    return str
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();
}

/**
 * Calculates the Levenshtein distance between two strings.
 * Used for fuzzy matching to allow slight typos.
 */
export function getLevenshteinDistance(a: string, b: string): number {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
        Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // deletion
                matrix[i][j - 1] + 1,      // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }

    return matrix[a.length][b.length];
}

/**
 * Checks if two strings are a flexible match based on:
 * 1. Exact normalized match
 * 2. Substring match (one contained in other)
 * 3. Fuzzy match (Levenshtein distance within threshold)
 */
export function isFlexibleMatch(input: string, target: string): boolean {
    const normInput = normalizeString(input);
    const normTarget = normalizeString(target);

    if (!normInput || !normTarget) return false;

    // 1. Exact Match
    if (normInput === normTarget) return true;

    // 2. Substring Match (User's word is in the answer OR vice versa)
    if (normTarget.includes(normInput) || normInput.includes(normTarget)) {
        // Only count substring if it's meaningful length (preventing 'a' matching everything)
        if (normInput.length >= 3 || normInput === normTarget) return true;
    }

    // 4. Fuzzy Matching
    const distance = getLevenshteinDistance(normInput, normTarget);
    
    // Threshold: Max 2 characters off, OR 20% of the target length
    const threshold = Math.max(2, Math.floor(normTarget.length * 0.2));
    
    return distance <= threshold;
}
