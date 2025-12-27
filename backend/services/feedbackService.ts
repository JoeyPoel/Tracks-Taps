import { feedbackRepository } from '../repositories/feedbackRepository';
import { userService } from './userService';

export const feedbackService = {
    async submitFeedback(data: {
        userId: number;
        rating: number;
        source: string;
        tourId?: number;
        feedback?: string;
        metadata?: any;
    }) {
        const result = await feedbackRepository.create(data);

        // 1. Gamification: Award XP (Business Logic)
        try {
            // Check if user exists happens in auth/repo, but good to be safe or just fire and forget
            await userService.addXp(data.userId, 10);
            console.log(`[GAMIFICATION] Awarded 10 XP to user ${data.userId} for feedback.`);
        } catch (error) {
            console.error('Failed to award XP for feedback:', error);
            // Don't fail the main request just because gamification failed
        }

        // 2. Monitoring: Alert on Low Ratings (Business Logic)
        if (data.rating <= 2) {
            console.warn(`[ADMIN ALERT] Low rating (${data.rating}/5) received from user ${data.userId}! Context: ${data.source}`);
            if (data.feedback) {
                console.warn(`[ADMIN ALERT] Feedback content: "${data.feedback}"`);
            }
            // In a real production app, this would trigger an email/Slack webhoook via a notificationService
        }

        return result;
    }
};

