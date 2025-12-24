
import { useLanguage } from '@/src/context/LanguageContext';
import { StopType } from '@/src/types/models';
import { createStopPayload, validateStop } from '@/src/utils/create/stopUtils';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useStopLocation } from './useStopLocation';

export interface StopFormState {
    name: string;
    description: string;
    detailedDescription: string;
    imageUrl: string;
    type: StopType;
    isPubGolfStop: boolean;
    drink: string;
    par: string;
    marker: { latitude: number; longitude: number } | null;
}

export function useStopForm(
    onSave: (stop: any) => void,
    visible: boolean,
    modes: string[],
    existingStops: any[],
    initialData?: any
) {
    const { t } = useLanguage();
    const isPubGolfEnabled = modes.includes('PUBGOLF');

    // Location Hook
    const { region, setRegion } = useStopLocation(visible, existingStops, initialData);

    const [formState, setFormState] = useState<StopFormState>({
        name: '',
        description: '',
        detailedDescription: '',
        imageUrl: '',
        type: StopType.Viewpoint,
        isPubGolfStop: false,
        drink: '',
        par: '3',
        marker: null,
    });

    // Initialize form when visible or initialData changes
    useEffect(() => {
        if (visible) {
            if (initialData) {
                setFormState({
                    name: initialData.name || '',
                    description: initialData.description || '',
                    detailedDescription: initialData.detailedDescription || '',
                    imageUrl: initialData.imageUrl || '',
                    type: initialData.type || StopType.Viewpoint,
                    isPubGolfStop: !!initialData.pubgolfDrink, // If it has a drink, it's a pub golf stop
                    drink: initialData.pubgolfDrink || '',
                    par: initialData.pubgolfPar ? String(initialData.pubgolfPar) : '3',
                    marker: {
                        latitude: initialData.latitude,
                        longitude: initialData.longitude
                    },
                });
            } else {
                // Reset to defaults for new stop
                setFormState({
                    name: '',
                    description: '',
                    detailedDescription: '',
                    imageUrl: '',
                    type: StopType.Viewpoint,
                    isPubGolfStop: false,
                    drink: '',
                    par: '3',
                    marker: null,
                });
            }
        }
    }, [visible, initialData]);

    const updateField = <K extends keyof StopFormState>(key: K, value: StopFormState[K]) => {
        setFormState(prev => ({ ...prev, [key]: value }));
    };

    const resetForm = () => {
        setFormState(prev => ({
            ...prev,
            name: '',
            description: '',
            detailedDescription: '',
            imageUrl: '',
            type: StopType.Viewpoint,
            isPubGolfStop: false,
            drink: '',
            par: '3',
            marker: null, // Reset marker but region stays focused
        }));
    };

    const handleSave = () => {
        const validation = validateStop(formState, isPubGolfEnabled, t as any);
        if (!validation.valid && validation.message && validation.title) {
            Alert.alert(validation.title, validation.message);
            return;
        }

        const payload = createStopPayload(formState, isPubGolfEnabled);

        // Preserve ID and other fields if editing
        if (initialData) {
            onSave({
                ...initialData,
                ...payload,
                // Make sure we keep the challenges
                challenges: initialData.challenges
            });
        } else {
            onSave(payload);
        }

        resetForm();
    };

    return {
        formState,
        region,
        setRegion,
        isPubGolfEnabled,
        updateField,
        handleSave,
        resetForm
    };
}
