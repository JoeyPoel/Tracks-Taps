export interface Tour {
    id: number;
    title: string;
    location: string;
    description: string;
    stops: number;
    author: string;
    imageUrl: string;
    distance: string;
    duration: string;
    points: number;
    modes: string[];
    difficulty?: string;
    challengesCount: number;
}