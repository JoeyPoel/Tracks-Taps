import {
    BriefcaseIcon,
    CameraIcon,
    FireIcon,
    GlobeAltIcon,
    HeartIcon,
    MapIcon,
    MoonIcon,
    MusicalNoteIcon,
    SparklesIcon,
    UserGroupIcon
} from 'react-native-heroicons/solid';

export interface GenreDefinition {
    id: string;
    label: string;
    icon: any;
    color: string;
}

export const GENRES: GenreDefinition[] = [
    {
        id: 'Adventure',
        label: 'Adventure',
        icon: GlobeAltIcon,
        color: '#F59E0B' // Amber
    },
    {
        id: 'History',
        label: 'History',
        icon: BriefcaseIcon,
        color: '#8B5CF6' // Purple
    },
    {
        id: 'Nature',
        label: 'Nature',
        icon: MapIcon,
        color: '#10B981' // Emerald
    },
    {
        id: 'Nightlife',
        label: 'Nightlife',
        icon: MoonIcon,
        color: '#EC4899' // Pink
    },
    {
        id: 'Culture',
        label: 'Culture',
        icon: UserGroupIcon,
        color: '#3B82F6' // Blue
    },
    {
        id: 'Foodie',
        label: 'Food & Drink',
        icon: FireIcon, // Used Fire for popular/hot spots
        color: '#F97316' // Orange
    },
    {
        id: 'Romance',
        label: 'Romance',
        icon: HeartIcon,
        color: '#EF4444' // Red
    },
    {
        id: 'Art',
        label: 'Art & Music',
        icon: MusicalNoteIcon,
        color: '#06B6D4' // Cyan
    },
    {
        id: 'Photography',
        label: 'Photography',
        icon: CameraIcon,
        color: '#6366F1' // Indigo
    },
    {
        id: 'Mystery',
        label: 'Mystery',
        icon: SparklesIcon,
        color: '#8B5CF6' // Violet
    }
];

export const getGenreById = (id: string): GenreDefinition => {
    return GENRES.find(g => g.id === id) || GENRES[0];
};

export const getGenreColor = (id: string): string => {
    return getGenreById(id).color;
};

export const getGenreIcon = (id: string) => {
    return getGenreById(id).icon;
};
