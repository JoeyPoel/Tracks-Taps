import { Difficulty } from './models';

export type SortOption = 'name' | 'location' | 'distance' | 'duration' | 'createdAt' | 'popularity' | 'distanceFromUser';
export type SortOrder = 'asc' | 'desc';

export interface TourFilters {
    searchQuery?: string;
    location?: string;
    minDistance?: number;
    maxDistance?: number;
    minDuration?: number;
    maxDuration?: number;
    minRating?: number;
    userLat?: number;
    userLng?: number;
    modes?: string[];
    difficulty?: Difficulty;
    genres?: string[];
    status?: string; // e.g. 'PUBLISHED'
    sortBy?: SortOption;
    sortOrder?: SortOrder;
    page?: number;
    limit?: number;
}
