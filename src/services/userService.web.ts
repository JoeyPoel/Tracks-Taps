// Mock implementation for Web
import { SessionStatus } from '../types/models';

const MOCK_USER_FULL = {
    id: 1,
    name: "Demo User",
    email: "demo@example.com",
    level: 5,
    xp: 1200,
    tokens: 50,
    participations: [
        {
            id: 1,
            tourId: 1,
            userId: 1,
            status: SessionStatus.IN_PROGRESS,
            tour: {
                id: 1,
                title: "London Pub Golf",
                imageUrl: "https://images.unsplash.com/photo-1546622891-02c72c1537b6?q=80&w=2070&auto=format&fit=crop",
            }
        }
    ],
    createdTours: []
};

export const userService = {
    async getUserProfile(userId: number) {
        console.log(`[Mock] Getting user profile ${userId}`);
        return MOCK_USER_FULL;
    },

    async getUserByEmail(email: string) {
        console.log(`[Mock] Getting user by email ${email}`);
        return MOCK_USER_FULL;
    },
};
