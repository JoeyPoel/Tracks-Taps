import { prisma } from '../../src/lib/prisma';
import { userRepository } from '../repositories/userRepository';
import { supabaseAdminRole } from '../utils/auth';

/**
 * Controller to handle administrative functionalities.
 */
export const adminController = {
    /**
     * Checks if the user with the given userId is an administrator.
     */
    async isUserAdmin(userId: number): Promise<boolean> {
        const user = await userRepository.getUserProfile(userId);
        return !!(user && user.isAdmin);
    },

    /**
     * Retrieves overall system statistics.
     */
    async getStats(request: Request) {
        const { searchParams } = new URL(request.url);
        const userId = Number(searchParams.get('userId'));

        if (!userId || isNaN(userId)) {
            return Response.json({ error: 'Missing or invalid userId' }, { status: 400 });
        }

        const isAdmin = await this.isUserAdmin(userId);
        if (!isAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            const [
                totalUsers,
                totalTours,
                activeToursCount,
                purchaseAgg,
                toursByStatus
            ] = await Promise.all([
                prisma.user.count(),
                prisma.tour.count(),
                prisma.activeTour.count(),
                prisma.purchase.aggregate({
                    _count: { id: true },
                    _sum: { tokens: true }
                }),
                prisma.tour.groupBy({
                    by: ['status'],
                    _count: { id: true }
                })
            ]);

            // Format tour status counts
            const tourStatusCounts: Record<string, number> = {
                DRAFT: 0,
                PENDING_REVIEW: 0,
                PUBLISHED: 0,
                REJECTED: 0
            };
            toursByStatus.forEach(group => {
                tourStatusCounts[group.status] = group._count.id;
            });

            return Response.json({
                users: totalUsers,
                tours: totalTours,
                activeSessions: activeToursCount,
                purchasesCount: purchaseAgg._count.id,
                tokensPurchased: purchaseAgg._sum.tokens || 0,
                tourStatusCounts
            });
        } catch (error: any) {
            console.error('Error fetching admin statistics:', error);
            return Response.json({ error: 'Failed to fetch admin stats', details: error.message }, { status: 500 });
        }
    },

    /**
     * Retrieves a list of tours that are pending review.
     */
    async getPendingTours(request: Request) {
        const { searchParams } = new URL(request.url);
        const userId = Number(searchParams.get('userId'));

        if (!userId || isNaN(userId)) {
            return Response.json({ error: 'Missing or invalid userId' }, { status: 400 });
        }

        const isAdmin = await this.isUserAdmin(userId);
        if (!isAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            const pendingTours = await prisma.tour.findMany({
                where: {
                    status: 'PENDING_REVIEW'
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    location: true,
                    imageUrl: true,
                    distance: true,
                    duration: true,
                    points: true,
                    createdAt: true,
                    author: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true,
                            isAdmin: true
                        }
                    },
                    stops: {
                        orderBy: { number: 'asc' },
                        select: {
                            id: true,
                            number: true,
                            name: true,
                            description: true,
                            longitude: true,
                            latitude: true,
                            type: true,
                            challenges: {
                                select: {
                                    id: true,
                                    title: true,
                                    type: true,
                                    points: true,
                                    content: true,
                                    hint: true,
                                    answer: true,
                                    options: true
                                }
                            }
                        }
                    },
                    challenges: {
                        where: { stopId: null },
                        select: {
                            id: true,
                            title: true,
                            type: true,
                            points: true,
                            content: true,
                            hint: true,
                            answer: true,
                            options: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });

            return Response.json(pendingTours);
        } catch (error: any) {
            console.error('Error fetching pending tours:', error);
            return Response.json({ error: 'Failed to fetch pending tours', details: error.message }, { status: 500 });
        }
    },

    /**
     * Updates the status of a specific tour (e.g. approve/reject).
     */
    async updateTourStatus(request: Request, body: any) {
        const { userId, tourId, status, rejectionReason } = body;

        if (!userId || !tourId || !status) {
            return Response.json({ error: 'Missing required fields: userId, tourId, or status' }, { status: 400 });
        }

        if (status !== 'PUBLISHED' && status !== 'REJECTED') {
            return Response.json({ error: 'Invalid status. Must be PUBLISHED or REJECTED' }, { status: 400 });
        }

        const isAdmin = await this.isUserAdmin(Number(userId));
        if (!isAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            const updatedTour = await prisma.tour.update({
                where: {
                    id: Number(tourId)
                },
                data: {
                    status,
                    rejectionReason: status === 'REJECTED' ? (rejectionReason || null) : null
                },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    rejectionReason: true
                }
            });

            return Response.json({ success: true, tour: updatedTour });
        } catch (error: any) {
            console.error('Error updating tour status:', error);
            return Response.json({ error: 'Failed to update tour status', details: error.message }, { status: 500 });
        }
    },

    /**
     * Retrieves overall system users.
     */
    async getUsers(request: Request) {
        const { searchParams } = new URL(request.url);
        const userId = Number(searchParams.get('userId'));
        const query = searchParams.get('query') || '';

        if (!userId || isNaN(userId)) {
            return Response.json({ error: 'Missing or invalid userId' }, { status: 400 });
        }

        const isAdmin = await this.isUserAdmin(userId);
        if (!isAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            const users = await prisma.user.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { email: { contains: query, mode: 'insensitive' } }
                    ]
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    isAdmin: true,
                    createdAt: true,
                    xp: true,
                    tokens: true,
                    customTheme: true,
                    _count: {
                        select: {
                            createdTours: true,
                            playedTours: true,
                            reviews: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 100
            });

            return Response.json(users);
        } catch (error: any) {
            console.error('Error fetching users:', error);
            return Response.json({ error: 'Failed to fetch users', details: error.message }, { status: 500 });
        }
    },

    /**
     * Retrieves overall system reviews.
     */
    async getReviews(request: Request) {
        const { searchParams } = new URL(request.url);
        const userId = Number(searchParams.get('userId'));
        const query = searchParams.get('query') || '';

        if (!userId || isNaN(userId)) {
            return Response.json({ error: 'Missing or invalid userId' }, { status: 400 });
        }

        const isAdmin = await this.isUserAdmin(userId);
        if (!isAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            const reviews = await prisma.review.findMany({
                where: {
                    OR: [
                        { content: { contains: query, mode: 'insensitive' } },
                        { tour: { title: { contains: query, mode: 'insensitive' } } },
                        { author: { name: { contains: query, mode: 'insensitive' } } }
                    ]
                },
                select: {
                    id: true,
                    content: true,
                    rating: true,
                    createdAt: true,
                    author: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true
                        }
                    },
                    tour: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 100
            });

            return Response.json(reviews);
        } catch (error: any) {
            console.error('Error fetching reviews:', error);
            return Response.json({ error: 'Failed to fetch reviews', details: error.message }, { status: 500 });
        }
    },

    /**
     * Toggles the admin status of a user.
     */
    async toggleUserAdmin(request: Request, body: any) {
        const { userId, targetUserId, isAdmin } = body;

        if (!userId || !targetUserId || isAdmin === undefined) {
            return Response.json({ error: 'Missing required fields: userId, targetUserId, or isAdmin' }, { status: 400 });
        }

        if (Number(userId) === Number(targetUserId)) {
            return Response.json({ error: 'Cannot toggle your own admin status' }, { status: 400 });
        }

        const actingUserIsAdmin = await this.isUserAdmin(Number(userId));
        if (!actingUserIsAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            const updatedUser = await prisma.user.update({
                where: { id: Number(targetUserId) },
                data: { isAdmin: !!isAdmin },
                select: {
                    id: true,
                    name: true,
                    isAdmin: true
                }
            });

            return Response.json({ success: true, user: updatedUser });
        } catch (error: any) {
            console.error('Error toggling user admin:', error);
            return Response.json({ error: 'Failed to toggle user admin status', details: error.message }, { status: 500 });
        }
    },

    /**
     * Deletes a user account completely (anonymizing tours, deleting relation data).
     */
    async deleteUser(request: Request, body: any) {
        const { userId, targetUserId } = body;

        if (!userId || !targetUserId) {
            return Response.json({ error: 'Missing required fields: userId or targetUserId' }, { status: 400 });
        }

        if (Number(userId) === Number(targetUserId)) {
            return Response.json({ error: 'Cannot delete yourself' }, { status: 400 });
        }

        const actingUserIsAdmin = await this.isUserAdmin(Number(userId));
        if (!actingUserIsAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            const deletedUser = await userRepository.deleteUser(Number(targetUserId));
            
            if (deletedUser && deletedUser.authId && supabaseAdminRole) {
                try {
                    const { error } = await supabaseAdminRole.auth.admin.deleteUser(deletedUser.authId);
                    if (error) {
                        console.error('Failed to delete user from Supabase Auth:', error);
                    } else {
                        console.log(`Successfully deleted user ${deletedUser.authId} from Supabase Auth`);
                    }
                } catch (err) {
                    console.error('Failed to delete user from Supabase Auth (caught):', err);
                }
            }

            return Response.json({ success: true, message: 'User deleted successfully' });
        } catch (error: any) {
            console.error('Error deleting user:', error);
            return Response.json({ error: 'Failed to delete user', details: error.message }, { status: 500 });
        }
    },

    /**
     * Deletes a specific review.
     */
    async deleteReview(request: Request, body: any) {
        const { userId, reviewId } = body;

        if (!userId || !reviewId) {
            return Response.json({ error: 'Missing required fields: userId or reviewId' }, { status: 400 });
        }

        const actingUserIsAdmin = await this.isUserAdmin(Number(userId));
        if (!actingUserIsAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            await prisma.review.delete({
                where: { id: Number(reviewId) }
            });

            return Response.json({ success: true, message: 'Review deleted successfully' });
        } catch (error: any) {
            console.error('Error deleting review:', error);
            return Response.json({ error: 'Failed to delete review', details: error.message }, { status: 500 });
        }
    },

    /**
     * Updates details of a user.
     */
    async updateUser(request: Request, body: any) {
        const { userId, targetUserId, name, email, tokens, xp, customTheme } = body;

        if (!userId || !targetUserId) {
            return Response.json({ error: 'Missing userId or targetUserId' }, { status: 400 });
        }

        const actingUserIsAdmin = await this.isUserAdmin(Number(userId));
        if (!actingUserIsAdmin) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        try {
            const dataToUpdate: any = {};
            if (name !== undefined) dataToUpdate.name = name;
            if (email !== undefined) dataToUpdate.email = email || null;
            if (tokens !== undefined) dataToUpdate.tokens = Number(tokens);
            if (customTheme !== undefined) dataToUpdate.customTheme = customTheme || null;
            if (xp !== undefined) {
                const newXp = Number(xp);
                dataToUpdate.xp = newXp;

                // Auto compute level on backend based on cumulative XP
                let level = 1;
                let currentXp = newXp;
                const base_xp = 500;
                const multiplier = 1.2;

                const getXpForLevel = (lvl: number) => {
                    if (lvl < 1) return 0;
                    const rawXp = base_xp * Math.pow(multiplier, lvl - 1);
                    if (rawXp >= 10000) {
                        return Math.round(rawXp / 1000) * 1000;
                    }
                    return Math.max(500, Math.round(rawXp / 500) * 500);
                };

                let xpNeeded = getXpForLevel(level);
                while (currentXp >= xpNeeded) {
                    currentXp -= xpNeeded;
                    level++;
                    xpNeeded = getXpForLevel(level);
                }
                dataToUpdate.level = level;
            }

            const updatedUser = await prisma.user.update({
                where: { id: Number(targetUserId) },
                data: dataToUpdate,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    isAdmin: true,
                    createdAt: true,
                    xp: true,
                    tokens: true,
                    customTheme: true,
                    _count: {
                        select: {
                            createdTours: true,
                            playedTours: true,
                            reviews: true
                        }
                    }
                }
            });

            return Response.json({ success: true, user: updatedUser });
        } catch (error: any) {
            console.error('Error updating user:', error);
            return Response.json({ error: 'Failed to update user', details: error.message }, { status: 500 });
        }
    }
};
