import { WatchConnectivity } from '@plevo/expo-watch-connectivity';
import { ActiveTour, User } from '../types/models';
import { strings } from '../context/strings';

/** Watch-relevant keys extracted from strings.ts. Only these are sent to the watch. */
const WATCH_STRING_KEYS = [
  'activeTour', 'currentAdventure', 'completed', 'challenges', 'progress',
  'pubgolf', 'bingo', 'level', 'xp', 'submitAnswer', 'claimPoints',
  'dareCompleted', 'showHint', 'hideHint', 'next', 'back', 'done',
  'true', 'false', 'navigate', 'noStopDescription', 'bonus',
  'par', 'sips', 'drink', 'total', 'loading', 'trivia', 'trueFalse',
  'photo', 'riddle', 'checkIn', 'dare', 'Stop', 'stops',
  'active', 'completed', 'failed',
] as const;

type WatchStringKey = typeof WATCH_STRING_KEYS[number];

/**
 * Builds a compact localized string map for the watch from strings.ts.
 * Only sends the keys the watch UI actually uses.
 */
function buildWatchStrings(lang: string): Record<string, string> {
  const langStrings = (strings as any)[lang] || strings.en;
  const result: Record<string, string> = {};
  for (const key of WATCH_STRING_KEYS) {
    result[key] = langStrings[key] ?? (strings.en as any)[key] ?? key;
  }
  return result;
}

/**
 * Service to manage communication between the iOS app and the watchOS companion app.
 * Uses `sendMessage` for immediate delivery (when reachable) and falls back
 * to `updateApplicationContext` to guarantee delivery after reconnect.
 */
export class WatchConnectivityService {
  private static isActivated = false;
  private static lastTourPayload: object | null = null;
  private static lastUserPayload: object | null = null;
  private static lastThemePayload: object | null = null;
  private static lastAccessibilityPayload: object | null = null;

  /**
   * Initializes and activates the Watch Connectivity session.
   * Safe to call multiple times — re-activates if session dropped.
   */
  public static async activate(): Promise<void> {
    try {
      await WatchConnectivity.activate();
      this.isActivated = true;
      console.log('Watch Connectivity activated successfully.');
    } catch (error) {
      console.error('Failed to activate Watch Connectivity:', error);
    }
  }

  /**
   * Sends a full state push to the watch.
   * Tries live `sendMessage` first (instant delivery when reachable),
   * then always updates `applicationContext` as a guaranteed fallback
   * so the watch gets the latest state on next wake/reconnect.
   * @param payload - Any dictionary payload to send.
   */
  private static pushToWatch(payload: Record<string, unknown>): void {
    if (!this.isActivated) return;
    try {
      // Attempt instant delivery if watch is reachable (active + screen on)
      WatchConnectivity.sendMessage(payload).catch(() => {
        // Not reachable — applicationContext below will handle it
      });
    } catch {
      // sendMessage not available or errored — silently ignore
    }
    try {
      // Always update application context for guaranteed delivery on reconnect
      WatchConnectivity.updateApplicationContext(payload);
    } catch (error) {
      console.error('[Watch] Error updating applicationContext:', error);
    }
  }

  /**
   * Sends a one-off live message to the watch (best effort, no fallback).
   * Use for action acknowledgements or lightweight ping/pong.
   * @param payload - Message dictionary.
   */
  public static sendLiveMessage(payload: Record<string, unknown>): void {
    if (!this.isActivated) return;
    WatchConnectivity.sendMessage(payload).catch(err =>
      console.warn('[Watch] sendLiveMessage failed (not reachable):', err)
    );
  }

  /**
   * Syncs the user's profile data to the watch.
   * Sends `isLoggedIn: false` when user is null so the watch can show
   * a "please log in on iPhone" state rather than a default dashboard.
   * @param user - The authenticated user or null.
   */
  public static syncUser(user: User | null): void {
    const userPayload = user
      ? { name: user.name, xp: user.xp, level: user.level }
      : null;

    this.lastUserPayload = { user: userPayload, isLoggedIn: !!user };
    this.pushToWatch(this.lastUserPayload as Record<string, unknown>);
  }

  /**
   * Syncs the active tour and its full progress to the watch.
   * Includes challenges per stop, pub golf scorecard, bingo grid, and tour modes.
   * Uses `team.activeChallenges` from the API model to determine completion state.
   * @param activeTour - The active tour session or null.
   */
  public static syncActiveTour(activeTour: ActiveTour | null): void {
    if (!activeTour) {
      this.lastTourPayload = { hasActiveTour: false };
      this.pushToWatch(this.lastTourPayload as Record<string, unknown>);
      return;
    }

    const tour = activeTour.tour;
    const totalStops = tour?.stops?.length || 0;

    // Determine current stop and completed count from user's team
    const userTeam = activeTour.teams?.find(t => t.userId === activeTour.userId);
    const currentStopNumber = userTeam?.currentStop || 1;
    const completedStops = Math.max(0, currentStopNumber - 1);

    // Build completed/failed sets from activeChallenges on the team (from API)
    const completedIds = new Set<number>(
      (userTeam?.activeChallenges || []).filter(ac => ac.completed).map(ac => ac.challengeId)
    );
    const failedIds = new Set<number>(
      (userTeam?.activeChallenges || []).filter(ac => ac.failed).map(ac => ac.challengeId)
    );

    // Current stop details
    let currentStopName: string | undefined;
    let currentStopDescription: string | undefined;
    let currentStopLatitude: number | undefined;
    let currentStopLongitude: number | undefined;

    if (tour?.stops && tour.stops.length > 0) {
      const stopIdx = Math.min(currentStopNumber - 1, tour.stops.length - 1);
      const stop = tour.stops[stopIdx];
      currentStopName = stop?.name;
      currentStopDescription = stop?.description || undefined;
      // Guard against 0,0 coordinates (invalid/missing)
      currentStopLatitude = (stop?.latitude && stop.latitude !== 0) ? stop.latitude : undefined;
      currentStopLongitude = (stop?.longitude && stop.longitude !== 0) ? stop.longitude : undefined;
    }

    // Current-stop challenges
    const currentStop = tour?.stops?.[Math.min(currentStopNumber - 1, totalStops - 1)];
    const stopChallenges = (currentStop?.challenges || []).map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      type: c.type,
      content: c.content ?? null,
      hint: c.hint ?? null,
      options: c.options ?? [],
      answer: c.answer ?? null,
      isCompleted: completedIds.has(c.id),
      isFailed: failedIds.has(c.id),
    }));

    // Bonus (tour-wide, non-bingo) challenges
    const allTourChallenges = tour?.challenges || [];
    const bonusChallenges = allTourChallenges
      .filter(c => !c.stopId && typeof c.bingoRow !== 'number')
      .map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        type: c.type,
        content: c.content ?? null,
        hint: c.hint ?? null,
        options: c.options ?? [],
        answer: c.answer ?? null,
        isCompleted: completedIds.has(c.id),
        isFailed: failedIds.has(c.id),
      }));

    // Bingo grid challenges
    const allStopChallenges = tour?.stops?.flatMap(s => s.challenges || []) || [];
    const allPossible = [...allTourChallenges, ...allStopChallenges];
    const bingoChallenges = allPossible
      .filter(c => typeof c.bingoRow === 'number' && typeof c.bingoCol === 'number')
      .map(c => ({
        id: c.id,
        title: c.title || c.description,
        row: c.bingoRow as number,
        col: c.bingoCol as number,
        isCompleted: completedIds.has(c.id),
        isFailed: failedIds.has(c.id),
        description: c.description ?? '',
        type: c.type ?? 'TRIVIA',
        content: c.content ?? null,
        hint: c.hint ?? null,
        options: c.options ?? [],
        answer: c.answer ?? null,
      }));

    // Pub golf scorecard
    const pubGolfTeamStops = userTeam?.pubGolfStops || [];
    const pubGolfPenalties = userTeam?.pubGolfPenalties || [];
    const pubGolfStopsData = (tour?.stops || [])
      .filter(s => s.pubgolfPar != null && s.pubgolfPar > 0)
      .map((s, idx) => {
        const teamStop = pubGolfTeamStops.find(pg => pg.stopId === s.id);
        return {
          stopName: s.name,
          stopNumber: idx + 1,
          par: s.pubgolfPar ?? 0,
          drink: s.pubgolfDrink ?? '',
          sips: teamStop?.sips ?? 0,
        };
      });

    const pubGolfPenaltiesData = pubGolfPenalties.map(p => ({
      id: p.id,
      description: p.description || 'Penalty',
      sips: p.sips || 0,
    }));

    const totalPenalties = pubGolfPenalties.reduce((sum, p) => sum + p.sips, 0);

    const teamsData = (activeTour.teams || []).map(t => ({
      id: t.id,
      name: t.name,
      emoji: t.emoji || '👥',
      color: t.color || '#3B82F6',
      score: t.score || 0,
      currentStop: t.currentStop || 1,
      finishedAt: t.finishedAt ? t.finishedAt.toString() : null,
      userName: t.user?.name || 'Explorer',
    }));

    // All stop coordinates for the route map
    const allStopsMap = (tour?.stops || []).map((s, idx) => ({
      index: idx,
      name: s.name,
      latitude: (s.latitude && s.latitude !== 0) ? s.latitude : null,
      longitude: (s.longitude && s.longitude !== 0) ? s.longitude : null,
      isCurrent: idx === currentStopNumber - 1,
      isCompleted: idx < currentStopNumber - 1,
    }));

    const tourPayload = {
      name: tour?.title || 'Active Tour',
      status: activeTour.status || 'IN_PROGRESS',
      completedStops,
      totalStops,
      currentStopName,
      currentStopDescription,
      currentStopLatitude,
      currentStopLongitude,
      currentStopIndex: currentStopNumber - 1,
      tourModes: tour?.modes || [],
      stopChallenges,
      bonusChallenges,
      bingoChallenges,
      pubGolfStops: pubGolfStopsData,
      pubGolfTotalPenalties: totalPenalties,
      pubGolfPenalties: pubGolfPenaltiesData,
      allStops: allStopsMap,
      tourDescription: tour?.description || '',
      difficulty: tour?.difficulty || 'medium',
      creatorName: tour?.creator?.name || '',
      teams: teamsData,
      myTeamId: userTeam?.id || null,
      winnerTeamId: activeTour.winnerTeamId || null,
    };

    this.lastTourPayload = { hasActiveTour: true, activeTour: tourPayload };
    this.pushToWatch(this.lastTourPayload as Record<string, unknown>);
  }


  /**
   * Syncs the active app theme colors to the watch.
   * @param theme - The theme object with color values.
   * @param mode - 'light' or 'dark'.
   */
  public static syncTheme(theme: any, mode: string): void {
    this.lastThemePayload = {
      theme: {
        bgPrimary: theme.bgPrimary,
        bgSecondary: theme.bgSecondary,
        primary: theme.primary,
        secondary: theme.secondary,
        accent: theme.accent || theme.accentColor || '#FFC107',
        mode,
      }
    };
    this.pushToWatch(this.lastThemePayload as Record<string, unknown>);
  }

  /**
   * Syncs the user's accessibility and language preferences to the watch.
   * The watch uses this to:
   * - Apply font scaling (smallest → largest)
   * - Apply dyslexic-friendly font
   * - Render UI labels in the correct language
   * @param lang - Active language code (e.g. 'en', 'nl', 'de')
   * @param fontScale - Scale key: 'smallest' | 'small' | 'normal' | 'large' | 'largest'
   * @param dyslexicMode - Whether the dyslexic font is enabled
   * @param translateCache - Optional dict of { original → translated } for tour content
   */
  public static syncAccessibility(
    lang: string,
    fontScale: string,
    dyslexicMode: boolean,
    translateCache?: Record<string, string>
  ): void {
    const watchStrings = buildWatchStrings(lang);
    this.lastAccessibilityPayload = {
      accessibility: {
        language: lang,
        fontScale,
        dyslexicMode,
        strings: watchStrings,
        translateCache: translateCache ?? {},
      }
    };
    this.pushToWatch(this.lastAccessibilityPayload as Record<string, unknown>);
  }

  /**
   * Re-sends the last known state to the watch.
   * Called when the watch requests a full resync (e.g., on app foreground or scene activation).
   */
  public static resync(): void {
    if (this.lastUserPayload) {
      this.pushToWatch(this.lastUserPayload as Record<string, unknown>);
    }
    if (this.lastTourPayload) {
      this.pushToWatch(this.lastTourPayload as Record<string, unknown>);
    }
    if (this.lastThemePayload) {
      this.pushToWatch(this.lastThemePayload as Record<string, unknown>);
    }
    if (this.lastAccessibilityPayload) {
      this.pushToWatch(this.lastAccessibilityPayload as Record<string, unknown>);
    }
  }

  /**
   * Registers a message listener for messages sent from the Watch to the Phone.
   * @param callback - Function to call when a message is received.
   * @returns Cleanup function to remove the listener.
   */
  public static addMessageListener(callback: (message: any) => void): () => void {
    if (!this.isActivated) {
      console.warn('Watch Connectivity is not activated yet. Listener might miss messages.');
    }
    const subscription = WatchConnectivity.addMessageListener((event) => {
      const msg = event.message;
      // Handle resync request from watch (sent on scene activation)
      if (msg?.action === 'requestSync') {
        WatchConnectivityService.resync();
        return;
      }
      callback(msg);
    });
    return () => {
      subscription.remove();
    };
  }
}
