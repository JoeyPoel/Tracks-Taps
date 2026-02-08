import { Prisma } from '@prisma/client';
import { tourRepository } from '../repositories/tourRepository';
import { achievementService } from './achievementService';

import { TourFilters } from '../../src/types/filters';

export const tourService = {
    async getAllTours(filters?: TourFilters) {
        return await tourRepository.getAllTours(filters);
    },

    async getTourById(id: number) {
        return await tourRepository.getTourById(id);
    },

    async createTour(data: Prisma.TourCreateInput) {
        const tour = await tourRepository.createTour(data);
        // data.author.connect.id is how author is linked usually
        if (data.author && data.author.connect && data.author.connect.id) {
            await achievementService.checkCreatedToursCount(data.author.connect.id);
        }
        return tour;
    },

    async createTourByJson(data: any, userId: number) {
        // Ensure strictly necessary fields match Prisma Input
        // This is a minimal mapping. Further validation might be needed depending on the JSON source.
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
                    latitude: stop.latitude,
                    longitude: stop.longitude,
                    type: stop.type || 'Viewpoint',
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
                    options: c.options || []
                })) : []
            }
        };

        return await tourRepository.createTourByJson(tourInput);
    },
    async updateTour(id: number, data: any) {
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
            status: data.status || 'PENDING_REVIEW',
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

        return await tourRepository.updateTour(id, tourInput);
    },
};
