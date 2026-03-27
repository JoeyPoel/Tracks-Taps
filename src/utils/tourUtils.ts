import { TourType } from '../types/models';

/**
 * Returns a human-readable label for a given TourType.
 * @param type - The TourType enum value or string.
 * @param t - Optional translation function.
 * @returns The formatted label (e.g., "Quick Trip (1-3h)").
 */
export const getTourTypeLabel = (type: TourType | string, t?: (key: any) => string): string => {
    if (t) {
        const translated = t(type as any);
        // If translation exists and is not the key itself, return it
        if (translated && translated !== type) {
            return translated;
        }
    }

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
