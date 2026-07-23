import { useEffect } from 'react';
import { useStore } from '../store/store';
import { WatchConnectivityService } from '../services/watchConnectivity';
import { Platform } from 'react-native';
import { activeTourService } from '../services/activeTourService';
import { useTheme } from '../context/ThemeContext';

/**
 * Custom React hook that automatically synchronizes the React Native app's
 * state (Zustand store) with the companion watchOS app on iOS.
 */
export function useWatchSync() {
  const user = useStore((state) => state.user);
  const activeTour = useStore((state) => state.activeTour);
  const fetchActiveTourProgress = useStore((state) => state.fetchActiveTourProgress);
  const updateActiveTourLocal = useStore((state) => state.updateActiveTourLocal);
  const { theme, mode } = useTheme();

  // 1. Activate Watch Connectivity and listen for messages (iOS only)
  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    // Activate connectivity
    WatchConnectivityService.activate();

    // Listen for watch actions (nextStop/prevStop)
    const cleanupListener = WatchConnectivityService.addMessageListener(async (message) => {
      if (!activeTour || !user) return;

      const userTeam = activeTour.teams?.find(t => t.userId === user.id);
      const currentStop = userTeam?.currentStop || 1;

      if (message.action === 'nextStop') {
        const totalStops = activeTour.tour?.stops?.length || 0;
        if (currentStop < totalStops) {
          const nextStop = currentStop + 1;
          try {
            // Optimistic update
            updateActiveTourLocal({
              teams: [{ ...userTeam!, currentStop: nextStop }]
            });
            await activeTourService.updateCurrentStop(activeTour.id, nextStop, user.id);
            await fetchActiveTourProgress(activeTour.id, user.id);
          } catch (err) {
            console.error('Failed to step next stop from Watch:', err);
          }
        }
      } else if (message.action === 'prevStop') {
        if (currentStop > 1) {
          const prevStop = currentStop - 1;
          try {
            // Optimistic update
            updateActiveTourLocal({
              teams: [{ ...userTeam!, currentStop: prevStop }]
            });
            await activeTourService.updateCurrentStop(activeTour.id, prevStop, user.id);
            await fetchActiveTourProgress(activeTour.id, user.id);
          } catch (err) {
            console.error('Failed to step prev stop from Watch:', err);
          }
        }
      }
    });

    return () => {
      cleanupListener();
    };
  }, [activeTour, user, fetchActiveTourProgress, updateActiveTourLocal]);

  // 2. Synchronize user profile stats (level, XP)
  useEffect(() => {
    if (Platform.OS === 'ios') {
      WatchConnectivityService.syncUser(user);
    }
  }, [user]);

  // 3. Synchronize active tour and checkpoints progress
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
}
