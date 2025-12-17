import { create } from 'zustand';
import { activeTourService } from '../services/activeTourService';
import { mapTourService } from '../services/mapTourService';
import { tourService } from '../services/tourService';
import { userService } from '../services/userService';

import { TourFilters } from '../types/filters';
import { ActiveTour, SessionStatus, Tour, TourDetail, User } from '../types/models';
import { LevelSystem } from '../utils/levelUtils';




interface StoreState {
    // Tours Slice
    tours: Tour[];
    tourFilters: TourFilters;
    setTourFilters: (filters: TourFilters) => void;
    tourDetails: { [id: number]: TourDetail }; // Cache by ID
    mapTours: Tour[];
    loadingTours: boolean;
    errorTours: string | null;
    fetchTours: () => Promise<void>;
    fetchAllData: (userId: number) => Promise<void>;
    fetchTourDetails: (id: number, placeholder?: Tour, force?: boolean) => Promise<void>;
    fetchMapTours: (bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => Promise<void>;

    // Active Tours Slice
    activeTours: ActiveTour[];
    activeTour: ActiveTour | null;
    loadingActiveTours: boolean;
    errorActiveTours: string | null;
    fetchActiveTours: (userId: number) => Promise<void>;
    fetchActiveTourById: (id: number, userId?: number) => Promise<void>;
    fetchActiveTourProgress: (id: number, userId?: number) => Promise<void>;
    fetchActiveTourLobby: (id: number) => Promise<void>;
    updateActiveTourLocal: (updates: Partial<ActiveTour>) => void;
    startTour: (tourId: number, userId: number, force?: boolean) => Promise<void>;
    finishTour: (activeTourId: number, userId: number) => Promise<boolean>;
    abandonTour: (activeTourId: number, userId: number) => Promise<void>;

    // User Slice
    user: User | null;
    loadingUser: boolean;
    errorUser: string | null;
    fetchUser: (userId: number) => Promise<void>;
    fetchUserByEmail: (email: string) => Promise<void>;
    updateUser: (userId: number, data: { name?: string; avatarUrl?: string }) => Promise<void>;
    addXp: (amount: number) => void; // Optimistic update
    clearUser: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
    // --- Tours Slice ---
    tours: [],
    tourFilters: {},
    tourDetails: {},
    mapTours: [],
    loadingTours: false,
    errorTours: null,

    fetchTours: async () => {
        set({ loadingTours: true, errorTours: null });
        try {
            const tours = await tourService.getAllTours(get().tourFilters);
            if (Array.isArray(tours)) {
                set({ tours, loadingTours: false });
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error: any) {
            set({ errorTours: error.message || 'Failed to fetch tours', loadingTours: false });
        }
    },

    setTourFilters: (filters: TourFilters) => {
        set({ tourFilters: filters });
        get().fetchTours();
    },

    fetchAllData: async (userId: number) => {
        const state = get();
        const shouldFetchTours = state.tours.length === 0;

        set({
            loadingTours: shouldFetchTours,
            loadingActiveTours: true,
            errorTours: null,
            errorActiveTours: null
        });

        try {
            const promises: Promise<any>[] = [
                activeTourService.getActiveToursForUser(userId)
            ];

            if (shouldFetchTours) {
                promises.push(tourService.getAllTours(get().tourFilters));
            }

            const results = await Promise.all(promises);
            const activeTours = results[0];
            const tours = shouldFetchTours ? results[1] : state.tours;

            set({ tours, activeTours, loadingTours: false, loadingActiveTours: false });
        } catch (error: any) {
            console.error("Failed to fetch all data", error);
            set({
                errorTours: error.message || 'Failed to fetch data',
                errorActiveTours: error.message || 'Failed to fetch data',
                loadingTours: false,
                loadingActiveTours: false
            });
        }
    },

    fetchTourDetails: async (id: number, placeholder?: Tour, force?: boolean) => {
        // Check cache first if not forced
        if (!force && get().tourDetails[id]) return;

        // If placeholder provided, set it immediately to allow instant navigation
        if (placeholder) {
            const placeholderDetail: TourDetail = {
                ...placeholder,
                reviews: [],
                stops: [],
                challenges: [],
                author: placeholder.author || { name: 'Unknown' }
            };
            set((state) => ({
                tourDetails: { ...state.tourDetails, [id]: placeholderDetail }
            }));
        } else {
            // Only set loading if no placeholder (e.g. deep link)
            set({ loadingTours: true, errorTours: null });
        }

        try {
            const tour = await tourService.getTourById(id);
            set((state) => ({
                tourDetails: { ...state.tourDetails, [id]: tour },
                loadingTours: false
            }));
        } catch (error: any) {
            set({ errorTours: error.message || 'Failed to fetch tour details', loadingTours: false });
        }
    },

    fetchMapTours: async (bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => {
        set({ loadingTours: true, errorTours: null });
        try {
            const tours = await mapTourService.getTours(bounds);
            set({ mapTours: tours, loadingTours: false });
        } catch (error: any) {
            set({ errorTours: error.message || 'Failed to fetch map tours', loadingTours: false });
        }
    },

    // --- Active Tours Slice ---
    activeTours: [],
    activeTour: null,
    loadingActiveTours: false,
    errorActiveTours: null,

    fetchActiveTours: async (userId: number) => {
        set({ loadingActiveTours: true, errorActiveTours: null });
        try {
            const activeTours = await activeTourService.getActiveToursForUser(userId);
            set({ activeTours, loadingActiveTours: false });
        } catch (error: any) {
            set({ errorActiveTours: error.message || 'Failed to fetch active tours', loadingActiveTours: false });
        }
    },

    fetchActiveTourById: async (id: number, userId?: number) => {
        const state = get();
        // Avoid re-fetching if we already have the correct active tour loaded
        if (state.activeTour?.id === id && !state.errorActiveTours) {
            return;
        }

        set({ loadingActiveTours: true, errorActiveTours: null });
        try {
            const activeTour = await activeTourService.getActiveTourById(id);
            if (!activeTour) {
                set({ errorActiveTours: 'Tour not found', loadingActiveTours: false, activeTour: null });
            } else {
                set({ activeTour, loadingActiveTours: false });
            }
        } catch (error: any) {
            set({ errorActiveTours: error.message || 'Failed to fetch active tour', loadingActiveTours: false });
        }
    },

    fetchActiveTourProgress: async (id: number, userId?: number) => {
        // Do not set global loading for lightweight updates
        try {
            const updatedProgress = await activeTourService.getActiveTourProgress(id, userId);
            get().updateActiveTourLocal(updatedProgress);
        } catch (error: any) {
            console.error('Failed to update active tour progress', error);
        }
    },

    fetchActiveTourLobby: async (id: number) => {
        try {
            const updatedLobby = await activeTourService.getActiveTourLobby(id);
            get().updateActiveTourLocal(updatedLobby);
        } catch (error: any) {
            console.error('Failed to update active tour lobby', error);
        }
    },

    updateActiveTourLocal: (updates: Partial<ActiveTour>) => {
        set((state) => {
            if (!state.activeTour) return {};

            let finalTeams = state.activeTour.teams || [];
            if (updates.teams && updates.teams.length > 0) {
                const updatesMap = new Map(updates.teams.map(t => [t.id, t]));
                // Update existing
                finalTeams = finalTeams.map(t => updatesMap.get(t.id) || t);
                // Add new
                const existingIds = new Set(finalTeams.map(t => t.id));
                const newTeams = updates.teams.filter(t => !existingIds.has(t.id));
                finalTeams = [...finalTeams, ...newTeams];
            }

            // Remove teams from updates to avoid overwriting the merged array
            const { teams, ...otherUpdates } = updates;

            return {
                activeTour: {
                    ...state.activeTour,
                    ...otherUpdates,
                    teams: finalTeams,
                    tour: state.activeTour.tour // Ensure tour is kept
                }
            };
        });
    },

    startTour: async (tourId: number, userId: number, force = false) => {
        set({ loadingActiveTours: true, errorActiveTours: null });
        try {
            await activeTourService.startTour(tourId, userId, force);
            // Refresh active tours
            await get().fetchActiveTours(userId);
            set({ loadingActiveTours: false });
        } catch (error: any) {
            set({ errorActiveTours: error.message || 'Failed to start tour', loadingActiveTours: false });
            throw error; // Re-throw to let component handle specific UI logic (like showing conflict dialog)
        }
    },

    finishTour: async (activeTourId: number, userId: number) => {
        try {
            await activeTourService.finishTour(activeTourId, userId);
            // Update local state
            set((state) => {
                if (state.activeTour && state.activeTour.id === activeTourId) {
                    return { activeTour: { ...state.activeTour, status: SessionStatus.COMPLETED } };
                }
                return {};
            });
            return true;
        } catch (error) {
            console.error('Failed to finish tour', error);
            return false;
        }
    },

    abandonTour: async (activeTourId: number, userId: number) => {
        try {
            await activeTourService.abandonTour(activeTourId, userId);
            // Update local state
            set((state) => {
                if (state.activeTour && state.activeTour.id === activeTourId) {
                    return { activeTour: { ...state.activeTour, status: SessionStatus.ABANDONED } };
                }
                return {};
            });
        } catch (error) {
            console.error('Failed to abandon tour', error);
        }
    },

    // --- User Slice ---
    user: null,
    loadingUser: false,
    errorUser: null,

    fetchUser: async (userId: number) => {
        set({ loadingUser: true, errorUser: null });
        try {
            const user = await userService.getUserProfile(userId);
            set({ user, loadingUser: false });
        } catch (error: any) {
            set({ errorUser: error.message || 'Failed to fetch user', loadingUser: false });
        }
    },

    fetchUserByEmail: async (email: string) => {
        set({ loadingUser: true, errorUser: null });
        try {
            const user = await userService.getUserByEmail(email);
            set({ user, loadingUser: false });
        } catch (error: any) {
            set({ errorUser: error.message || 'Failed to fetch user', loadingUser: false });
        }
    },

    updateUser: async (userId: number, data: { name?: string; avatarUrl?: string }) => {
        set({ loadingUser: true, errorUser: null });
        try {
            const user = await userService.updateUser(userId, data);
            set({ user, loadingUser: false });
        } catch (error: any) {
            set({ errorUser: error.message || 'Failed to update user', loadingUser: false });
            throw error;
        }
    },

    addXp: (amount: number) => {
        set((state) => {
            if (!state.user) return {};
            const newXp = state.user.xp + amount;
            const newLevel = LevelSystem.getLevel(newXp);
            return {
                user: {
                    ...state.user,
                    xp: newXp,
                    level: newLevel
                }
            };
        });
    },

    clearUser: () => {
        set({ user: null, activeTours: [], activeTour: null });
    }
}));
