import { WatchConnectivity } from '@plevo/expo-watch-connectivity';
import { ActiveTour, User } from '../types/models';

/**
 * Service to manage communication between the iOS app and the watchOS companion app.
 */
export class WatchConnectivityService {
  private static isActivated = false;

  /**
   * Initializes and activates the Watch Connectivity session.
   */
  public static async activate(): Promise<void> {
    if (this.isActivated) return;
    try {
      // Activate session
      await WatchConnectivity.activate();
      this.isActivated = true;
      console.log('Watch Connectivity activated successfully.');
    } catch (error) {
      console.error('Failed to activate Watch Connectivity:', error);
    }
  }

  /**
   * Syncs the user's level and XP data to the watch.
   */
  public static syncUser(user: User | null): void {
    if (!this.isActivated) return;
    try {
      const userPayload = user
        ? {
            name: user.name,
            xp: user.xp,
            level: user.level,
          }
        : null;

      WatchConnectivity.updateApplicationContext({ user: userPayload });
    } catch (error) {
      console.error('Error syncing user to Watch:', error);
    }
  }

  /**
   * Syncs the active tour and its current progress to the watch.
   */
  public static syncActiveTour(activeTour: ActiveTour | null): void {
    if (!this.isActivated) return;
    try {
      if (!activeTour) {
        WatchConnectivity.updateApplicationContext({ hasActiveTour: false });
        return;
      }

      // Extract current stop details & coordinates if active stop exists
      let currentStopName: string | undefined = undefined;
      let currentStopDescription: string | undefined = undefined;
      let currentStopLatitude: number | undefined = undefined;
      let currentStopLongitude: number | undefined = undefined;
      const tour = activeTour.tour;
      
      // Determine overall stops count
      const totalStops = tour?.stops?.length || 0;
      
      // Find completed stops count from user team currentStop progress (currentStop - 1)
      const userTeam = activeTour.teams?.find(t => t.userId === activeTour.userId);
      const currentStopNumber = userTeam?.currentStop || 1;
      const completedStops = Math.max(0, currentStopNumber - 1);

      // Find current stop info
      if (tour?.stops && tour.stops.length > 0) {
        const nextStop = tour.stops[currentStopNumber - 1] || tour.stops[tour.stops.length - 1];
        currentStopName = nextStop?.name;
        currentStopDescription = nextStop?.description || undefined;
        currentStopLatitude = nextStop?.latitude || undefined;
        currentStopLongitude = nextStop?.longitude || undefined;
      }

      const tourPayload = {
        name: tour?.title || 'Active Tour',
        completedStops,
        totalStops,
        currentStopName,
        currentStopDescription,
        currentStopLatitude,
        currentStopLongitude,
      };

      WatchConnectivity.updateApplicationContext({
        hasActiveTour: true,
        activeTour: tourPayload,
      });
    } catch (error) {
      console.error('Error syncing active tour to Watch:', error);
    }
  }

  /**
   * Syncs the active app theme colors to the watch.
   */
  public static syncTheme(theme: any, mode: string): void {
    if (!this.isActivated) return;
    try {
      WatchConnectivity.updateApplicationContext({
        theme: {
          bgPrimary: theme.bgPrimary,
          bgSecondary: theme.bgSecondary,
          primary: theme.primary,
          secondary: theme.secondary,
          accent: theme.accent || theme.accentColor || '#FFC107',
          mode,
        }
      });
    } catch (error) {
      console.error('Error syncing theme to Watch:', error);
    }
  }

  /**
   * Registers a message listener for messages sent from the Watch to the Phone.
   */
  public static addMessageListener(callback: (message: any) => void): () => void {
    if (!this.isActivated) {
      console.warn('Watch Connectivity is not activated yet. Listener might miss messages.');
    }
    const subscription = WatchConnectivity.addMessageListener((event) => {
      callback(event.message);
    });
    return () => {
      subscription.remove();
    };
  }
}
