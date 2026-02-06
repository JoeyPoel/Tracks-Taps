import { OfflineAction, offlineStorage } from '../utils/offlineStorage';
import { activeTourService } from './activeTourService';

export const syncService = {
    isSyncing: false,

    async syncPendingActions() {
        if (this.isSyncing) return;
        this.isSyncing = true;

        console.log('[SyncService] Checking for pending actions...');

        try {
            const queue = await offlineStorage.getQueue();
            if (queue.length === 0) {
                console.log('[SyncService] No actions to sync.');
                this.isSyncing = false;
                return;
            }

            console.log(`[SyncService] Found ${queue.length} actions. Processing...`);

            // Process one by one (FIFO) to maintain order
            for (const action of queue) {
                let success = false;
                try {
                    await this.processAction(action);
                    success = true;
                } catch (error: any) {
                    console.error(`[SyncService] Action ${action.type} failed:`, error);

                    // Logic: If 4xx error (Bad Request, Unauthorized), remove it to avoid blocking queue forever.
                    // If Network/5xx, keep it.
                    const status = error.response?.status;
                    if (status && status >= 400 && status < 500) {
                        console.warn(`[SyncService] Removing invalid action ${action.id} due to ${status} error.`);
                        await offlineStorage.removeAction(action.id);
                    } else {
                        // Stop processing further actions to ensure sequence dependence (e.g. Stop 1 before Stop 2)
                        // If one fails due to network, likely all follow-ups will fail.
                        this.isSyncing = false;
                        return;
                    }
                }

                if (success) {
                    await offlineStorage.removeAction(action.id);
                    console.log(`[SyncService] Action ${action.type} (ID: ${action.id}) synced successfully.`);
                }
            }
        } catch (error) {
            console.error('[SyncService] Sync failed globally', error);
        } finally {
            this.isSyncing = false;
        }
    },

    async processAction(action: OfflineAction) {
        const { type, payload, activeTourId } = action;

        // Ensure userId is present if needed. Most calls need it.
        // Assuming payload has it.

        switch (type) {
            case 'COMPLETE_CHALLENGE':
                await activeTourService.completeChallenge(activeTourId, payload.challengeId, payload.userId);
                break;
            case 'FAIL_CHALLENGE':
                await activeTourService.failChallenge(activeTourId, payload.challengeId, payload.userId);
                break;
            case 'UPDATE_CURRENT_STOP':
                await activeTourService.updateCurrentStop(activeTourId, payload.currentStop, payload.userId);
                break;
            case 'UPDATE_PUB_GOLF':
                await activeTourService.updatePubGolfScore(activeTourId, payload.stopId, payload.sips, payload.userId);
                break;
            case 'FINISH_TOUR':
                await activeTourService.finishTour(activeTourId, payload.userId);
                break;
            default:
                console.warn(`[SyncService] Unknown action type: ${type}`);
                break;
        }
    }
};
