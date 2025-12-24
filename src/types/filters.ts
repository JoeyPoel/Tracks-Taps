import { Difficulty } from './models';

export type SortOption = 'name' | 'location' | 'distance' | 'duration' | 'createdAt' | 'popularity';
export type SortOrder = 'asc' | 'desc';

export interface TourFilters {
    searchQuery?: string;
    location?: string;
    minDistance?: number;
    maxDistance?: number;
    minDuration?: number;
    maxDuration?: number;
    modes?: string[];
    difficulty?: Difficulty;
    genres?: string[];
    sortBy?: SortOption;
    sortOrder?: SortOrder;
    page?: number;
    limit?: number;
}
