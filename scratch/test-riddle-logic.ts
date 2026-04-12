import { isFlexibleMatch, normalizeString, getLevenshteinDistance } from '../src/utils/stringUtils';

const testCases = [
    { input: "Amsterdam", target: "Amsterdam", expected: true, desc: "Exact match" },
    { input: "amsterdam", target: "Amsterdam", expected: true, desc: "Case insensitive" },
    { input: "Amstredam", target: "Amsterdam", expected: true, desc: "Slight typo (Levenshtein)" },
    { input: "Eiffel", target: "Eiffel Tower", expected: true, desc: "Substring match (input in target)" },
    { input: "The Eiffel Tower", target: "Eiffel Tower", expected: true, desc: "Substring match (target in input)" },
    { input: "don't", target: "dont", expected: true, desc: "Punctuation normalization" },
    { input: "Colosseum", target: "Coleusum", expected: true, desc: "Fuzzy match with 2 typos" },
    { input: "London", target: "Paris", expected: false, desc: "Completely different" },
    { input: "a", target: "Amsterdam", expected: false, desc: "Too short for substring" },
];

console.log("--- Starting Riddle Logic Tests ---");
let passed = 0;
testCases.forEach((tc, i) => {
    const result = isFlexibleMatch(tc.input, tc.target);
    const status = result === tc.expected ? "✅ PASS" : "❌ FAIL";
    if (result === tc.expected) passed++;
    console.log(`${status} [${i+1}] ${tc.desc}: "${tc.input}" vs "${tc.target}" -> ${result}`);
});

console.log(`\nResults: ${passed}/${testCases.length} passed.`);
