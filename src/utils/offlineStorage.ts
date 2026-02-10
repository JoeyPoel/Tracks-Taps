import AsyncStorage from '@react-native-async-storage/async-storage';

export const OFFLINE_TOUR_KEY_PREFIX = 'offline_active_tour_';
export const PENDING_ACTIONS_KEY = 'offline_pending_actions';

export interface OfflineAction {
    id: string; // UUID or timestamp
    type: 'COMPLETE_CHALLENGE' | 'FAIL_CHALLENGE' | 'UPDATE_CURRENT_STOP' | 'UPDATE_PUB_GOLF' | 'FINISH_TOUR';
    payload: any;
    timestamp: number;
    activeTourId: number;
}

export const offlineStorage = {
    // --- Tour State ---
    async saveActiveTour(activeTour: any) {
        if (!activeTour || !activeTour.id) return;
        try {
            await AsyncStorage.setItem(`${OFFLINE_TOUR_KEY_PREFIX}${activeTour.id}`, JSON.stringify(activeTour));
        } catch (e) {
            console.error('Failed to save offline tour', e);
        }
    },

    async getActiveTour(activeTourId: number) {
        try {
            const json = await AsyncStorage.getItem(`${OFFLINE_TOUR_KEY_PREFIX}${activeTourId}`);
            return json ? JSON.parse(json) : null;
        } catch (e) {
            console.error('Failed to load offline tour', e);
            return null;
        }
    },

    // --- Action Queue ---
    async getQueue(): Promise<OfflineAction[]> {
        try {
            const json = await AsyncStorage.getItem(PENDING_ACTIONS_KEY);
            return json ? JSON.parse(json) : [];
        } catch {
            return [];
        }
    },

    async addAction(action: Omit<OfflineAction, 'id' | 'timestamp'>) {
        try {
            const queue = await this.getQueue();
            const newAction: OfflineAction = {
                ...action,
                id: Date.now().toString() + Math.random().toString(),
                timestamp: Date.now()
            };
            queue.push(newAction);
            await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(queue));
            return newAction;
        } catch (e) {
            console.error('Failed to add offline action', e);
        }
    },

    async removeAction(id: string) {
        try {
            const queue = await this.getQueue();
            const newQueue = queue.filter(a => a.id !== id);
            await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(newQueue));
        } catch (e) {
            console.error('Failed to remove offline action', e);
        }
    },

    async clearQueue() {
        await AsyncStorage.removeItem(PENDING_ACTIONS_KEY);
    }
};
