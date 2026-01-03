
/**
 * Bingo Logic Utilities
 * 
 * Logic to check for lines (rows, cols, diagonals) and full house.
 * Uses a pure data approach.
 */

interface Cell {
    row: number;
    col: number;
    completed: boolean;
}

interface BingoCheckResult {
    newAwardedLines: string[];
    isFullHouse: boolean;
}

/**
 * Checks for bingo lines and full house based on cell status.
 * 
 * @param cells - Array of 9 cells with row, col, and completed status
 * @param previouslyAwardedLines - Array of already awarded line IDs (e.g. "row-0")
 * @returns Object containing newly awarded line IDs and full house status
 */
export const checkBingo = (
    cells: Cell[],
    previouslyAwardedLines: string[]
): BingoCheckResult => {

    const newLines: string[] = [];
    let isFullHouse = true;

    // Helper to get cell at pos
    const getCell = (r: number, c: number) => cells.find(cell => cell.row === r && cell.col === c);

    // 1. Check Rows
    for (let r = 0; r < 3; r++) {
        const lineId = `row-${r}`;
        if (previouslyAwardedLines.includes(lineId)) continue;

        const c0 = getCell(r, 0);
        const c1 = getCell(r, 1);
        const c2 = getCell(r, 2);

        if (c0?.completed && c1?.completed && c2?.completed) {
            newLines.push(lineId);
        }
    }

    // 2. Check Cols
    for (let c = 0; c < 3; c++) {
        const lineId = `col-${c}`;
        if (previouslyAwardedLines.includes(lineId)) continue;

        const r0 = getCell(0, c);
        const r1 = getCell(1, c);
        const r2 = getCell(2, c);

        if (r0?.completed && r1?.completed && r2?.completed) {
            newLines.push(lineId);
        }
    }

    // 3. Check Diagonals
    const diag1Id = "diag-1"; // TL to BR
    if (!previouslyAwardedLines.includes(diag1Id)) {
        if (getCell(0, 0)?.completed && getCell(1, 1)?.completed && getCell(2, 2)?.completed) {
            newLines.push(diag1Id);
        }
    }

    const diag2Id = "diag-2"; // TR to BL
    if (!previouslyAwardedLines.includes(diag2Id)) {
        if (getCell(0, 2)?.completed && getCell(1, 1)?.completed && getCell(2, 0)?.completed) {
            newLines.push(diag2Id);
        }
    }

    // 4. Check Full House
    // Full house is effectively if all 9 cells are completed
    isFullHouse = cells.length === 9 && cells.every(c => c.completed);

    return {
        newAwardedLines: newLines,
        isFullHouse
    };
};
