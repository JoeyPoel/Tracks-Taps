
import { useLanguage } from '@/src/context/LanguageContext';
import { StopType } from '@/src/types/models';
import { createStopPayload, validateStop } from '@/src/utils/create/stopUtils';
import { useState } from 'react';
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
    existingStops: any[]
) {
    const { t } = useLanguage();
    const isPubGolfEnabled = modes.includes('PUBGOLF');

    // Location Hook
    const { region, setRegion } = useStopLocation(visible, existingStops);

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

        onSave(createStopPayload(formState, isPubGolfEnabled));
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
