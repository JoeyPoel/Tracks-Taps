import { friendRepository } from '../repositories/friendRepository';
import { userRepository } from '../repositories/userRepository';
import { achievementService } from './achievementService';

export const friendService = {
    async getFriends(email: string, page: number = 1, limit: number = 10, userId?: number) {
        let user;
        if (userId) {
            user = await userRepository.getUserProfile(userId);
        } else {
            user = await userRepository.getUserByEmail(email);
        }

        if (!user) {
            throw new Error('User not found');
        }

        const result = await friendRepository.findFriendships(user.id, page, limit);

        // Map to a list of "Friend" objects (the other person)
        const friends = result.data.map(f => {
            if (f.requesterId === user.id) {
                return f.addressee;
            } else {
                return f.requester;
            }
        });

        return {
            data: friends,
            meta: result.meta
        };
    },

    async getRequests(email: string) {
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        return await friendRepository.findPendingRequests(user.id);
    },

    async sendRequest(requesterEmail: string, targetIdentifier: string) {
        const requester = await userRepository.getUserByEmail(requesterEmail);

        // Find target - try username first (case-insensitive)
        let target = await userRepository.getUserByUsername(targetIdentifier);

        // Fallback to email if not found and identifier looks like an email
        // This handles users without usernames who are added from search
        if (!target && targetIdentifier.includes('@')) {
            target = await userRepository.getUserByEmail(targetIdentifier);
        }

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
        }

        return await friendRepository.createFriendship(requester.id, target.id);
    },

    async removeFriend(userEmail: string, friendId: number) {
        const user = await userRepository.getUserByEmail(userEmail);
        if (!user) throw new Error('User not found');

        const friendship = await friendRepository.findFriendship(user.id, friendId);
        if (!friendship) throw new Error('Friendship not found');

        return await friendRepository.deleteFriendship(friendship.id);
    },

    async respondToRequest(requestId: number, action: 'ACCEPT' | 'DECLINE') {
        if (action === 'ACCEPT') {
            await friendRepository.updateRequestStatus(requestId, 'ACCEPTED');
            // Check achievements for BOTH users
            const request = await friendRepository.getRequestById(requestId);
            if (request) {
                await achievementService.checkFriendCount(request.requesterId);
                await achievementService.checkFriendCount(request.addresseeId);
            }
            return { message: 'Friend request accepted' };
        } else {
            // For decline, typically we remove the pending request or mark declined
            return await friendRepository.deleteFriendship(requestId);
        }
    },

    async checkFriendshipStatus(userEmail: string, otherUserId: number) {
        const user = await userRepository.getUserByEmail(userEmail);
        if (!user) return null;

        const friendship = await friendRepository.findFriendship(user.id, otherUserId);
        return friendship ? (friendship.status as any) : null;
    }
};
