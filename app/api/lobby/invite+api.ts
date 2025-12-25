import { verifyAuth } from '@/backend/utils/auth';
import { prisma } from '@/src/lib/prisma';

export async function POST(request: Request) {
    try {
        const user = await verifyAuth(request);
        if (!user || !user.email) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
        });

        if (!dbUser) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await request.json();
        const { friendIds, activeTourId } = body;

        if (!friendIds || !Array.isArray(friendIds) || !activeTourId) {
            return Response.json({ error: 'friendIds (array) and activeTourId are required' }, { status: 400 });
        }

        // Verify Active Tour exists
        const tour = await prisma.activeTour.findUnique({
            where: { id: activeTourId },
            include: { tour: true }
        });

        if (!tour) {
            return Response.json({ error: 'Active Tour not found' }, { status: 404 });
        }

        // Create notifications for each friend
        // We could batch this, but strict mode might not support createMany well if strict.
        // Assuming Postgres, createMany is fine.
        await prisma.notification.createMany({
            data: friendIds.map(friendId => ({
                userId: friendId,
                type: 'GAME_INVITE',
                title: 'Game Invitation',
                message: `${dbUser.name} invited you to join "${tour.tour.title}"!`,
                data: JSON.stringify({ activeTourId }),
            }))
        });

        return Response.json({ message: 'Invites sent' });

    } catch (error) {
        console.error('Error sending lobby invites:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
