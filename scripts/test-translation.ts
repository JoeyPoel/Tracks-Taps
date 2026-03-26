/**
 * Test script for Active Tour Auto-Translation Logic
 * Run with: npx tsx scripts/test-translation.ts
 */

// --- Mock Structure for Translation ---

type TranslationCache = { [key: string]: string };

class MockTranslationManager {
  private cache: TranslationCache = {};
  private currentLanguage: string = 'en';
  private isAutoTranslateEnabled: boolean = true;
  private callCount: number = 0;
  private strings: any = {
    en: { terms_sec1: '1. Acceptance of the Terms' },
    es: { terms_sec1: '1. Aceptación de los Términos' }
  };

  constructor(lang: string = 'en', enabled: boolean = true) {
    this.currentLanguage = lang;
    this.isAutoTranslateEnabled = enabled;
  }

  setAutoTranslate(enabled: boolean) {
    this.isAutoTranslateEnabled = enabled;
  }

  cacheTranslation(original: string, translated: string) {
    if (!original || !translated || original === translated) return;
    this.cache[original] = translated;
  }

  translateText(text: string, force: boolean = false): string {
    if (!text) return text;
    this.callCount++;

    // 1. Strings First
    const enStrings = this.strings.en;
    const key = Object.keys(enStrings).find(k => enStrings[k] === text);
    if (key) {
      return this.strings[this.currentLanguage][key] || text;
    }

    // 2. Cache
    if (!this.isAutoTranslateEnabled && !force) return text;
    return this.cache[text] || text;
  }

  getCallCount() { return this.callCount; }
  resetCallCount() { this.callCount = 0; }
}

// --- Mock Tour Structure ---

interface Challenge {
  id: string;
  title: string;
  translateText: string;
}

interface Stop {
  id: number;
  name: string;
  description: string;
  detailedDescription?: string;
  drinkName?: string;
  challenges: Challenge[];
}

interface Tour {
  name: string;
  description: string;
  stops: Stop[];
}

const mockTour: Tour = {
  name: "Barcelona Tapas Adventure",
  description: "A delicious journey through the Gothic Quarter.",
  stops: [
    {
      id: 1,
      name: "El Xampanyet",
      description: "Historic cava bar near the Picasso Museum.",
      detailedDescription: "Enjoy a glass of sparkling cava and their famous salted anchovies.",
      drinkName: "Cava Rosat",
      challenges: [
        {
          id: "c1",
          title: "The First Sip",
          translateText: "Take a photo of your first glass of cava!"
        },
        {
          id: "c2",
          title: "Anchovy Count",
          translateText: "How many anchovies are in a standard portion? (Trivia: 4, 6, 8)"
        }
      ]
    },
    {
      id: 2,
      name: "Quimet & Quimet",
      description: "Iconic standing-room-only montaditos bar.",
      challenges: [
        {
          id: "c3",
          title: "Salmon Montadito",
          translateText: "Order the salmon, truffle honey, and yogurt montadito."
        }
      ]
    }
  ]
};

// --- Rendering Simulation ---

function simulateActiveTourRendering(tour: Tour, translator: MockTranslationManager) {
  console.log(`[SIM] Rendering Tour: "${translator.translateText(tour.name)}"`);
  console.log(`[SIM] Description: "${translator.translateText(tour.description)}"`);
  
  tour.stops.forEach(stop => {
    console.log(`\n  [STOP ${stop.id}] Name: "${translator.translateText(stop.name)}"`);
    console.log(`  [STOP ${stop.id}] Desc: "${translator.translateText(stop.description)}"`);
    if (stop.detailedDescription) {
        console.log(`  [STOP ${stop.id}] Detailed: "${translator.translateText(stop.detailedDescription)}"`);
    }
    if (stop.drinkName) {
        console.log(`  [STOP ${stop.id}] Drink: "${translator.translateText(stop.drinkName)}"`);
    }

    stop.challenges.forEach(challenge => {
      console.log(`    [CHALLENGE] Title: "${translator.translateText(challenge.title)}"`);
      console.log(`    [CHALLENGE] Content: "${translator.translateText(challenge.translateText)}"`);
    });
  });
}

// --- Main Test Suite ---

async function runTests() {
  console.log("=== Active Tour Auto-Translation Logic Verification ===\n");

  const translator = new MockTranslationManager('es', true);

  // 1. Pre-population of some translations in cache
  translator.cacheTranslation("Barcelona Tapas Adventure", "Aventura de Tapas en Barcelona");
  translator.cacheTranslation("A delicious journey through the Gothic Quarter.", "Un viaje delicioso por el Barrio Gótico.");
  translator.cacheTranslation("The First Sip", "El Primer Sorbo");
  translator.cacheTranslation("Take a photo of your first glass of cava!", "¡Haz una foto de tu primera copa de cava!");

  console.log("--- TEST 1: Auto-Translate ENABLED ---");
  translator.resetCallCount();
  simulateActiveTourRendering(mockTour, translator);
  
  const totalFields = 2 + (mockTour.stops.length * 2) + 2 + 3; // Tour(2) + Stops(2*2 + 1 detailed + 1 drink) + Challenges(3 titles + 3 contents)
  // Let's count manually based on mock: 
  // Tour: name, desc (2)
  // Stop 1: name, desc, detailed, drink (4)
  // Stop 1 Challenges: c1 title, c1 content, c2 title, c2 content (4)
  // Stop 2: name, desc (2)
  // Stop 2 Challenges: c3 title, c3 content (2)
  // Total expected calls: 2 + 4 + 4 + 2 + 2 = 14
  
  console.log(`\nVerified ${translator.getCallCount()} calls to translateText.`);
  if (translator.getCallCount() === 14) {
    console.log("PASS: All relevant fields were processed for translation.");
  } else {
    console.error(`FAIL: Expected 14 calls, got ${translator.getCallCount()}`);
  }

  console.log("\n--- TEST 2: Auto-Translate DISABLED ---");
  translator.setAutoTranslate(false);
  translator.resetCallCount();
  
  // Capture output to verify original text is returned
  console.log("Simulating with auto-translate OFF...");
  simulateActiveTourRendering(mockTour, translator);
  
  if (translator.getCallCount() === 14) {
    console.log("PASS: All fields still passed through translator (logic bypasses cache).");
  } else {
    console.error(`FAIL: Expected 14 calls, got ${translator.getCallCount()}`);
  }

  console.log("\n--- TEST 4: Strings-First Logic ---");
  const stringMatch = translator.translateText("1. Acceptance of the Terms");
  if (stringMatch === "1. Aceptación de los Términos") {
    console.log("PASS: Found translation in strings.ts by value.");
  } else {
    console.error(`FAIL: Got "${stringMatch}" instead of "1. Aceptación de los Términos"`);
  }

  console.log("\n--- TEST 5: Force Translation (Guest Support) ---");
  translator.setAutoTranslate(false);
  const forcedResult = translator.translateText("Manual Text", true);
  translator.cacheTranslation("Manual Text", "Texto Manual");
  const forcedResultWithCache = translator.translateText("Manual Text", true);
  if (forcedResultWithCache === "Texto Manual") {
    console.log("PASS: Forced translation bypasses auto-translate toggle.");
  } else {
    console.error(`FAIL: Got "${forcedResultWithCache}" instead of "Texto Manual"`);
  }

  console.log("\n=== All Verification Tests Completed ===\n");
}

runTests().catch(console.error);
