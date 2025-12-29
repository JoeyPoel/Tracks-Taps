import { TourType } from '../types/models';

/**
 * Returns a human-readable label for a given TourType.
 * @param type - The TourType enum value or string.
 * @returns The formatted label (e.g., "Quick Trip (1-3h)").
 */
export const getTourTypeLabel = (type: TourType | string): string => {
    switch (type) {
        case TourType.QUICK_TRIP:
            return 'Quick Trip (1-3h)';
        case TourType.DAY_TRIP:
            return 'Day Trip';
        case TourType.MULTI_DAY:
            return 'Multi-Day';
        case TourType.EXPEDITION:
            return 'Expedition';
        default:
            return type;
    }
};
