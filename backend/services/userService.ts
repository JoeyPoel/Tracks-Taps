import { LevelSystem } from '../../src/utils/levelUtils';
import { userRepository } from '../repositories/userRepository';

export const userService = {
    async getUserProfile(userId: number) {
        const user = await userRepository.getUserProfile(userId);
        if (user) {
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

    async createUserByEmail(email: string, password?: string) {
        const user = await userRepository.createUser({
            email,
            password,
            name: email.split('@')[0], // Default name from email
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

    async updateUser(userId: number, data: { name?: string; avatarUrl?: string }) {
        const user = await userRepository.updateUser(userId, data);
        return { ...user, level: LevelSystem.getLevel(user.xp) };
    },

    async claimReferral(userId: number, code: string) {
        return await userRepository.claimReferral(userId, code);
    },
};
