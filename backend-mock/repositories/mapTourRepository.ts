import { prisma } from '../../src/lib/prisma';

export const mapTourRepository = {
    async getTours() {
        return await prisma.tour.findMany({
            include: {
                stops: true,
            },
        });
    },
};
