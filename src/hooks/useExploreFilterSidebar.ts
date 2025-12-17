import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions } from 'react-native';
import { useStore } from '../store/store';
import { TourFilters } from '../types/filters';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

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
        const emptyFilters: TourFilters = {};
        setLocalFilters(emptyFilters);
        setGlobalFilters(emptyFilters);
        // Don't close, or maybe close? User usually expects clear to just reset form.
        // But "Clear Filters" button in their snippet does NOT close in logic provided? 
        // "onClear={() => { ... }}" in prop.
        // I will just clear local and global and keep open to let them verify. 
        // Or common pattern: clear and close?
        // User snippet: `onClear`.
    };

    const [expandedSections, setExpandedSections] = useState({
        location: false,
        sort: false,
        modes: false,
        difficulty: false,
        distance: false,
        duration: false,
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
        SIDEBAR_WIDTH
    };
};
