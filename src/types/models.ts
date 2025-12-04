// Shared type definitions to replace @prisma/client imports in frontend code

export enum SessionStatus {
    WAITING = 'WAITING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    ABANDONED = 'ABANDONED'
}

export enum Difficulty {
    EASY = 'EASY',
    MEDIUM = 'MEDIUM',
    HARD = 'HARD'
}

export enum ChallengeType {
    LOCATION = 'LOCATION',
    TRIVIA = 'TRIVIA',
    CHECK_IN = 'CHECK_IN'
}

export interface Stop {
    id: number;
    tourId: number;
    number: number;
    name: string;
    description: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
    longitude: number;
    latitude: number;
    pubgolfPar: number | null;
    pubgolfDrink: string | null;
    challenges?: Challenge[];
}

export interface Tour {
    id: number;
    title: string;
    location: string;
    description: string;
    imageUrl: string;
    distance: number;
    duration: number;
    points: number;
    modes: string[];
    difficulty: Difficulty | string;
    challengesCount: number;
    createdAt: Date;
    updatedAt: Date;
    authorId: number;
    author?: {
        name: string;
    };
    stops?: Stop[];
    _count?: {
        stops: number;
    };
}

export interface User {
    id: number;
    email: string;
    name: string;
    level: number;
    xp: number;
    tokens: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Challenge {
    id: number;
    title: string;
    description: string;
    type: ChallengeType;
    points: number;
    content: string | null;
    answer: string | null;
    options: string[];
    createdAt: Date;
    updatedAt: Date;
    tourId: number | null;
    stopId: number | null;
}

export interface ActiveTour {
    id: number;
    tourId: number;
    status: SessionStatus;
    createdAt: Date;
    updatedAt: Date;
    tour?: Tour;
    activeChallenges?: ActiveChallenge[];
    pubGolfStops?: PubGolfStop[];
}

export interface PubGolfStop {
    id: number;
    activeTourId: number;
    stopId: number;
    par: number;
    drink: string;
    sips: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ActiveChallenge {
    id: number;
    activeTourId: number;
    challengeId: number;
    completed: boolean;
    completedAt: Date | null;
    failed: boolean;
}

export interface Review {
    id: number;
    content: string;
    rating: number;
    photos: string[];
    createdAt: Date;
    updatedAt: Date;
    tourId: number;
    authorId: number;
}
