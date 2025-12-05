import { create } from 'zustand';
import { activeTourService } from '../services/activeTourService';
import { mapTourService } from '../services/mapTourService';
import { tourService } from '../services/tourService';
import { userService } from '../services/userService';

import { ActiveTour, SessionStatus, Tour, TourDetail, User } from '../types/models';




interface StoreState {
    // Tours Slice
    tours: Tour[];
    tourDetails: { [id: number]: TourDetail }; // Cache by ID
    mapTours: Tour[];
    loadingTours: boolean;
    errorTours: string | null;
    fetchTours: () => Promise<void>;
    fetchAllData: (userId: number) => Promise<void>;
    fetchTourDetails: (id: number, placeholder?: Tour) => Promise<void>;
    fetchMapTours: () => Promise<void>;

    // Active Tours Slice
    activeTours: ActiveTour[];
    activeTour: ActiveTour | null;
    loadingActiveTours: boolean;
    errorActiveTours: string | null;
    fetchActiveTours: (userId: number) => Promise<void>;
    fetchActiveTourById: (id: number) => Promise<void>;
    updateActiveTourLocal: (updates: Partial<ActiveTour>) => void;
    startTour: (tourId: number, userId: number, force?: boolean) => Promise<void>;
    finishTour: (activeTourId: number) => Promise<boolean>;
    abandonTour: (activeTourId: number) => Promise<void>;

    // User Slice
    user: User | null;
    loadingUser: boolean;
    errorUser: string | null;
    fetchUser: (userId: number) => Promise<void>;
    fetchUserByEmail: (email: string) => Promise<void>;
    addXp: (amount: number) => void; // Optimistic update
}

export const useStore = create<StoreState>((set, get) => ({
    // --- Tours Slice ---
    tours: [],
    tourDetails: {},
    mapTours: [],
    loadingTours: false,
    errorTours: null,

    fetchTours: async () => {
        set({ loadingTours: true, errorTours: null });
        try {
            const tours = await tourService.getAllTours();
            set({ tours, loadingTours: false });
        } catch (error: any) {
            set({ errorTours: error.message || 'Failed to fetch tours', loadingTours: false });
        }
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
                promises.push(tourService.getAllTours());
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

    fetchTourDetails: async (id: number, placeholder?: Tour) => {
        // Check cache first
        if (get().tourDetails[id]) return;

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

    fetchMapTours: async () => {
        set({ loadingTours: true, errorTours: null });
        try {
            const tours = await mapTourService.getTours();
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

    fetchActiveTourById: async (id: number) => {
        set({ loadingActiveTours: true, errorActiveTours: null });
        try {
            const activeTour = await activeTourService.getActiveTourById(id);
            set({ activeTour, loadingActiveTours: false });
        } catch (error: any) {
            set({ errorActiveTours: error.message || 'Failed to fetch active tour', loadingActiveTours: false });
        }
    },

    updateActiveTourLocal: (updates: Partial<ActiveTour>) => {
        set((state) => {
            if (!state.activeTour) return {};
            return {
                activeTour: { ...state.activeTour, ...updates }
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

    finishTour: async (activeTourId: number) => {
        try {
            await activeTourService.finishTour(activeTourId);
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

    abandonTour: async (activeTourId: number) => {
        try {
            await activeTourService.abandonTour(activeTourId);
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

    addXp: (amount: number) => {
        set((state) => {
            if (!state.user) return {};
            return {
                user: { ...state.user, xp: state.user.xp + amount }
            };
        });
    }
}));
