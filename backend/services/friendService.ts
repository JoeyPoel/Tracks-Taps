import { friendRepository } from '../repositories/friendRepository';
import { userRepository } from '../repositories/userRepository';

export const friendService = {
    async getFriends(email: string) {
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        const friendships = await friendRepository.findFriendships(user.id);

        // Map to a list of "Friend" objects (the other person)
        return friendships.map(f => {
            if (f.requesterId === user.id) {
                return f.addressee;
            } else {
                return f.requester;
            }
        });
    },

    async getRequests(email: string) {
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        return await friendRepository.findPendingRequests(user.id);
    },

    async sendRequest(requesterEmail: string, targetEmail: string) {
        const requester = await userRepository.getUserByEmail(requesterEmail);
        const target = await userRepository.getUserByEmail(targetEmail);

        if (!requester || !target) {
            throw new Error('User not found');
        }

        if (requester.id === target.id) {
            throw new Error('Cannot add yourself');
        }

        const existing = await friendRepository.findFriendship(requester.id, target.id);
        if (existing) {
            if (existing.status === 'ACCEPTED') {
                throw new Error('Already friends');
            }
            if (existing.status === 'PENDING') {
                throw new Error('Request already pending');
            }
            // If declined/deleted logic existed, handle here.
        }

        return await friendRepository.createFriendship(requester.id, target.id);
    },

    async respondToRequest(requestId: number, action: 'ACCEPT' | 'DECLINE') {
        if (action === 'ACCEPT') {
            return await friendRepository.updateFriendshipStatus(requestId, 'ACCEPTED');
        } else {
            // For decline, typically we remove the pending request or mark declined
            return await friendRepository.deleteFriendship(requestId);
        }
    }
};
