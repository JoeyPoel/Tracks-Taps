import client from '@/src/api/apiClient';

export const feedbackService = {
    async submitFeedback(data: {
        userId: number;
        rating: number;
        source: string;
        tourId?: number;
        feedback?: string;
        metadata?: any;
    }) {
        const response = await client.post('/feedback', data);
        return response.data;
    }
};

