import { useEffect } from 'react';
import { useStore } from '../store/store';
import { WatchConnectivityService } from '../services/watchConnectivity';
import { Platform } from 'react-native';
import { activeTourService } from '../services/activeTourService';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

/**
 * Custom React hook that automatically synchronizes the React Native app's
 * state (Zustand store) with the companion watchOS app on iOS.
 *
 * Handles the following messages from the watch:
 * - `nextStop` / `prevStop` — advances or regresses the current stop
 * - `completeChallenge` — marks a challenge as completed (non-trivia)
 * - `failChallenge`     — marks a challenge as failed
 * - `answerChallenge`   — validates a trivia/true-false answer and completes/fails accordingly
 * - `requestSync`       — triggers a full data resync back to the watch (handled in WatchConnectivityService)
 */
export function useWatchSync() {
  const user = useStore((state) => state.user);
  const activeTour = useStore((state) => state.activeTour);
  const fetchActiveTourProgress = useStore((state) => state.fetchActiveTourProgress);
  const updateActiveTourLocal = useStore((state) => state.updateActiveTourLocal);
  const fontScale = useStore((state) => state.fontScale);
  const dyslexicMode = useStore((state) => state.dyslexicMode);
  const { theme, mode } = useTheme();
  const { language } = useLanguage();

  // 1. Activate Watch Connectivity and listen for messages (iOS only)
  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    WatchConnectivityService.activate();

    const cleanupListener = WatchConnectivityService.addMessageListener(async (message) => {
      if (!activeTour || !user) return;

      const userTeam = activeTour.teams?.find(t => t.userId === user.id);
      const currentStop = userTeam?.currentStop || 1;

      // ── Stop navigation ──────────────────────────────────────────────
      if (message.action === 'nextStop') {
        const totalStops = activeTour.tour?.stops?.length || 0;
        if (currentStop < totalStops) {
          const nextStop = currentStop + 1;
          try {
            updateActiveTourLocal({ teams: [{ ...userTeam!, currentStop: nextStop }] });
            await activeTourService.updateCurrentStop(activeTour.id, nextStop, user.id);
            await fetchActiveTourProgress(activeTour.id, user.id);
          } catch (err) {
            console.error('Watch: Failed to advance stop:', err);
          }
        }
      } else if (message.action === 'prevStop') {
        if (currentStop > 1) {
          const prevStop = currentStop - 1;
          try {
            updateActiveTourLocal({ teams: [{ ...userTeam!, currentStop: prevStop }] });
            await activeTourService.updateCurrentStop(activeTour.id, prevStop, user.id);
            await fetchActiveTourProgress(activeTour.id, user.id);
          } catch (err) {
            console.error('Watch: Failed to retreat stop:', err);
          }
        }

      // ── Complete a challenge (non-trivia) ────────────────────────────
      } else if (message.action === 'completeChallenge') {
        const { challengeId } = message;
        if (!challengeId) return;
        try {
          const updatedProgress = await activeTourService.completeChallenge(activeTour.id, challengeId, user.id);
          updateActiveTourLocal(updatedProgress);
          // Push fresh data back to watch
          await fetchActiveTourProgress(activeTour.id, user.id);
        } catch (err) {
          console.error('Watch: Failed to complete challenge:', err);
        }

      // ── Fail a challenge ─────────────────────────────────────────────
      } else if (message.action === 'failChallenge') {
        const { challengeId } = message;
        if (!challengeId) return;
        try {
          await activeTourService.failChallenge(activeTour.id, challengeId, user.id);
          await fetchActiveTourProgress(activeTour.id, user.id);
        } catch (err) {
          console.error('Watch: Failed to fail challenge:', err);
        }

      // ── Answer a trivia / true-false challenge ───────────────────────
      } else if (message.action === 'answerChallenge') {
        const { challengeId, answer } = message;
        if (!challengeId || answer === undefined) return;

        // Find the challenge across all stops + tour-wide to get the correct answer
        const allStopChallenges = activeTour.tour?.stops?.flatMap(s => s.challenges || []) || [];
        const tourChallenges = activeTour.tour?.challenges || [];
        const challenge = [...allStopChallenges, ...tourChallenges].find(c => c.id === challengeId);

        if (!challenge) return;

        const isCorrect = String(answer).trim().toLowerCase() === String(challenge.answer ?? '').trim().toLowerCase();

        try {
          if (isCorrect) {
            const updatedProgress = await activeTourService.completeChallenge(activeTour.id, challengeId, user.id);
            updateActiveTourLocal(updatedProgress);
          } else {
            await activeTourService.failChallenge(activeTour.id, challengeId, user.id);
          }
          await fetchActiveTourProgress(activeTour.id, user.id);
        } catch (err) {
          console.error('Watch: Failed to submit trivia answer:', err);
        }

      // ── Update Pub Golf sips ──────────────────────────────────────────
      } else if (message.action === 'updatePubGolf') {
        const { stopIndex, sips } = message;
        if (stopIndex === undefined || sips === undefined) return;
        const pgStops = activeTour.tour?.stops?.filter(s => s.pubgolfPar != null && s.pubgolfPar > 0) || [];
        const stop = pgStops[stopIndex];
        if (!stop) return;
        try {
          const updatedProgress = await activeTourService.updatePubGolfScore(activeTour.id, stop.id, sips, user.id);
          updateActiveTourLocal(updatedProgress);
          await fetchActiveTourProgress(activeTour.id, user.id);
        } catch (err) {
          console.error('Watch: Failed to update pub golf sips from watch:', err);
        }

      // ── Add Pub Golf Penalty ──────────────────────────────────────────
      } else if (message.action === 'addPubGolfPenalty') {
        const { description, sips } = message;
        if (!description || sips === undefined) return;
        try {
          const updatedProgress = await activeTourService.addPubGolfPenalty(activeTour.id, user.id, description, sips);
          updateActiveTourLocal(updatedProgress);
          await fetchActiveTourProgress(activeTour.id, user.id);
        } catch (err) {
          console.error('Watch: Failed to add pub golf penalty from watch:', err);
        }

      // ── Delete Pub Golf Penalty ───────────────────────────────────────
      } else if (message.action === 'deletePubGolfPenalty') {
        const { penaltyId } = message;
        if (penaltyId === undefined) return;
        try {
          const updatedProgress = await activeTourService.deletePubGolfPenalty(activeTour.id, user.id, penaltyId);
          updateActiveTourLocal(updatedProgress);
          await fetchActiveTourProgress(activeTour.id, user.id);
        } catch (err) {
          console.error('Watch: Failed to delete pub golf penalty from watch:', err);
        }
      }
    });

    return () => {
      cleanupListener();
    };
  }, [activeTour, user, fetchActiveTourProgress, updateActiveTourLocal]);

  // 2. Synchronize user profile stats (level, XP, login state)
  useEffect(() => {
    if (Platform.OS === 'ios') {
      WatchConnectivityService.syncUser(user);
    }
  }, [user]);

  // 3. Synchronize active tour and checkpoint progress
  useEffect(() => {
    if (Platform.OS === 'ios') {
      WatchConnectivityService.syncActiveTour(activeTour);
    }
  }, [activeTour]);

  // 4. Synchronize theme styling dynamically
  useEffect(() => {
    if (Platform.OS === 'ios') {
      WatchConnectivityService.syncTheme(theme, mode);
    }
  }, [theme, mode]);

  // 5. Synchronize accessibility preferences (language, font scale, dyslexic mode)
  useEffect(() => {
    if (Platform.OS === 'ios') {
      WatchConnectivityService.syncAccessibility(language, fontScale, dyslexicMode);
    }
  }, [language, fontScale, dyslexicMode]);
}
