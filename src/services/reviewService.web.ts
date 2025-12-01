// Mock implementation for Web

const MOCK_REVIEWS = [
    {
        id: 1,
        content: "Great tour! Had a blast.",
        rating: 5,
        createdAt: new Date(),
        author: {
            name: "Alice"
        }
    },
    {
        id: 2,
        content: "Good selection of pubs.",
        rating: 4,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        author: {
            name: "Bob"
        }
    }
];

export const reviewService = {
    async createReview(data: {
        tourId: number;
        userId: number;
        content: string;
        rating: number;
        photos?: string[];
    }) {
        console.log(`[Mock] Creating review for tour ${data.tourId}`);
        const newReview = {
            id: Math.floor(Math.random() * 10000),
            content: data.content,
            rating: data.rating,
            photos: data.photos || [],
            createdAt: new Date(),
            author: {
                name: "Demo User" // Assuming current user
            },
            tourId: data.tourId,
            userId: data.userId
        };
        MOCK_REVIEWS.unshift(newReview);
        return newReview;
    },

    async getReviewsForTour(tourId: number) {
        console.log(`[Mock] Getting reviews for tour ${tourId}`);
        return MOCK_REVIEWS;
    },
};
