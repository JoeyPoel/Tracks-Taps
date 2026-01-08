import { randomInt } from 'crypto';
import { LevelSystem } from '../../src/utils/levelUtils';
import { userRepository } from '../repositories/userRepository';

export const userService = {
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
            const { _count, ...rest } = user as any;
            return {
                ...rest,
                level: LevelSystem.getLevel(user.xp),
                stats: {
                    toursDone: _count?.playedTours || 0,
                    toursCreated: _count?.createdTours || 0
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
            const { _count, ...rest } = user as any;
            return {
                ...rest,
                level: LevelSystem.getLevel(user.xp),
                stats: {
                    toursDone: _count?.playedTours || 0,
                    toursCreated: _count?.createdTours || 0
                }
            };
        }
        return user;
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

    async updateUser(userId: number, data: { name?: string; avatarUrl?: string; referralCode?: string }) {
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
    }
};
