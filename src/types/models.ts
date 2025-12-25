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
    PICTURE = 'PICTURE',
    TRUE_FALSE = 'TRUE_FALSE',
    DARE = 'DARE',
    RIDDLE = 'RIDDLE',
    CHECK_IN = 'CHECK_IN' // Keeping CHECK_IN if used legacy, but aligning with schema
}

export enum StopType {
    Food_Dining = 'Food_Dining',
    Coffee_Drink = 'Coffee_Drink',
    Nightlife = 'Nightlife',
    Museum_Art = 'Museum_Art',
    Monument_Landmark = 'Monument_Landmark',
    Religious = 'Religious',
    Nature_Park = 'Nature_Park',
    Shopping = 'Shopping',
    Transit_Stop = 'Transit_Stop',
    Viewpoint = 'Viewpoint',
    Info_Point = 'Info_Point',
    Facilities = 'Facilities'
}

export interface Stop {
    id: number;
    tourId: number;
    number: number;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    longitude: number;
    latitude: number;
    type: StopType;
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
    genre: string; // New field
    createdAt: Date;
    updatedAt: Date;
    authorId: number;
    author?: {
        name: string;
    };
    stops?: Stop[];
    challenges?: Challenge[];
    reviews?: Review[];
    _count?: {
        stops: number;
    };
}

export interface User {
    id: number;
    email: string;
    name: string;
    avatarUrl?: string;
    level: number;
    xp: number;
    tokens: number;
    createdAt: Date;
    updatedAt: Date;
    teams?: {
        id: number;
        finishedAt: Date | null;
        activeTour: {
            status: string;
        };
    }[];
    createdTours?: {
        id: number;
        title: string;
    }[];
    playedTours?: {
        id: number;
        status: SessionStatus;
        score: number;
    }[];
}

export interface Challenge {
    id: number;
    title: string;
    description: string;
    type: ChallengeType;
    points: number;
    content: string | null;
    hint: string | null;
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
    teams?: Team[];
    winnerTeamId?: number;
}

export interface Team {
    id: number;
    activeTourId: number;
    userId: number;
    name: string;
    color: string;
    emoji: string;
    currentStop: number;
    streak: number;
    score: number;
    finishedAt: Date | null;
    activeChallenges?: ActiveChallenge[];
    pubGolfStops?: PubGolfStop[];
    user?: User;
}

export interface PubGolfStop {
    id: number;
    teamId: number;
    stopId: number;
    sips: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ActiveChallenge {
    id: number;
    teamId: number;
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
    author: {
        name: string;
        avatar?: string;
    };
}

export interface TourDetail extends Tour {
    reviews: Review[];
    stops: Stop[];
    challenges: Challenge[];
    author: {
        name: string;
    };
}
