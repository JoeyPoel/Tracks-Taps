import { userRepository } from '../repositories/userRepository';

export const userService = {
    async getUserProfile(userId: number) {
        return await userRepository.getUserProfile(userId);
    },

    async getUserByEmail(email: string) {
        return await userRepository.getUserByEmail(email);
    },

    async addXp(userId: number, amount: number) {
        return await userRepository.addXp(userId, amount);
    },
};
