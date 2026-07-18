import { Prisma } from '@prisma/client';
import { tourRepository } from '../repositories/tourRepository';
import { achievementService } from './achievementService';
import { emailService } from './emailService';
import { prisma } from '../../src/lib/prisma';

import { TourFilters } from '../../src/types/filters';

export const tourService = {
    async getAllTours(filters?: TourFilters) {
        return await tourRepository.getAllTours(filters);
    },

    async getTourById(id: number, reviewsSortBy?: string, lightweight?: boolean) {
        return await tourRepository.getTourById(id, reviewsSortBy, lightweight);
    },

    async createTour(data: Prisma.TourCreateInput) {
        const tour = await tourRepository.createTour(data);
        if (data.author && data.author.connect && data.author.connect.id) {
            await achievementService.checkCreatedToursCount(data.author.connect.id);
        }
        // Send email alert to admin
        try {
            const authorId = data.author?.connect?.id || tour.authorId;
            const author = authorId ? await prisma.user.findUnique({ where: { id: authorId } }) : null;
            emailService.sendAdminReviewAlert({
                id: tour.id,
                title: tour.title,
                location: tour.location,
                description: tour.description || '',
                authorName: author?.name || 'Anonymous'
            }).catch(err => console.error('Failed to trigger email alert:', err));
        } catch (emailErr) {
            console.error('Failed to prepare email alert details:', emailErr);
        }
        return tour;
    },

    async createTourByJson(data: any, userId: number) {
        // Ensure strictly necessary fields match Prisma Input
        // This is a minimal mapping. Further validation might be needed depending on the JSON source.
        console.log("INCOMING JSON CHALLENGES:", data.challenges ? data.challenges.length : 'undefined', "BINGO:", data.modes?.includes("BINGO"));
        const tourInput: Prisma.TourCreateInput = {
            title: data.title,
            location: data.location,
            description: data.description || '',
            imageUrl: data.imageUrl || '',
            distance: typeof data.distance === 'string' ? parseFloat(data.distance) : data.distance || 0,
            duration: typeof data.duration === 'string' ? parseInt(data.duration) : data.duration || 0,
            points: typeof data.points === 'string' ? parseInt(data.points) : data.points || 0,
            modes: data.modes || [],
            difficulty: data.difficulty || 'MEDIUM',
            status: 'PENDING_REVIEW',
            type: data.type || 'DAY_TRIP',
            genre: data.genre || 'General',

            author: {
                connect: { id: userId }
            },

            stops: {
                create: Array.isArray(data.stops) ? data.stops.map((stop: any) => ({
                    number: stop.number,
                    name: stop.name,
                    description: stop.description || '',
                    detailedDescription: stop.detailedDescription || '',
                    imageUrl: stop.imageUrl || '',
                    latitude: stop.latitude,
                    longitude: stop.longitude,
                    type: stop.type || 'Viewpoint',
                    pubgolfPar: stop.pubgolfPar || null,
                    pubgolfDrink: stop.pubgolfDrink || null,
                    // Map nested challenges for this stop
                    challenges: {
                        create: Array.isArray(stop.challenges) ? stop.challenges.map((c: any) => ({
                            title: c.title,
                            type: c.type,
                            points: c.points || 10,
                            content: c.content || '',
                            hint: c.hint || '',
                            answer: c.answer || '',
                            options: c.options || []
                        })) : []
                    }
                })) : []
            },

            // Global challenges (not linked to stops)
            challenges: {
                create: Array.isArray(data.challenges) ? data.challenges.map((c: any) => ({
                    title: c.title,
                    type: c.type,
                    points: c.points || 10,
                    content: c.content || '',
                    hint: c.hint || '',
                    answer: c.answer || '',
                    options: c.options || [],
                    bingoRow: c.bingoRow !== undefined ? c.bingoRow : null,
                    bingoCol: c.bingoCol !== undefined ? c.bingoCol : null
                })) : []
            }
        };

        const createdTour = await tourRepository.createTourByJson(tourInput);
        try {
            const author = await prisma.user.findUnique({ where: { id: userId } });
            emailService.sendAdminReviewAlert({
                id: createdTour.id,
                title: createdTour.title,
                location: createdTour.location,
                description: createdTour.description || '',
                authorName: author?.name || 'Anonymous'
            }).catch(err => console.error('Failed to trigger email alert:', err));
        } catch (emailErr) {
            console.error('Failed to prepare email alert details:', emailErr);
        }
        return createdTour;
    },
    async updateTour(id: number, data: any) {
        const existingTour = await prisma.tour.findUnique({
            where: { id },
            select: { status: true, authorId: true }
        });
        const currentStatus = existingTour?.status || 'PENDING_REVIEW';

        let newStatus = data.status || currentStatus;
        let newRejectionReason = data.rejectionReason;

        // If the tour was previously REJECTED, and we are updating it,
        // automatically change its status back to PENDING_REVIEW and clear the rejectionReason.
        let triggerAlert = false;
        if (currentStatus === 'REJECTED') {
            newStatus = 'PENDING_REVIEW';
            newRejectionReason = null; // Clear rejection comment
            triggerAlert = true;
        }

        const tourInput: Prisma.TourUpdateInput = {
            title: data.title,
            location: data.location,
            description: data.description,
            imageUrl: data.imageUrl,
            distance: typeof data.distance === 'string' ? parseFloat(data.distance) : data.distance,
            duration: typeof data.duration === 'string' ? parseInt(data.duration) : data.duration,
            points: typeof data.points === 'string' ? parseInt(data.points) : data.points,
            modes: data.modes,
            difficulty: data.difficulty,
            type: data.type,
            genre: data.genre,
            status: newStatus,
            rejectionReason: newRejectionReason,
            startLat: data.startLat ? parseFloat(data.startLat) : null,
            startLng: data.startLng ? parseFloat(data.startLng) : null,

            stops: {
                deleteMany: {}, // Clear existing stops (simplest update strategy)
                create: Array.isArray(data.stops) ? data.stops.map((stop: any) => ({
                    number: stop.number,
                    name: stop.name,
                    description: stop.description || '',
                    detailedDescription: stop.detailedDescription || '',
                    imageUrl: stop.imageUrl || '',
                    latitude: parseFloat(stop.latitude),
                    longitude: parseFloat(stop.longitude),
                    type: stop.type || 'Viewpoint',
                    pubgolfPar: stop.pubgolfPar || null,
                    pubgolfDrink: stop.pubgolfDrink || null,
                    challenges: {
                        create: Array.isArray(stop.challenges) ? stop.challenges.map((c: any) => ({
                            title: c.title,
                            type: c.type,
                            points: parseInt(c.points) || 10,
                            content: c.content || '',
                            hint: c.hint || '',
                            answer: c.answer || '',
                            options: c.options || []
                        })) : []
                    }
                })) : []
            },

            challenges: {
                deleteMany: {}, // Clear existing global challenges
                create: Array.isArray(data.challenges) ? data.challenges.map((c: any) => ({
                    title: c.title,
                    type: c.type,
                    points: parseInt(c.points) || 10,
                    content: c.content || '',
                    hint: c.hint || '',
                    answer: c.answer || '',
                    options: c.options || [],
                    bingoRow: c.bingoRow,
                    bingoCol: c.bingoCol
                })) : []
            }
        };

        const updatedTour = await tourRepository.updateTour(id, tourInput);

        // If it was REJECTED and now edited, send review email alert to admin
        if (triggerAlert) {
            try {
                const authorId = existingTour?.authorId;
                const author = authorId ? await prisma.user.findUnique({ where: { id: authorId } }) : null;
                emailService.sendAdminReviewAlert({
                    id: updatedTour.id,
                    title: updatedTour.title,
                    location: updatedTour.location,
                    description: updatedTour.description || '',
                    authorName: author?.name || 'Anonymous'
                }).catch(err => console.error('Failed to trigger update email alert:', err));
            } catch (emailErr) {
                console.error('Failed to prepare update email alert details:', emailErr);
            }
        }

        return updatedTour;
    },
    async deleteTour(id: number) {
        return await tourRepository.deleteTour(id);
    }
};
