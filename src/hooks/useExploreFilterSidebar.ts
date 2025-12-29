import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions } from 'react-native';
import { useStore } from '../store/store';
import { TourFilters } from '../types/filters';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(width * 0.7, 300);

export const useExploreFilterSidebar = (visible: boolean, onClose: () => void) => {
    const slideAnim = useRef(new Animated.Value(width)).current; // Start off-screen
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
                toValue: width, // Slide out to the right
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, currentGlobalFilters]);

    const handleClose = () => {
        Animated.timing(slideAnim, {
            toValue: width,
            duration: 300,
            useNativeDriver: true,
        }).start(() => onClose());
    };

    const handleApply = () => {
        setGlobalFilters(localFilters);
        handleClose();
    };

    const handleClear = () => {
        // Create empty filters but preserve the current search query (text input)
        // because users typically expect "Clear Filters" to clear the sidebar options, not the main search bar.
        const emptyFilters: TourFilters = {
            searchQuery: currentGlobalFilters.searchQuery
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

    const updateFilter = (key: keyof TourFilters, value: any) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: value
        }));
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
