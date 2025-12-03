import { prisma } from '../../src/lib/prisma';

export const challengeRepository = {
    async findChallengeById(id: number) {
        return await prisma.challenge.findUnique({
            where: { id },
        });
    },
};
