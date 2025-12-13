import { LevelSystem } from '../../src/utils/levelUtils';
import { userRepository } from '../repositories/userRepository';

export const userService = {
    async getUserProfile(userId: number) {
        const user = await userRepository.getUserProfile(userId);
        if (user) {
            return { ...user, level: LevelSystem.getLevel(user.xp) };
        }
        return user;
    },

    async getUserByEmail(email: string) {
        const user = await userRepository.getUserByEmail(email);
        if (user) {
            return { ...user, level: LevelSystem.getLevel(user.xp) };
        }
        return user;
    },

    async createUserByEmail(email: string) {
        const user = await userRepository.createUser({
            email,
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
};
