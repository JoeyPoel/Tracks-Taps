import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import * as Location from 'expo-location';
import { useStore } from '../store/store';
import { TourFilters } from '../types/filters';

import { useAppWidth } from './useAppWidth';

export const useExploreFilterSidebar = (visible: boolean, onClose: () => void) => {
    const appWidth = useAppWidth();
    const SIDEBAR_WIDTH = Math.min(appWidth * 0.7, 300);
    const slideAnim = useRef(new Animated.Value(appWidth)).current; // Start off-screen
    const currentGlobalFilters = useStore(state => state.tourFilters);
    const setGlobalFilters = useStore(state => state.setTourFilters);

    const [localFilters, setLocalFilters] = useState<TourFilters>(currentGlobalFilters);

    // Sync local filters when sidebar opens
    useEffect(() => {
        if (visible) {
            setLocalFilters(currentGlobalFilters);
            setExpandedSections({
                location: false,
                sort: false,
                modes: false,
                difficulty: false,
                distance: false,
                duration: false,
                genre: false,
            });
            Animated.timing(slideAnim, {
                toValue: 0, // Slide to natural position (right: 0)
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: appWidth, // Slide out to the right
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, currentGlobalFilters, appWidth]);

    const handleClose = () => {
        Animated.timing(slideAnim, {
            toValue: appWidth,
            duration: 300,
            useNativeDriver: true,
        }).start(() => onClose());
    };

    const handleApply = () => {
        setGlobalFilters(localFilters);
        handleClose();
    };

    const handleClear = () => {
        // Reset to defaults including SearchQuery preservation if desired, 
        // but here we want to reset to the 'newest' sort default.
        const emptyFilters: TourFilters = {
            searchQuery: currentGlobalFilters.searchQuery,
            sortBy: 'createdAt',
            sortOrder: 'desc'
        };
        setLocalFilters(emptyFilters);
        setGlobalFilters(emptyFilters);
    };

    const [expandedSections, setExpandedSections] = useState({
        location: false,
        sort: false,
        modes: false,
        difficulty: false,
        distance: false,
        duration: false,
        genre: false,
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const updateFilter = async (key: keyof TourFilters, value: any) => {
        let newFilters = { ...localFilters, [key]: value };

        // Special handling for distance sorting to fetch location
        if (key === 'sortBy' && value === 'distanceFromUser') {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({});
                    newFilters.userLat = location.coords.latitude;
                    newFilters.userLng = location.coords.longitude;
                    newFilters.sortOrder = 'asc'; // Proximity always asc
                } else {
                    // If denied, fallback to createdAt or alert? For now just don't set distance
                    console.warn('Location permission denied');
                }
            } catch (error) {
                console.error('Error fetching location:', error);
            }
        } else if (key === 'sortBy' && value !== 'distanceFromUser') {
            // Clear coordinates if user switches away from distance sort
            newFilters.userLat = undefined;
            newFilters.userLng = undefined;
        }

        setLocalFilters(newFilters);
    };

    const toggleMode = (mode: string) => {
        setLocalFilters(prev => {
            const currentModes = prev.modes || [];
            if (currentModes.includes(mode)) {
                return { ...prev, modes: currentModes.filter(m => m !== mode) };
            } else {
                return { ...prev, modes: [...currentModes, mode] };
            }
        });
    };

    const toggleGenre = (genreId: string) => {
        setLocalFilters(prev => {
            const currentGenres = prev.genres || [];
            if (currentGenres.includes(genreId)) {
                return { ...prev, genres: currentGenres.filter(g => g !== genreId) };
            } else {
                return { ...prev, genres: [...currentGenres, genreId] };
            }
        });
    };

    return {
        slideAnim,
        localFilters,
        expandedSections,
        handleClose,
        handleApply,
        handleClear,
        toggleSection,
        updateFilter,
        toggleMode,
        toggleGenre,
        SIDEBAR_WIDTH
    };
};
