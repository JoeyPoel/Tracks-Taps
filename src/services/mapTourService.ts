import { prisma } from '../lib/prisma';

export const mapTourService = {
    async getTours() {
        return await prisma.tour.findMany({
            include: {
                stops: true,
            },
        });
    },
}