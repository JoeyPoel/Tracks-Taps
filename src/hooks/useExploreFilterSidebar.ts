import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { useStore } from '../store/store';
import { TourFilters } from '../types/filters';

import { useAppWidth } from './useAppWidth';

export const useExploreFilterSidebar = (visible: boolean, onClose: () => void) => {
    const appWidth = useAppWidth();
    const SIDEBAR_WIDTH = Math.min(appWidth * 0.7, 300);
    const slideAnim = useRef(new Animated.Value(appWidth)).current; // Start off-screen
    const opacityAnim = useRef(new Animated.Value(0)).current; // Start transparent
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
                duration: false,
                genre: false,
            });
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0, // Slide to natural position (right: 0)
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: appWidth, // Slide out to the right
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [visible, currentGlobalFilters, appWidth]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: appWidth,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => onClose());
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
        duration: false,
        genre: false,
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const updateFilter = (key: keyof TourFilters, value: any) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
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
        opacityAnim,
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
