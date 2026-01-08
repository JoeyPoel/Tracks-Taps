import client from '../api/apiClient';

export interface ClaimReferralResponse {
    success: boolean;
    error?: string;
    // Add other fields if returned by the API
}

export const referralService = {
    claimReferral: async (userId: number, code: string): Promise<ClaimReferralResponse> => {
        try {
            const response = await client.post('/user', {
                action: 'claim-referral',
                userId,
                code: code.trim().toUpperCase()
            });
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }
};
