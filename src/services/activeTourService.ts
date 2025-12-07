import client from '../api/client';

export const activeTourService = {
    async getActiveToursForUser(userId: number) {
        const response = await client.get(`/active-tours?userId=${userId}`);
        return response.data;
    },

    async startTour(tourId: number, userId: number, force: boolean = false, teamName?: string, teamColor?: string, teamEmoji?: string) {
        const response = await client.post('/active-tours', { tourId, userId, force, teamName, teamColor, teamEmoji });
        return response.data;
    },

    async joinActiveTour(activeTourId: number, userId: number, teamName?: string, teamColor?: string, teamEmoji?: string) {
        const response = await client.post('/active-tour/join', { activeTourId, userId, teamName, teamColor, teamEmoji });
        return response.data;
    },

    async getActiveTourById(id: number) {
        const response = await client.get(`/active-tour/${id}`);
        return response.data;
    },

    async getActiveTourProgress(id: number, userId?: number) {
        const response = await client.get(`/active-tour/${id}/progress${userId ? `?userId=${userId}` : ''}`);
        return response.data;
    },

    async completeChallenge(activeTourId: number, challengeId: number, userId: number) {
        const response = await client.post('/active-challenge/complete', { activeTourId, challengeId, userId });
        return response.data;
    },

    async failChallenge(activeTourId: number, challengeId: number, userId: number) {
        const response = await client.post('/active-challenge/fail', { activeTourId, challengeId, userId });
        return response.data;
    },

    async finishTour(activeTourId: number, userId: number) {
        const response = await client.post('/active-tour/finish', { activeTourId, userId });
        return response.data;
    },

    async abandonTour(activeTourId: number, userId: number) {
        const response = await client.post('/active-tour/abandon', { activeTourId, userId });
        return response.data;
    },

    async updatePubGolfScore(activeTourId: number, stopId: number, sips: number, userId: number) {
        const response = await client.post('/active-tour/pub-golf', { activeTourId, stopId, sips, userId });
        return response.data;
    },

    async updateCurrentStop(activeTourId: number, currentStop: number, userId: number) {
        const response = await client.post(`/active-tour/${activeTourId}/current-stop`, { activeTourId, currentStop, userId });
        return response.data;
    },
    
    async updateTeamDetails(activeTourId: number, userId: number, name: string, color: string, emoji: string) {
        const response = await client.post('/active-tour/team', { activeTourId, userId, name, color, emoji });
        return response.data;
    },
};
