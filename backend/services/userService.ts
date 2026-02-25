import { randomInt } from 'crypto';
import { LevelSystem } from '../../src/utils/levelUtils';
import { userRepository } from '../repositories/userRepository';
import { friendService } from './friendService';

export const userService = {
    async getUserIdByEmail(email: string) {
        return await userRepository.getUserIdByEmail(email);
    },

    async getUserProfile(userId: number) {
        const user = await userRepository.getUserProfile(userId);
        if (user) {
            // Check if referral code needs backfilling
            if (!user.referralCode) {
                const referralCode = randomInt(100000000, 1000000000).toString();
                // We update it in the background/sync
                await userRepository.updateUser(user.id, { referralCode });
                user.referralCode = referralCode;
            }

            // Get friend count
            const friendsResult = await friendService.getFriends('', 1, 1, user.id);
            const friendCount = friendsResult.meta.total;

            const { _count, ...rest } = user as any;
            return {
                ...rest,
                level: LevelSystem.getLevel(user.xp),
                stats: {
                    toursDone: _count?.playedTours || 0,
                    toursCreated: _count?.createdTours || 0,
                    friends: friendCount
                }
            };
        }
        return user;
    },

    async getUserByEmail(email: string) {
        const user = await userRepository.getUserByEmail(email);
        if (user) {
            // Check if referral code needs backfilling
            if (!user.referralCode) {
                const referralCode = randomInt(100000000, 1000000000).toString();
                await userRepository.updateUser(user.id, { referralCode });
                user.referralCode = referralCode;
            }

            // Get friend count
            const friendsResult = await friendService.getFriends('', 1, 1, user.id);
            const friendCount = friendsResult.meta.total;

            const { _count, ...rest } = user as any;
            return {
                ...rest,
                level: LevelSystem.getLevel(user.xp),
                stats: {
                    toursDone: _count?.playedTours || 0,
                    toursCreated: _count?.createdTours || 0,
                    friends: friendCount
                }
            };
        }
        return user;
    },

    async getUserByUsername(username: string) {
        const user = await userRepository.getUserByUsername(username);
        if (user) {
            // Get friend count
            const friendsResult = await friendService.getFriends('', 1, 1, user.id);
            const friendCount = friendsResult.meta.total;

            const { _count, ...rest } = user as any;
            return {
                ...rest,
                level: LevelSystem.getLevel(user.xp),
                stats: {
                    toursDone: _count?.playedTours || 0,
                    toursCreated: _count?.createdTours || 0,
                    friends: friendCount
                }
            };
        }
        return user;
    },

    async searchUsers(query: string, limit: number = 10, page: number = 1) {
        return await userRepository.searchUsers(query, limit, page);
    },

    async createUserByEmail(email: string) {
        const user = await userRepository.createUser({
            email,
            name: email.split('@')[0].substring(0, 25), // Default name from email
        });
        return { ...user, level: LevelSystem.getLevel(user.xp) };
    },

    async addXp(userId: number, amount: number) {
        // Just add XP, don't update level in DB
        const updatedUser = await userRepository.addXp(userId, amount);

        // Return user with dynamically calculated level
        return {
            ...updatedUser,
            level: LevelSystem.getLevel(updatedUser.xp)
        };
    },

    async addTokens(userId: number, amount: number) {
        return await userRepository.addTokens(userId, amount);
    },

    async updateUser(userId: number, data: { name?: string; avatarUrl?: string; username?: string; referralCode?: string }) {
        const user = await userRepository.updateUser(userId, data);
        return { ...user, level: LevelSystem.getLevel(user.xp) };
    },

    async claimReferral(userId: number, code: string) {
        return await userRepository.claimReferral(userId, code);
    },

    async getUserPlayedTours(userId: number, page: number = 1, limit: number = 10) {
        return await userRepository.getUserPlayedTours(userId, page, limit);
    },

    async getUserCreatedTours(userId: number, page: number = 1, limit: number = 10) {
        return await userRepository.getUserCreatedTours(userId, page, limit);
    },

    async getPurchase(transactionId: string) {
        return await userRepository.getPurchase(transactionId);
    },

    async createPurchase(userId: number, data: any) {
        return await userRepository.createPurchase(userId, data);
    },

    async deleteUser(userId: number) {
        return await userRepository.deleteUser(userId);
    }
};
