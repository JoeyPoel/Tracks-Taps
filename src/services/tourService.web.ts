// Mock implementation for Web (GitHub Pages)
// Since we can't run Prisma/Postgres in the browser

import { ChallengeType, Difficulty, SessionStatus, Stop, User } from '../types/models';

// Mock Data
const MOCK_USER: User = {
    id: 1,
    name: "Demo User",
    email: "demo@example.com",
    level: 5,
    xp: 1200,
    tokens: 50,
    createdAt: new Date(),
    updatedAt: new Date()
};

// Define an extended Stop type that includes challenges, as the mock data has them
interface MockStop extends Stop {
    challenges: any[]; // Using any to simplify for now, or define a MockChallenge type
}

const MOCK_STOPS: any[] = [
    {
        id: 1,
        tourId: 1,
        number: 1,
        name: "The Old Bell",
        description: "A historic pub with great atmosphere.",
        latitude: 51.5074,
        longitude: -0.1278,
        order: 1,
        image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop",
        pubgolfPar: 3,
        pubgolfDrink: "Pint of Lager",
        createdAt: new Date(),
        updatedAt: new Date(),
        challenges: [
            {
                id: 1,
                title: "Pub Trivia",
                description: "Answer a question about the pub.",
                type: ChallengeType.TRIVIA,
                question: "What year was this pub established?",
                content: "What year was this pub established?",
                answer: "1750",
                options: ["1750", "1800", "1650", "1900"],
                points: 50,
                createdAt: new Date(),
                updatedAt: new Date(),
                tourId: 1,
                stopId: 1
            }
        ]
    },
    {
        id: 2,
        tourId: 1,
        number: 2,
        name: "The Crown",
        description: "Famous for its ales.",
        latitude: 51.5080,
        longitude: -0.1280,
        order: 2,
        image: "https://images.unsplash.com/photo-1538488881038-e252a119ace7?q=80&w=2070&auto=format&fit=crop",
        pubgolfPar: 4,
        pubgolfDrink: "Glass of Wine",
        createdAt: new Date(),
        updatedAt: new Date(),
        challenges: [
            {
                id: 2,
                title: "Check-in",
                description: "Check in at the location.",
                type: ChallengeType.CHECK_IN,
                question: "Check in at The Crown",
                content: "Check in at The Crown",
                answer: null,
                options: [],
                points: 30,
                createdAt: new Date(),
                updatedAt: new Date(),
                tourId: 1,
                stopId: 2
            }
        ]
    },
    {
        id: 3,
        tourId: 1,
        number: 3,
        name: "The Lion's Head",
        description: "Live music and good vibes.",
        latitude: 51.5090,
        longitude: -0.1290,
        order: 3,
        image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=1974&auto=format&fit=crop",
        pubgolfPar: 5,
        pubgolfDrink: "Double G&T",
        createdAt: new Date(),
        updatedAt: new Date(),
        challenges: []
    }
];

const MOCK_TOURS: any[] = [
    {
        id: 1,
        title: "London Pub Golf",
        description: "Experience the finest pubs in central London with this classic Pub Golf course.",
        location: "London, UK",
        distance: 2.5,
        duration: 120,
        points: 500,
        difficulty: Difficulty.MEDIUM,
        imageUrl: "https://images.unsplash.com/photo-1546622891-02c72c1537b6?q=80&w=2070&auto=format&fit=crop",
        author: { name: "Tracks & Taps Team" },
        authorId: 1,
        stops: MOCK_STOPS,
        _count: { stops: 3 },
        challenges: [],
        modes: ["WALKING"],
        challengesCount: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        reviews: [
            {
                id: 1,
                rating: 5,
                content: "Great fun!",
                createdAt: new Date(),
                updatedAt: new Date(),
                photos: [],
                tourId: 1,
                authorId: 2,
                author: { name: "Alice" }
            }
        ]
    },
    {
        id: 2,
        title: "Historic City Walk",
        description: "A scenic tour through the historic district.",
        location: "City Center",
        distance: 4.0,
        duration: 180,
        points: 800,
        difficulty: Difficulty.EASY,
        imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop",
        author: { name: "City Guides" },
        authorId: 1,
        stops: [],
        _count: { stops: 0 },
        challenges: [],
        modes: ["WALKING"],
        challengesCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        reviews: []
    }
];

// Mock Active Tour State
let mockActiveTours: any[] = [
    {
        id: 1,
        tourId: 1,
        userId: 1,
        status: SessionStatus.IN_PROGRESS,
        currentStopIndex: 0,
        progress: 0,
        startTime: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        tour: MOCK_TOURS[0],
        activeChallenges: [],
        participants: [MOCK_USER],
        pubGolfStops: []
    }
];

export const tourService = {
    async getAllTours() {
        console.log("[Mock] Getting all tours");
        return MOCK_TOURS;
    },

    async getTourById(id: number) {
        console.log(`[Mock] Getting tour ${id}`);
        return MOCK_TOURS.find(t => t.id === id) || null;
    },

    async getActiveToursForUser(userId: number) {
        console.log(`[Mock] Getting active tours for user ${userId}`);
        return mockActiveTours.filter((at) =>
            at.participants.some((p: User) => p.id === userId) &&
            (at.status === SessionStatus.IN_PROGRESS || at.status === SessionStatus.WAITING)
        );
    },

    async startTour(tourId: number, userId: number) {
        console.log(`[Mock] Starting tour ${tourId} for user ${userId}`);
        const tour = MOCK_TOURS.find(t => t.id === tourId);
        if (!tour) throw new Error("Tour not found");

        const newActiveTour = {
            id: Math.floor(Math.random() * 10000),
            tourId,
            userId,
            status: SessionStatus.IN_PROGRESS,
            currentStopIndex: 0,
            progress: 0,
            startTime: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            tour: tour,
            activeChallenges: [],
            participants: [MOCK_USER],
            pubGolfStops: []
        };
        mockActiveTours.push(newActiveTour);
        return newActiveTour;
    },

    async getActiveTourById(id: number) {
        console.log(`[Mock] Getting active tour ${id}`);
        return mockActiveTours.find(at => at.id === id) || null;
    },

    async completeChallenge(activeTourId: number, challengeId: number) {
        console.log(`[Mock] Completing challenge ${challengeId} for active tour ${activeTourId}`);
        const activeTour = mockActiveTours.find(at => at.id === activeTourId);
        if (activeTour) {
            // Check if already exists
            const existing = activeTour.activeChallenges.find((ac: any) => ac.challengeId === challengeId);
            if (existing) {
                existing.completed = true;
                existing.completedAt = new Date();
                return existing;
            } else {
                const newChallenge = {
                    id: Math.floor(Math.random() * 10000),
                    activeTourId,
                    challengeId,
                    completed: true,
                    completedAt: new Date(),
                    failed: false,
                    challenge: (MOCK_STOPS.flatMap(s => s.challenges).find(c => c.id === challengeId) as any)
                };
                activeTour.activeChallenges.push(newChallenge as any);
                return newChallenge;
            }
        }
        return null;
    },

    async failChallenge(activeTourId: number, challengeId: number) {
        console.log(`[Mock] Failing challenge ${challengeId}`);
        const activeTour = mockActiveTours.find(at => at.id === activeTourId);
        if (activeTour) {
            const newChallenge = {
                id: Math.floor(Math.random() * 10000),
                activeTourId,
                challengeId,
                completed: false,
                failed: true,
                challenge: (MOCK_STOPS.flatMap(s => s.challenges).find(c => c.id === challengeId) as any)
            };
            activeTour.activeChallenges.push(newChallenge as any);
            return newChallenge;
        }
        return null;
    },

    async deleteActiveTour(activeTourId: number) {
        console.log(`[Mock] Deleting active tour ${activeTourId}`);
        mockActiveTours = mockActiveTours.filter(at => at.id !== activeTourId);
        return { id: activeTourId };
    },

    async finishTour(activeTourId: number) {
        console.log(`[Mock] Finishing tour ${activeTourId}`);
        const activeTour = mockActiveTours.find(at => at.id === activeTourId);
        if (activeTour) {
            activeTour.status = SessionStatus.COMPLETED;
        }
        return activeTour;
    },

    async abandonTour(activeTourId: number) {
        console.log(`[Mock] Abandoning tour ${activeTourId}`);
        const activeTour = mockActiveTours.find(at => at.id === activeTourId);
        if (activeTour) {
            activeTour.status = SessionStatus.ABANDONED;
        }
        return activeTour;
    }
};
